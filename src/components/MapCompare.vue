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
    <div ref="leftMap" class="map"></div>
    <div ref="rightMap" class="map"></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
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
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import CircleStyle from 'ol/style/Circle'
import 'ol/ol.css'

const leftMap = ref(null)
const rightMap = ref(null)
let createdMaps = []

const showBasemapPanel = ref(false)
const showLayerPanel = ref(false)
const showRoadNetwork = ref(false)
const selectedBasemap = ref('tiandituImagery')
const tiandituToken = process.env.VUE_APP_TIANDITU_TOKEN || ''

const handleAction = (action) => {
  console.info(`[toolbar] ${action} clicked`)
}

const createOverlayLeaf = (key, title, createLayer) => ({
  key,
  title,
  createLayer,
  visible: true,
  instances: []
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
          url: `https://t4.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${tiandituToken}`,
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
          url: 'https://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}&scl=1&ltype=2',
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
          url: 'https://webst01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&style=6',
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

  createdMaps.forEach((mapInstance) => {
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
  instances: []
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

const isGroupChecked = (group) => group.children.every((leaf) => leaf.visible)

const isGroupIndeterminate = (group) => {
  const visibleCount = group.children.filter((leaf) => leaf.visible).length
  return visibleCount > 0 && visibleCount < group.children.length
}

const createMap = (target, view) =>
  new Map({
    target,
    layers: [
      createBasemapLayer(selectedBasemap.value)
    ],
    view
  })

onMounted(() => {
  const view = new View({
    center: fromLonLat([105, 35]),
    zoom: 4
  })

  createdMaps = [leftMap.value, rightMap.value]
    .filter(Boolean)
    .map((target) => {
      const mapInstance = createMap(target, view)
      const roadNetworkLayer = roadNetworkOverlay.createLayer()
      roadNetworkLayer.setVisible(showRoadNetwork.value)
      mapInstance.addLayer(roadNetworkLayer)
      roadNetworkOverlay.instances.push(roadNetworkLayer)
      forEachOverlayLeaf((leaf) => {
        const layerInstance = leaf.createLayer()
        layerInstance.setVisible(leaf.visible)
        mapInstance.addLayer(layerInstance)
        leaf.instances.push(layerInstance)
      })
      return mapInstance
    })
})

onBeforeUnmount(() => {
  createdMaps.forEach((mapInstance) => mapInstance.setTarget(null))
  createdMaps = []
  forEachOverlayLeaf((leaf) => {
    leaf.instances.splice(0, leaf.instances.length)
  })
  roadNetworkOverlay.instances.splice(0, roadNetworkOverlay.instances.length)
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

.toolbar-button:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.icon {
  font-size: 18px;
  line-height: 1;
}
</style>
