const FILE_CODE = 9994

const SHAPE_TYPE = {
  NULL: 0,
  POINT: 1,
  POLYLINE: 3,
  POLYGON: 5,
  MULTIPOINT: 8,
  POINT_Z: 11,
  POLYLINE_Z: 13,
  POLYGON_Z: 15,
  MULTIPOINT_Z: 18,
  POINT_M: 21,
  POLYLINE_M: 23,
  POLYGON_M: 25,
  MULTIPOINT_M: 28
}

const LITTLE_ENDIAN = true
const BIG_ENDIAN = false

const ringArea = (ring) => {
  let area = 0
  for (let i = 0; i < ring.length; i += 1) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    area += x1 * y2 - x2 * y1
  }
  return area / 2
}

const orientRing = (ring, clockwise) => {
  const area = ringArea(ring)
  const isClockwise = area < 0
  if (ring.length === 0) {
    return []
  }
  if (isClockwise === clockwise) {
    return ring.slice()
  }
  const reversed = ring.slice().reverse()
  return reversed
}

const parsePointCoordinates = (view, offset) => [
  view.getFloat64(offset, LITTLE_ENDIAN),
  view.getFloat64(offset + 8, LITTLE_ENDIAN)
]

const parsePointGeometry = (view, offset) => ({
  geometry: { type: 'Point', coordinates: parsePointCoordinates(view, offset) },
  bytesRead: 16
})

const parseMultiPointGeometry = (view, offset) => {
  // skip bounding box (32 bytes)
  offset += 32
  const numPoints = view.getInt32(offset, LITTLE_ENDIAN)
  offset += 4
  const coordinates = []
  for (let i = 0; i < numPoints; i += 1) {
    const pointOffset = offset + i * 16
    coordinates.push(parsePointCoordinates(view, pointOffset))
  }

  return {
    geometry:
      coordinates.length === 1
        ? { type: 'Point', coordinates: coordinates[0] }
        : { type: 'MultiPoint', coordinates },
    bytesRead: 32 + 4 + numPoints * 16
  }
}

const parseParts = (view, offset) => {
  // skip bounding box (32 bytes)
  const headerOffset = offset + 32
  const numParts = view.getInt32(headerOffset, LITTLE_ENDIAN)
  const numPoints = view.getInt32(headerOffset + 4, LITTLE_ENDIAN)
  const partsOffset = headerOffset + 8
  const pointsOffset = partsOffset + numParts * 4

  const parts = []
  for (let i = 0; i < numParts; i += 1) {
    parts.push(view.getInt32(partsOffset + i * 4, LITTLE_ENDIAN))
  }

  const points = []
  for (let i = 0; i < numPoints; i += 1) {
    const pointOffset = pointsOffset + i * 16
    points.push(parsePointCoordinates(view, pointOffset))
  }

  const rings = []
  for (let i = 0; i < numParts; i += 1) {
    const start = parts[i]
    const end = i === numParts - 1 ? numPoints : parts[i + 1]
    rings.push(points.slice(start, end))
  }

  return { rings, numPoints, numParts, bytesRead: 32 + 8 + numParts * 4 + numPoints * 16 }
}

const parsePolylineGeometry = (view, offset) => {
  const { rings, bytesRead } = parseParts(view, offset)
  const nonEmpty = rings.filter((ring) => ring.length > 0)
  if (nonEmpty.length === 0) {
    return { geometry: null, bytesRead }
  }

  return {
    geometry:
      nonEmpty.length === 1
        ? { type: 'LineString', coordinates: nonEmpty[0] }
        : { type: 'MultiLineString', coordinates: nonEmpty },
    bytesRead
  }
}

const parsePolygonGeometry = (view, offset) => {
  const { rings, bytesRead } = parseParts(view, offset)
  const classified = []
  let current = null

  rings.forEach((ring) => {
    if (ring.length < 4) {
      return
    }
    const area = ringArea(ring)
    if (area < 0 || !current) {
      // area < 0 indicates clockwise outer ring in shapefile spec
      current = { outer: ring, holes: [] }
      classified.push(current)
    } else {
      current.holes.push(ring)
    }
  })

  if (classified.length === 0) {
    return { geometry: null, bytesRead }
  }

  const polygons = classified.map(({ outer, holes }) => {
    const shell = orientRing(outer, false)
    const interior = holes.map((ring) => orientRing(ring, true))
    return [shell, ...interior]
  })

  return {
    geometry:
      polygons.length === 1
        ? { type: 'Polygon', coordinates: polygons[0] }
        : { type: 'MultiPolygon', coordinates: polygons },
    bytesRead
  }
}

const parseRecordGeometry = (type, view, offset) => {
  switch (type) {
    case SHAPE_TYPE.POINT:
    case SHAPE_TYPE.POINT_Z:
    case SHAPE_TYPE.POINT_M:
      return parsePointGeometry(view, offset)
    case SHAPE_TYPE.MULTIPOINT:
    case SHAPE_TYPE.MULTIPOINT_Z:
    case SHAPE_TYPE.MULTIPOINT_M:
      return parseMultiPointGeometry(view, offset)
    case SHAPE_TYPE.POLYLINE:
    case SHAPE_TYPE.POLYLINE_Z:
    case SHAPE_TYPE.POLYLINE_M:
      return parsePolylineGeometry(view, offset)
    case SHAPE_TYPE.POLYGON:
    case SHAPE_TYPE.POLYGON_Z:
    case SHAPE_TYPE.POLYGON_M:
      return parsePolygonGeometry(view, offset)
    case SHAPE_TYPE.NULL:
    default:
      return { geometry: null, bytesRead: 0 }
  }
}

const validateHeader = (view) => {
  if (view.byteLength < 100) {
    throw new Error('无效的 SHP 文件：文件长度不足。')
  }

  const fileCode = view.getInt32(0, BIG_ENDIAN)
  if (fileCode !== FILE_CODE) {
    throw new Error('无效的 SHP 文件：文件标识不正确。')
  }

  const version = view.getInt32(28, LITTLE_ENDIAN)
  if (version !== 1000) {
    throw new Error('不支持的 SHP 文件版本。')
  }

  return view.getInt32(32, LITTLE_ENDIAN)
}

export const parseShapefile = (arrayBuffer) => {
  const view = new DataView(arrayBuffer)
  const declaredShapeType = validateHeader(view)

  const features = []
  let offset = 100

  while (offset + 8 <= view.byteLength) {
    const recordLength = view.getInt32(offset + 4, BIG_ENDIAN) * 2
    const recordContentOffset = offset + 8
    if (recordContentOffset + recordLength > view.byteLength) {
      break
    }

    const recordType = view.getInt32(recordContentOffset, LITTLE_ENDIAN)
    const geometryType =
      recordType === SHAPE_TYPE.NULL ? SHAPE_TYPE.NULL : recordType || declaredShapeType

    const { geometry } = parseRecordGeometry(geometryType, view, recordContentOffset + 4)
    if (geometry) {
      features.push({
        type: 'Feature',
        geometry,
        properties: {}
      })
    }

    offset = recordContentOffset + recordLength
  }

  return {
    type: 'FeatureCollection',
    features
  }
}

