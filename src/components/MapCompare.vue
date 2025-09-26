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
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'
import Polygon from 'ol/geom/Polygon'
import { fromLonLat } from 'ol/proj'
import { createEmpty, extend as extendExtent, isEmpty as isExtentEmpty } from 'ol/extent'
import GeoJSON from 'ol/format/GeoJSON'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import CircleStyle from 'ol/style/Circle'
import 'ol/ol.css'
import { parseShapefile } from '../utils/shapefile'

const leftMap = ref(null)
const rightMap = ref(null)
const isShutterOpen = ref(true)
const mapInstances = new Map()
let sharedView = null

const showBasemapPanel = ref(false)
const showLayerPanel = ref(false)
const showImportDialog = ref(false)
const importFileInput = ref(null)
const selectedBasemap = ref('osm')
const showRoadNetwork = ref(false)
const tiandituToken = process.env.VUE_APP_TIANDITU_TOKEN || ''
const geoJsonFormat = new GeoJSON()

const importState = reactive({
  file: null,
  error: '',
  loading: false
})

const handleAction = (action) => {
  if (action === 'import') {
    openImportDialog()
    return
  }

  console.info(`[toolbar] ${action} clicked`)
}

const createOverlayLeaf = (key, title, createLayer, options = {}) => ({
  key,
  title,
  createLayer,
  visible: true,
  instances: new Map(),
  ...options
})

const overlayLayerTree = reactive([
  {
    key: 'pointLayers',
    title: '点图层',
    children: [
      createOverlayLeaf('samplePoints', '示例兴趣点', () => {
        const beijing = new Feature({
          geometry: new Point(fromLonLat([116.4074, 39.9042])),
          name: '北京'
        })
        const shanghai = new Feature({
          geometry: new Point(fromLonLat([121.4737, 31.2304])),
          name: '上海'
        })

        return new VectorLayer({
          source: new VectorSource({
            features: [beijing, shanghai]
          }),
          style: new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: 'rgba(255, 107, 107, 0.9)' }),
              stroke: new Stroke({ color: '#ffffff', width: 2 })
            })
          })
        })
      })
    ]
  },
  {
    key: 'lineLayers',
    title: '线图层',
    children: [
      createOverlayLeaf('sampleLine', '示例线路', () => {
        const line = new Feature({
          geometry: new LineString([
            fromLonLat([114.3055, 30.5928]),
            fromLonLat([113.2644, 23.1291]),
            fromLonLat([121.4737, 31.2304])
          ])
        })

        return new VectorLayer({
          source: new VectorSource({
            features: [line]
          }),
          style: new Style({
            stroke: new Stroke({
              color: 'rgba(25, 118, 210, 0.85)',
              width: 3
            })
          })
        })
      })
    ]
  },
  {
    key: 'polygonLayers',
    title: '面图层',
    children: [
      createOverlayLeaf('samplePolygon', '示例区域', () => {
        const polygon = new Feature({
          geometry: new Polygon([
            [
              fromLonLat([112.9388, 28.2282]),
              fromLonLat([111.7004, 27.2410]),
              fromLonLat([113.1010, 26.2235]),
              fromLonLat([114.2074, 27.8516]),
              fromLonLat([112.9388, 28.2282])
            ]
          ])
        })

        return new VectorLayer({
          source: new VectorSource({
            features: [polygon]
          }),
          style: new Style({
            fill: new Fill({ color: 'rgba(129, 199, 132, 0.35)' }),
            stroke: new Stroke({ color: 'rgba(56, 142, 60, 0.9)', width: 2 })
          })
        })
      })
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

const updateLeafVisibility = (leaf, visible) => {
  leaf.instances.forEach((layerInstance) => {
    layerInstance.setVisible(visible)
  })
}

const toggleLayerPanel = () => {
  showLayerPanel.value = !showLayerPanel.value
  if (showLayerPanel.value) {
    showBasemapPanel.value = false
  }
}

const basemapOptions = [
  {
    key: 'osm',
    label: 'OSM',
    createLayer: () =>
      new TileLayer({
        source: new OSM()
      })
  },
  {
    key: 'arcgis',
    label: 'ArcGIS 影像',
    createLayer: () =>
      new TileLayer({
        source: new XYZ({
          url:
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attributions:
            'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        })
      })
  },
  {
    key: 'tiandituImagery',
    label: '天地图影像',
    createLayer: () =>
      new TileLayer({
        source: new XYZ({
          url: `https://t{s}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${tiandituToken}`,
          attributions: '© 天地图',
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          wrapX: true
        })
      })
  },
  {
    key: 'tiandituVector',
    label: '天地图路网',
    createLayer: () =>
      new TileLayer({
        source: new XYZ({
          url: `http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tiandituToken}`,
          attributions: '© 天地图',
          wrapX: true
        })
      })
  },
  {
    key: 'amapVector',
    label: '高德路网',
    createLayer: () =>
      new TileLayer({
        source: new XYZ({
          url: 'https://wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}&scl=1&ltype=2',
          attributions: '© 高德地图',
          subdomains: ['1', '2', '3', '4'],
          crossOrigin: 'anonymous',
          wrapX: true
        })
      })
  },
  {
    key: 'amapImagery',
    label: '高德卫星',
    createLayer: () =>
      new TileLayer({
        source: new XYZ({
          url: 'https://webst0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&style=6',
          attributions: '© 高德地图',
          subdomains: ['1', '2', '3', '4'],
          crossOrigin: 'anonymous',
          wrapX: true
        })
      })
  }
]

const createBasemapLayer = (key) => {
  const option = basemapOptions.find((item) => item.key === key)
  return option ? option.createLayer() : basemapOptions[0].createLayer()
}

const toggleBasemapPanel = () => {
  showBasemapPanel.value = !showBasemapPanel.value
  if (showBasemapPanel.value) {
    showLayerPanel.value = false
  }
}

const selectBasemap = (key) => {
  if (key === selectedBasemap.value) {
    showBasemapPanel.value = false
    return
  }

  selectedBasemap.value = key
  const newLayerFactory = () => createBasemapLayer(key)

  mapInstances.forEach((mapInstance) => {
    if (!mapInstance) return

    const layers = mapInstance.getLayers()
    const newLayer = newLayerFactory()

    if (layers.getLength() > 0) {
      layers.setAt(0, newLayer)
    } else {
      layers.push(newLayer)
    }
  })

  showBasemapPanel.value = false
}

const roadNetworkOverlay = {
  createLayer: () =>
    new TileLayer({
      source: new XYZ({
        url: 'https://stamen-tiles.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}.png',
        attributions:
          'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.',
        crossOrigin: 'anonymous',
        maxZoom: 19
      })
    }),
  instances: new Map()
}

const toggleRoadNetwork = () => {
  showRoadNetwork.value = !showRoadNetwork.value
  roadNetworkOverlay.instances.forEach((layer) => {
    layer.setVisible(showRoadNetwork.value)
  })
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

const createMap = (target, view) =>
  new Map({
    target,
    layers: [createBasemapLayer(selectedBasemap.value)],
    view
  })

const attachLeafToMap = (leaf, mapId, mapInstance) => {
  const layerInstance = leaf.createLayer()
  layerInstance.setVisible(leaf.visible)
  mapInstance.addLayer(layerInstance)
  leaf.instances.set(mapId, layerInstance)
}

const addLeafToExistingMaps = (leaf) => {
  mapInstances.forEach((mapInstance, mapId) => {
    attachLeafToMap(leaf, mapId, mapInstance)
  })

  if (leaf.extent && sharedView && !isExtentEmpty(leaf.extent)) {
    sharedView.fit(leaf.extent, {
      padding: [48, 48, 48, 48],
      maxZoom: 17,
      duration: 400
    })
  }
}

const registerMapInstance = (mapId, mapInstance) => {
  mapInstances.set(mapId, mapInstance)

  const roadNetworkLayer = roadNetworkOverlay.createLayer()
  roadNetworkLayer.setVisible(showRoadNetwork.value)
  mapInstance.addLayer(roadNetworkLayer)
  roadNetworkOverlay.instances.set(mapId, roadNetworkLayer)

  forEachOverlayLeaf((leaf) => {
    attachLeafToMap(leaf, mapId, mapInstance)
  })
}

const destroyMap = (mapId) => {
  const mapInstance = mapInstances.get(mapId)
  if (!mapInstance) {
    return
  }

  const roadNetworkLayer = roadNetworkOverlay.instances.get(mapId)
  if (roadNetworkLayer) {
    mapInstance.removeLayer(roadNetworkLayer)
    roadNetworkOverlay.instances.delete(mapId)
  }

  forEachOverlayLeaf((leaf) => {
    const layerInstance = leaf.instances.get(mapId)
    if (layerInstance) {
      mapInstance.removeLayer(layerInstance)
      leaf.instances.delete(mapId)
    }
  })

  mapInstance.setTarget(null)
  mapInstances.delete(mapId)
}

const ensureRightMap = () => {
  if (!isShutterOpen.value || mapInstances.has('right')) {
    return
  }

  const target = rightMap.value
  if (!target) {
    return
  }

  const view = sharedView || mapInstances.get('left')?.getView() || new View({
    center: fromLonLat([105, 35]),
    zoom: 4
  })

  if (!sharedView) {
    sharedView = view
  }

  const mapInstance = createMap(target, view)
  registerMapInstance('right', mapInstance)
}

const toggleShutter = () => {
  isShutterOpen.value = !isShutterOpen.value
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

const createImportedLeaf = (featureCollection, title) => {
  const geoJsonString = JSON.stringify(featureCollection)
  const features = geoJsonFormat.readFeatures(geoJsonString, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  })

  const extent = features.reduce((acc, feature) => {
    const geometry = feature.getGeometry()
    if (geometry) {
      return extendExtent(acc, geometry.getExtent())
    }
    return acc
  }, createEmpty())

  const styleCache = {
    point: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: 'rgba(255, 152, 0, 0.9)' }),
        stroke: new Stroke({ color: '#ffffff', width: 2 })
      })
    }),
    line: new Style({
      stroke: new Stroke({ color: 'rgba(255, 152, 0, 0.85)', width: 2.5 })
    }),
    polygon: new Style({
      stroke: new Stroke({ color: 'rgba(255, 87, 34, 0.9)', width: 2 }),
      fill: new Fill({ color: 'rgba(255, 152, 0, 0.2)' })
    })
  }

  const getStyleForGeometry = (geometryType) => {
    switch (geometryType) {
      case 'Point':
      case 'MultiPoint':
        return styleCache.point
      case 'LineString':
      case 'MultiLineString':
        return styleCache.line
      case 'Polygon':
      case 'MultiPolygon':
      default:
        return styleCache.polygon
    }
  }

  return createOverlayLeaf(
    `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    () => {
      const layerFeatures = geoJsonFormat.readFeatures(geoJsonString, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })

      return new VectorLayer({
        source: new VectorSource({
          features: layerFeatures
        }),
        style: (feature) => {
          const geometryType = feature.getGeometry()?.getType()
          return getStyleForGeometry(geometryType)
        }
      })
    },
    { extent }
  )
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

onMounted(() => {
  sharedView = new View({
    center: fromLonLat([105, 35]),
    zoom: 4
  })

  if (leftMap.value) {
    const leftInstance = createMap(leftMap.value, sharedView)
    registerMapInstance('left', leftInstance)
  }

  if (isShutterOpen.value && rightMap.value) {
    const rightInstance = createMap(rightMap.value, sharedView)
    registerMapInstance('right', rightInstance)
  }
})

watch(isShutterOpen, (open) => {
  if (open) {
    nextTick(() => {
      ensureRightMap()
    })
  } else {
    destroyMap('right')
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
