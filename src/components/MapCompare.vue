<template>
  <div class="map-compare">
    <header class="top-menu" role="toolbar" aria-label="快速工具">
      <div class="menu-group" aria-label="数据与收藏">
        <button
          type="button"
          class="top-menu-button"
          title="导入地图文件"
          aria-label="导入地图文件"
          @click="handleAction('import')"
        >
          <span aria-hidden="true">📥</span>
        </button>
        <button
          type="button"
          class="top-menu-button"
          title="保存收藏对象"
          aria-label="保存收藏对象"
          @click="handleAction('saveFavorite')"
        >
          <span aria-hidden="true">⭐</span>
        </button>
        <button
          type="button"
          class="top-menu-button"
          title="显示收藏夹"
          aria-label="显示收藏夹"
          @click="handleAction('showFavorites')"
        >
          <span aria-hidden="true">📁</span>
        </button>
        <button
          type="button"
          class="top-menu-button"
          :class="{ 'is-active': showRoadNetwork }"
          :aria-pressed="showRoadNetwork ? 'true' : 'false'"
          title="显示或隐藏路网"
          aria-label="显示或隐藏路网"
          @click="toggleRoadNetwork"
        >
          <span aria-hidden="true">🛣️</span>
        </button>
      </div>
      <div class="menu-divider" role="separator" aria-orientation="vertical"></div>
      <div class="menu-group" aria-label="测量工具">
        <button
          type="button"
          class="top-menu-button"
          title="测距"
          aria-label="测距"
          @click="handleAction('measureDistance')"
        >
          <span aria-hidden="true">📏</span>
        </button>
        <button
          type="button"
          class="top-menu-button"
          title="测面积"
          aria-label="测面积"
          @click="handleAction('measureArea')"
        >
          <span aria-hidden="true">📐</span>
        </button>
        <button
          type="button"
          class="top-menu-button"
          title="定向测距"
          aria-label="定向测距"
          @click="handleAction('directionDistance')"
        >
          <span aria-hidden="true">🧭</span>
        </button>
        <button
          type="button"
          class="top-menu-button"
          title="三维计算"
          aria-label="三维计算"
          @click="handleAction('threeDimensionalCalc')"
        >
          <span aria-hidden="true">🧮</span>
        </button>
      </div>
      <div class="menu-divider" role="separator" aria-orientation="vertical"></div>
      <div class="menu-group" aria-label="标绘工具">
        <button
          type="button"
          class="top-menu-button"
          title="添加文本"
          aria-label="添加文本"
          @click="handleAction('addText')"
        >
          <span aria-hidden="true">✏️</span>
        </button>
        <button
          type="button"
          class="top-menu-button"
          title="画标绘点线面"
          aria-label="画标绘点线面"
          @click="handleAction('drawGraphics')"
        >
          <span aria-hidden="true">🖊️</span>
        </button>
      </div>
    </header>
    <div class="map-toolbar">
      <button
        class="toolbar-button"
        type="button"
        title="卷帘开关"
        aria-label="卷帘开关"
        :class="{ 'is-active': isShutterOpen }"
        :aria-pressed="isShutterOpen ? 'true' : 'false'"
        @click="toggleShutter"
      >
        <span class="icon" aria-hidden="true">🪟</span>
      </button>
      <button
        class="toolbar-button"
        type="button"
        title="图层管理"
        aria-label="图层管理"
        :aria-pressed="showLayerPanel ? 'true' : 'false'"
        @click="toggleLayerPanel"
      >
        <span class="icon" aria-hidden="true">🗂️</span>
      </button>
      <button
        class="toolbar-button"
        type="button"
        title="上传地图文件"
        aria-label="上传地图文件"
        @click="openImportDialog"
      >
        <span class="icon" aria-hidden="true">⤴️</span>
      </button>
      <button
        class="toolbar-button"
        type="button"
        title="底图切换"
        aria-label="底图切换"
        :aria-pressed="showBasemapPanel ? 'true' : 'false'"
        @click="toggleBasemapPanel"
      >
        <span class="icon" aria-hidden="true">🗺️</span>
      </button>
    </div>
    <div
      v-if="showLayerPanel"
      class="layer-panel"
      role="dialog"
      aria-label="图层管理"
    >
      <h3 class="panel-title">图层管理</h3>
      <ul class="layer-tree">
        <li
          v-for="group in overlayLayerTree"
          :key="group.key"
          class="layer-group"
        >
          <div class="group-header">
            <label class="checkbox-label">
              <input
                type="checkbox"
                :checked="isGroupChecked(group)"
                :indeterminate.prop="isGroupIndeterminate(group)"
                @change="toggleGroup(group, $event.target.checked)"
              />
              <span>{{ group.title }}</span>
            </label>
          </div>
          <ul class="layer-items">
            <li
              v-for="layer in group.children"
              :key="layer.key"
              class="layer-item"
            >
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  :checked="layer.visible"
                  @change="toggleLayer(layer, $event.target.checked)"
                />
                <span>{{ layer.title }}</span>
              </label>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div
      v-if="showBasemapPanel"
      class="basemap-panel"
      role="group"
      aria-label="底图切换选项"
    >
      <button
        v-for="option in basemapOptions"
        :key="option.key"
        type="button"
        class="basemap-option"
        :class="{ 'is-active': option.key === selectedBasemap }"
        @click="selectBasemap(option.key)"
      >
        <span class="option-label">{{ option.label }}</span>
      </button>
    </div>
    <div
      v-if="showImportDialog"
      class="import-dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="导入地图文件"
    >
      <div class="import-dialog">
        <h3>导入地图文件</h3>
        <p>请选择需要加载的 .shp 文件，导入后将显示在左右两侧地图上。</p>
        <input
          ref="importFileInput"
          class="file-input"
          type="file"
          accept=".shp"
          @change="handleImportFileChange"
        />
        <p v-if="importState.error" class="import-error">{{ importState.error }}</p>
        <div class="import-actions">
          <button type="button" class="cancel-btn" @click="closeImportDialog" :disabled="importState.loading">
            取消
          </button>
          <button
            type="button"
            class="confirm-btn"
            :disabled="importState.loading"
            @click="handleImportConfirm"
          >
            {{ importState.loading ? '导入中…' : '开始导入' }}
          </button>
        </div>
      </div>
    </div>
    <div ref="leftMap" class="map"></div>
    <div v-if="isShutterOpen" ref="rightMap" class="map"></div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
// import 'mapbox-gl/dist/mapbox-gl.css'
import { parseShapefile } from '@/utils/shapefile'

mapboxgl.accessToken = 'pk.eyJ1IjoiZHl4OTU0MSIsImEiOiJjbTRtaXNwYzYwZG1iMnJxNTBhOWhxbHpkIn0.frfrK_nT-Uh72O5LscRRqA'

const leftMap = ref(null)
const rightMap = ref(null)
const isShutterOpen = ref(true)
const showBasemapPanel = ref(false)
const showLayerPanel = ref(false)
const showImportDialog = ref(false)
const importFileInput = ref(null)
const selectedBasemap = ref('osm')
const showRoadNetwork = ref(false)

const tiandituToken = process.env.VUE_APP_TIANDITU_TOKEN || ''

const importState = reactive({
  file: null,
  error: '',
  loading: false
})

const sharedCamera = reactive({
  center: [105, 35],
  zoom: 4,
  bearing: 0,
  pitch: 0
})

const mapRegistry = new Map()
let isSyncingCamera = false

const uniqueId = (prefix = 'id') =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`

const expandSubdomains = (template, subdomains = []) => {
  if (!subdomains || subdomains.length === 0) {
    return [template]
  }
  return subdomains.map((subdomain) => template.replace('{s}', subdomain))
}

const createRasterStyle = ({ tiles, tileSize = 256, attribution = '', minzoom, maxzoom }) => {
  const source = {
    type: 'raster',
    tiles,
    tileSize,
    attribution
  }

  if (typeof minzoom === 'number') {
    source.minzoom = minzoom
  }
  if (typeof maxzoom === 'number') {
    source.maxzoom = maxzoom
  }

  return {
    version: 8,
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    sources: {
      basemap: source
    },
    layers: [
      {
        id: 'basemap',
        type: 'raster',
        source: 'basemap'
      }
    ]
  }
}

const basemapOptions = [
  {
    key: 'osm',
    label: 'OSM',
    styleFactory: () =>
      createRasterStyle({
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        attribution: '© OpenStreetMap contributors'
      })
  },
  {
    key: 'arcgis',
    label: 'ArcGIS 影像',
    styleFactory: () =>
      createRasterStyle({
        tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        attribution:
          'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })
  },
  {
    key: 'tiandituImagery',
    label: '天地图影像',
    styleFactory: () =>
      createRasterStyle({
        tiles: expandSubdomains(
          `https://t{s}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${tiandituToken}`,
          ['0', '1', '2', '3', '4', '5', '6', '7']
        ),
        attribution: '© 天地图'
      })
  },
  {
    key: 'tiandituVector',
    label: '天地图路网',
    styleFactory: () =>
      createRasterStyle({
        tiles: [`http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tiandituToken}`],
        attribution: '© 天地图'
      })
  },
  {
    key: 'amapVector',
    label: '高德路网',
    styleFactory: () =>
      createRasterStyle({
        tiles: ['https://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}&scl=1&ltype=2'],
        attribution: '© 高德地图'
      })
  },
  {
    key: 'amapImagery',
    label: '高德卫星',
    styleFactory: () =>
      createRasterStyle({
        tiles: ['https://webst01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&style=6'],
        attribution: '© 高德地图'
      })
  }
]

const createBasemapStyle = (key) => {
  const option = basemapOptions.find((item) => item.key === key)
  return option ? option.styleFactory() : basemapOptions[0].styleFactory()
}

const updateBoundsWithCoordinate = (bounds, coordinate) => {
  if (!Array.isArray(coordinate) || coordinate.length < 2) {
    return
  }
  const [lng, lat] = coordinate
  if (Number.isFinite(lng) && Number.isFinite(lat)) {
    bounds.minX = Math.min(bounds.minX, lng)
    bounds.minY = Math.min(bounds.minY, lat)
    bounds.maxX = Math.max(bounds.maxX, lng)
    bounds.maxY = Math.max(bounds.maxY, lat)
  }
}

const traverseCoordinates = (coords, callback) => {
  if (!Array.isArray(coords)) {
    return
  }
  if (typeof coords[0] === 'number') {
    callback(coords)
    return
  }
  coords.forEach((child) => traverseCoordinates(child, callback))
}

const addGeometryTypes = (geojson, target) => {
  if (!geojson) {
    return
  }
  if (geojson.type === 'FeatureCollection') {
    geojson.features.forEach((feature) => addGeometryTypes(feature.geometry, target))
    return
  }
  if (geojson.type === 'Feature') {
    addGeometryTypes(geojson.geometry, target)
    return
  }
  if (geojson.type === 'GeometryCollection' && Array.isArray(geojson.geometries)) {
    geojson.geometries.forEach((geometry) => addGeometryTypes(geometry, target))
    return
  }
  if (geojson.type) {
    target.add(geojson.type)
  }
}

const computeGeoJsonBounds = (geojson) => {
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity
  }

  const processGeometry = (geometry) => {
    if (!geometry) {
      return
    }
    if (geometry.type === 'GeometryCollection' && Array.isArray(geometry.geometries)) {
      geometry.geometries.forEach(processGeometry)
      return
    }
    if (!geometry.coordinates) {
      return
    }
    traverseCoordinates(geometry.coordinates, (coord) => updateBoundsWithCoordinate(bounds, coord))
  }

  if (!geojson) {
    return null
  }

  if (geojson.type === 'FeatureCollection') {
    geojson.features.forEach((feature) => processGeometry(feature.geometry))
  } else if (geojson.type === 'Feature') {
    processGeometry(geojson.geometry)
  } else {
    processGeometry(geojson)
  }

  if (!Number.isFinite(bounds.minX) || !Number.isFinite(bounds.minY) || !Number.isFinite(bounds.maxX) || !Number.isFinite(bounds.maxY)) {
    return null
  }

  return [
    [bounds.minX, bounds.minY],
    [bounds.maxX, bounds.maxY]
  ]
}

const createGeoJsonOverlayConfig = (data, styleOverrides = {}) => {
  const sourceId = uniqueId('geojson')
  const geometryTypes = new Set()
  addGeometryTypes(data, geometryTypes)

  const layers = []

  if (geometryTypes.has('Point') || geometryTypes.has('MultiPoint')) {
    layers.push({
      id: `${sourceId}-point`,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': 6,
        'circle-color': 'rgba(255, 152, 0, 0.9)',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        ...(styleOverrides.point?.paint || {})
      },
      filter: ['in', ['geometry-type'], 'Point', 'MultiPoint']
    })

    if (styleOverrides.point?.showLabels) {
      layers.push({
        id: `${sourceId}-point-label`,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': ['coalesce', ['to-string', ['get', styleOverrides.point.labelField || 'name']], ''],
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-size': 12,
          ...(styleOverrides.point.layout || {})
        },
        paint: {
          'text-color': '#1f2933',
          'text-halo-width': 1,
          'text-halo-color': 'rgba(255, 255, 255, 0.85)',
          ...(styleOverrides.point.labelPaint || {})
        },
        filter: ['in', ['geometry-type'], 'Point', 'MultiPoint']
      })
    }
  }

  if (geometryTypes.has('LineString') || geometryTypes.has('MultiLineString')) {
    layers.push({
      id: `${sourceId}-line`,
      type: 'line',
      source: sourceId,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        ...(styleOverrides.line?.layout || {})
      },
      paint: {
        'line-width': 2.5,
        'line-color': 'rgba(255, 152, 0, 0.85)',
        ...(styleOverrides.line?.paint || {})
      },
      filter: ['in', ['geometry-type'], 'LineString', 'MultiLineString']
    })
  }

  if (geometryTypes.has('Polygon') || geometryTypes.has('MultiPolygon')) {
    const polygonPaint = {
      'fill-color': 'rgba(255, 152, 0, 0.2)',
      'fill-outline-color': 'rgba(255, 87, 34, 0.9)',
      ...(styleOverrides.polygon?.paint || {})
    }

    const polygonOutlineColor =
      styleOverrides.polygon?.outlinePaint?.['line-color'] || polygonPaint['fill-outline-color'] || 'rgba(255, 87, 34, 0.9)'

    layers.push({
      id: `${sourceId}-polygon`,
      type: 'fill',
      source: sourceId,
      paint: polygonPaint,
      filter: ['in', ['geometry-type'], 'Polygon', 'MultiPolygon']
    })

    layers.push({
      id: `${sourceId}-polygon-outline`,
      type: 'line',
      source: sourceId,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        ...(styleOverrides.polygon?.outlineLayout || {})
      },
      paint: {
        'line-width': 2,
        'line-color': polygonOutlineColor,
        ...(styleOverrides.polygon?.outlinePaint || {})
      },
      filter: ['in', ['geometry-type'], 'Polygon', 'MultiPolygon']
    })
  }

  return {
    source: {
      id: sourceId,
      type: 'geojson',
      data
    },
    layers
  }
}

const createOverlayLeaf = (key, title, createConfig, options = {}) => ({
  key,
  title,
  createConfig,
  visible: options.visible ?? true,
  instances: new Map(),
  bounds: options.bounds || null
})

const samplePointsData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: '北京' },
      geometry: {
        type: 'Point',
        coordinates: [116.4074, 39.9042]
      }
    },
    {
      type: 'Feature',
      properties: { name: '上海' },
      geometry: {
        type: 'Point',
        coordinates: [121.4737, 31.2304]
      }
    }
  ]
}

const sampleLineData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [114.3055, 30.5928],
          [113.2644, 23.1291],
          [121.4737, 31.2304]
        ]
      }
    }
  ]
}

const samplePolygonData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [112.9388, 28.2282],
            [111.7004, 27.241],
            [113.101, 26.2235],
            [114.2074, 27.8516],
            [112.9388, 28.2282]
          ]
        ]
      }
    }
  ]
}

const overlayLayerTree = reactive([
  {
    key: 'pointLayers',
    title: '点图层',
    children: [
      createOverlayLeaf(
        'samplePoints',
        '示例兴趣点',
        () =>
          createGeoJsonOverlayConfig(samplePointsData, {
            point: {
              paint: {
                'circle-color': 'rgba(255, 107, 107, 0.9)',
                'circle-radius': 6.5
              },
              showLabels: true,
              labelField: 'name',
              labelPaint: {
                'text-color': '#0f172a'
              }
            }
          }),
        { bounds: computeGeoJsonBounds(samplePointsData) }
      )
    ]
  },
  {
    key: 'lineLayers',
    title: '线图层',
    children: [
      createOverlayLeaf(
        'sampleLine',
        '示例线路',
        () =>
          createGeoJsonOverlayConfig(sampleLineData, {
            line: {
              paint: {
                'line-color': 'rgba(25, 118, 210, 0.85)',
                'line-width': 3
              }
            }
          }),
        { bounds: computeGeoJsonBounds(sampleLineData) }
      )
    ]
  },
  {
    key: 'polygonLayers',
    title: '面图层',
    children: [
      createOverlayLeaf(
        'samplePolygon',
        '示例区域',
        () =>
          createGeoJsonOverlayConfig(samplePolygonData, {
            polygon: {
              paint: {
                'fill-color': 'rgba(129, 199, 132, 0.35)',
                'fill-outline-color': 'rgba(56, 142, 60, 0.9)'
              },
              outlinePaint: {
                'line-color': 'rgba(56, 142, 60, 0.9)',
                'line-width': 2
              }
            }
          }),
        { bounds: computeGeoJsonBounds(samplePolygonData) }
      )
    ]
  }
])

const importedLayerGroup = reactive({
  key: 'importedLayers',
  title: '导入图层',
  children: []
})

overlayLayerTree.push(importedLayerGroup)

const forEachOverlayLeaf = (callback) => {
  overlayLayerTree.forEach((group) => {
    group.children.forEach((leaf) => callback(leaf))
  })
}

const waitForStyleLoad = (map, callback) => {
  if (map.isStyleLoaded()) {
    callback()
    return
  }

  const handleStyleData = () => {
    if (!map.isStyleLoaded()) {
      return
    }
    map.off('styledata', handleStyleData)
    callback()
  }

  map.on('styledata', handleStyleData)
}

const withMapReady = (mapId, callback) => {
  const state = mapRegistry.get(mapId)
  if (!state) {
    return
  }
  waitForStyleLoad(state.map, () => callback(state.map))
}

const setLayerVisibilityOnMap = (map, layerIds, visible) => {
  layerIds.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
    }
  })
}

const detachOverlayInstance = (map, instance) => {
  if (!instance) {
    return
  }
  instance.layerIds.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId)
    }
  })
  if (map.getSource(instance.sourceId)) {
    map.removeSource(instance.sourceId)
  }
}

const attachLeafToMap = (leaf, mapId, map) => {
  const existing = leaf.instances.get(mapId)
  if (existing) {
    detachOverlayInstance(map, existing)
  }

  const { source, layers } = leaf.createConfig(mapId)

  if (map.getSource(source.id)) {
    map.removeSource(source.id)
  }
  map.addSource(source.id, source)

  const layerIds = []
  layers.forEach((layer) => {
    if (map.getLayer(layer.id)) {
      map.removeLayer(layer.id)
    }
    map.addLayer(layer)
    layerIds.push(layer.id)
  })

  leaf.instances.set(mapId, { sourceId: source.id, layerIds })
  setLayerVisibilityOnMap(map, layerIds, leaf.visible)
}

const setLeafVisibility = (leaf, mapId, visible) => {
  const instance = leaf.instances.get(mapId)
  if (!instance) {
    return
  }
  const state = mapRegistry.get(mapId)
  if (!state) {
    return
  }
  setLayerVisibilityOnMap(state.map, instance.layerIds, visible)
}

const updateLeafVisibility = (leaf, visible) => {
  leaf.instances.forEach((instance, mapId) => {
    const state = mapRegistry.get(mapId)
    if (!state) {
      return
    }
    setLayerVisibilityOnMap(state.map, instance.layerIds, visible)
  })
}

const toggleLayerPanel = () => {
  showLayerPanel.value = !showLayerPanel.value
  if (showLayerPanel.value) {
    showBasemapPanel.value = false
  }
}

const toggleBasemapPanel = () => {
  showBasemapPanel.value = !showBasemapPanel.value
  if (showBasemapPanel.value) {
    showLayerPanel.value = false
  }
}

const selectBasemap = (key) => {
  if (selectedBasemap.value === key) {
    showBasemapPanel.value = false
    return
  }

  selectedBasemap.value = key

  mapRegistry.forEach((state, mapId) => {
    const { map } = state
    map.setStyle(createBasemapStyle(key))
    waitForStyleLoad(map, () => {
      refreshMapOverlays(mapId, { recreate: true })
    })
  })

  showBasemapPanel.value = false
}

const roadNetworkOverlay = {
  instances: new Map(),
  createConfig: () => {
    const sourceId = uniqueId('road-overlay')
    return {
      source: {
        id: sourceId,
        type: 'raster',
        tiles: ['https://stamen-tiles.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution:
          'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
      },
      layers: [
        {
          id: `${sourceId}-layer`,
          type: 'raster',
          source: sourceId,
          paint: {
            'raster-opacity': 0.65
          }
        }
      ]
    }
  }
}

const attachRoadNetworkToMap = (mapId, map) => {
  const existing = roadNetworkOverlay.instances.get(mapId)
  if (existing) {
    setLayerVisibilityOnMap(map, existing.layerIds, showRoadNetwork.value)
    return
  }

  const { source, layers } = roadNetworkOverlay.createConfig()
  if (map.getSource(source.id)) {
    map.removeSource(source.id)
  }
  map.addSource(source.id, source)

  const layerIds = []
  layers.forEach((layer) => {
    if (map.getLayer(layer.id)) {
      map.removeLayer(layer.id)
    }
    map.addLayer(layer)
    layerIds.push(layer.id)
  })

  roadNetworkOverlay.instances.set(mapId, { sourceId: source.id, layerIds })
  setLayerVisibilityOnMap(map, layerIds, showRoadNetwork.value)
}

const toggleRoadNetwork = () => {
  showRoadNetwork.value = !showRoadNetwork.value
  mapRegistry.forEach((state, mapId) => {
    withMapReady(mapId, (map) => {
      if (showRoadNetwork.value) {
        attachRoadNetworkToMap(mapId, map)
      } else {
        const instance = roadNetworkOverlay.instances.get(mapId)
        if (instance) {
          setLayerVisibilityOnMap(map, instance.layerIds, false)
        }
      }
    })
  })
}

const refreshMapOverlays = (mapId, { recreate = false } = {}) => {
  const state = mapRegistry.get(mapId)
  if (!state) {
    return
  }
  const { map } = state

  waitForStyleLoad(map, () => {
    if (recreate) {
      roadNetworkOverlay.instances.delete(mapId)
      forEachOverlayLeaf((leaf) => {
        leaf.instances.delete(mapId)
      })
    }

    if (showRoadNetwork.value) {
      attachRoadNetworkToMap(mapId, map)
    }

    forEachOverlayLeaf((leaf) => {
      if (!leaf.instances.has(mapId)) {
        attachLeafToMap(leaf, mapId, map)
      } else {
        setLeafVisibility(leaf, mapId, leaf.visible)
      }
    })
  })
}

const registerMapInstance = (mapId, map) => {
  const cleanup = []
  mapRegistry.set(mapId, { map, cleanup })

  const onMove = () => {
    if (isSyncingCamera) {
      return
    }

    isSyncingCamera = true

    const center = map.getCenter()
    sharedCamera.center = [center.lng, center.lat]
    sharedCamera.zoom = map.getZoom()
    sharedCamera.bearing = map.getBearing()
    sharedCamera.pitch = map.getPitch()

    mapRegistry.forEach((otherState, otherId) => {
      if (otherId === mapId) {
        return
      }
      otherState.map.jumpTo({
        center: sharedCamera.center,
        zoom: sharedCamera.zoom,
        bearing: sharedCamera.bearing,
        pitch: sharedCamera.pitch
      })
    })

    isSyncingCamera = false
  }

  map.on('move', onMove)
  cleanup.push(() => map.off('move', onMove))

  const onLoad = () => {
    refreshMapOverlays(mapId, { recreate: true })
  }

  map.on('load', onLoad)
  cleanup.push(() => map.off('load', onLoad))
}

const createAndRegisterMap = (mapId, target) => {
  if (!target) {
    return null
  }

  const map = new mapboxgl.Map({
    container: target,
    style: createBasemapStyle(selectedBasemap.value),
    center: sharedCamera.center,
    zoom: sharedCamera.zoom,
    bearing: sharedCamera.bearing,
    pitch: sharedCamera.pitch,
    attributionControl: true
  })

  registerMapInstance(mapId, map)
  return map
}

const destroyMap = (mapId) => {
  const state = mapRegistry.get(mapId)
  if (!state) {
    return
  }

  const { map, cleanup } = state
  cleanup.forEach((dispose) => {
    try {
      dispose()
    } catch (error) {
      console.warn('[map cleanup]', error)
    }
  })

  const roadInstance = roadNetworkOverlay.instances.get(mapId)
  if (roadInstance) {
    detachOverlayInstance(map, roadInstance)
    roadNetworkOverlay.instances.delete(mapId)
  }

  forEachOverlayLeaf((leaf) => {
    const instance = leaf.instances.get(mapId)
    if (instance) {
      detachOverlayInstance(map, instance)
      leaf.instances.delete(mapId)
    }
  })

  map.remove()
  mapRegistry.delete(mapId)
}

const ensureRightMap = () => {
  if (!isShutterOpen.value || mapRegistry.has('right')) {
    return
  }

  const target = rightMap.value
  if (!target) {
    return
  }

  createAndRegisterMap('right', target)
}

const toggleShutter = () => {
  isShutterOpen.value = !isShutterOpen.value
}

const toggleLayer = (leaf, checked) => {
  leaf.visible = checked
  updateLeafVisibility(leaf, checked)
}

const toggleGroup = (group, checked) => {
  group.children.forEach((leaf) => {
    if (leaf.visible !== checked) {
      leaf.visible = checked
      updateLeafVisibility(leaf, checked)
    }
  })
}

const isGroupChecked = (group) =>
  group.children.length > 0 && group.children.every((leaf) => leaf.visible)

const isGroupIndeterminate = (group) => {
  const visibleCount = group.children.filter((leaf) => leaf.visible).length
  return visibleCount > 0 && visibleCount < group.children.length
}

const fitAllMapsToBounds = (bounds) => {
  if (!bounds) {
    return
  }
  const iterator = mapRegistry.entries().next()
  if (iterator.done) {
    return
  }
  const [mapId] = iterator.value
  withMapReady(mapId, (map) => {
    map.fitBounds(bounds, { padding: 48, duration: 500 })
  })
}

const addLeafToExistingMaps = (leaf) => {
  mapRegistry.forEach((state, mapId) => {
    withMapReady(mapId, (map) => {
      attachLeafToMap(leaf, mapId, map)
    })
  })

  if (leaf.bounds) {
    fitAllMapsToBounds(leaf.bounds)
  }
}

const createImportedLeaf = (featureCollection, title) => {
  const bounds = computeGeoJsonBounds(featureCollection)
  const stableData = JSON.parse(JSON.stringify(featureCollection))
  return createOverlayLeaf(
    uniqueId('imported'),
    title,
    () =>
      createGeoJsonOverlayConfig(stableData, {
        point: {
          paint: {
            'circle-color': 'rgba(255, 152, 0, 0.9)',
            'circle-radius': 6
          }
        },
        line: {
          paint: {
            'line-color': 'rgba(255, 152, 0, 0.85)',
            'line-width': 2.5
          }
        },
        polygon: {
          paint: {
            'fill-color': 'rgba(255, 152, 0, 0.2)',
            'fill-outline-color': 'rgba(255, 87, 34, 0.9)'
          },
          outlinePaint: {
            'line-color': 'rgba(255, 87, 34, 0.9)',
            'line-width': 2
          }
        }
      }),
    { bounds }
  )
}

const resetImportState = () => {
  importState.file = null
  importState.error = ''
  importState.loading = false
  if (importFileInput.value) {
    importFileInput.value.value = ''
  }
}

const openImportDialog = () => {
  resetImportState()
  showImportDialog.value = true
  showLayerPanel.value = false
  showBasemapPanel.value = false
}

const closeImportDialog = () => {
  resetImportState()
  showImportDialog.value = false
}

const handleImportFileChange = (event) => {
  const [file] = event.target.files || []
  importState.file = file || null
  importState.error = ''
}

const handleImportConfirm = async () => {
  if (!importState.file) {
    importState.error = '请选择需要导入的 .shp 文件。'
    return
  }

  if (!/\.shp$/i.test(importState.file.name)) {
    importState.error = '仅支持扩展名为 .shp 的文件。'
    return
  }

  try {
    importState.loading = true
    const arrayBuffer = await importState.file.arrayBuffer()
    const featureCollection = parseShapefile(arrayBuffer)

    if (!featureCollection.features.length) {
      throw new Error('未在文件中解析到要素。')
    }

    const layerTitle = importState.file.name.replace(/\.shp$/i, '')
    const leaf = createImportedLeaf(featureCollection, layerTitle)
    importedLayerGroup.children.push(leaf)
    addLeafToExistingMaps(leaf)

    showImportDialog.value = false
  } catch (error) {
    importState.error = error?.message || '解析 SHP 文件失败。'
  } finally {
    importState.loading = false
  }
}

const handleAction = (action) => {
  if (action === 'import') {
    openImportDialog()
    return
  }

  console.info(`[toolbar] ${action} clicked`)
}

watch(isShutterOpen, (open) => {
  if (open) {
    nextTick(() => {
      ensureRightMap()
    })
  } else {
    destroyMap('right')
  }
})

onMounted(() => {
  if (leftMap.value) {
    createAndRegisterMap('left', leftMap.value)
  }

  if (isShutterOpen.value) {
    nextTick(() => {
      ensureRightMap()
    })
  }
})

onBeforeUnmount(() => {
  destroyMap('right')
  destroyMap('left')
  forEachOverlayLeaf((leaf) => {
    leaf.instances.clear()
  })
  roadNetworkOverlay.instances.clear()
})
</script>

<style scoped>
.map-compare {
  position: relative;
  display: flex;
  height: 100%;
}

.top-menu {
  position: absolute;
  top: 16px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 18px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateX(-50%);
  z-index: 12;
}

.menu-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-divider {
  width: 1px;
  height: 28px;
  background: rgba(31, 120, 255, 0.25);
}

.top-menu-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f0f4ff;
  color: #1f1f1f;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.top-menu-button:hover {
  background: #dbe6ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.top-menu-button:focus {
  outline: 2px solid #1f78ff;
  outline-offset: 2px;
}

.top-menu-button.is-active {
  background: #1f78ff;
  color: #fff;
  box-shadow: 0 4px 12px rgba(31, 120, 255, 0.35);
}

.map {
  flex: 1;
  min-width: 0;
  height: 100%;
}

.map-toolbar {
  position: absolute;
  top: 50%;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%);
  z-index: 10;
}

.basemap-panel {
  position: absolute;
  top: 50%;
  left: 76px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%);
  z-index: 9;
  min-width: 96px;
}

.basemap-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #f3f6ff;
  color: #1f1f1f;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.basemap-option:hover {
  background: #e3ecff;
  transform: translateY(-1px);
}

.basemap-option:focus {
  outline: none;
  border-color: #1f78ff;
}

.basemap-option.is-active {
  border-color: #1f78ff;
  background: #d7e6ff;
  font-weight: 600;
}

.option-label {
  font-size: 14px;
}

.layer-panel {
  position: absolute;
  top: 50%;
  left: 76px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  min-width: 220px;
  max-height: 70vh;
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%);
  z-index: 11;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
}

.layer-tree {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.layer-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-header {
  font-weight: 600;
  color: #1f1f1f;
}

.layer-items {
  list-style: none;
  margin: 0;
  padding: 0 0 0 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.layer-item {
  font-size: 14px;
  color: #333;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.toolbar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #1f78ff;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.toolbar-button:hover {
  background: #145cd6;
  transform: translateY(-2px);
}

.toolbar-button.is-active {
  background: #145cd6;
  box-shadow: 0 4px 12px rgba(20, 92, 214, 0.35);
}

.toolbar-button:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.icon {
  font-size: 18px;
  line-height: 1;
}

.import-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
}

.import-dialog {
  width: 360px;
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.import-dialog h3 {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: #263238;
}

.import-dialog p {
  margin: 0 0 16px;
  color: #607d8b;
  font-size: 14px;
}

.file-input {
  width: 100%;
  margin-bottom: 12px;
}

.import-error {
  color: #d32f2f;
  font-size: 13px;
  margin-bottom: 12px;
}

.import-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.import-actions button {
  min-width: 88px;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.import-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.import-actions .cancel-btn {
  background: #eceff1;
  color: #546e7a;
}

.import-actions .confirm-btn {
  background: #1e88e5;
  color: #ffffff;
}
</style>
