<template>
  <div class="map-compare">
    <div class="map-toolbar">
      <button
        class="toolbar-button"
        type="button"
        title="图层管理"
        aria-label="图层管理"
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
        @click="toggleBasemapPanel"
      >
        <span class="icon" aria-hidden="true">🗺️</span>
      </button>
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
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import 'ol/ol.css'

const leftMap = ref(null)
const rightMap = ref(null)
let createdMaps = []

const showBasemapPanel = ref(false)
const selectedBasemap = ref('tianditu')
const tiandituToken = process.env.VUE_APP_TIANDITU_TOKEN || ''

const basemapOptions = [
  {
    key: 'tianditu',
    label: '天地图',
    createLayer: () =>
      new TileLayer({
        source: new XYZ({
          url: `https://t4.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${tiandituToken}`,
          attributions: '© 天地图',
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          wrapX: true
        })
      })
  },
  {
    key: 'gdSat',
    label: '高德卫星图',
    createLayer: () =>
      new TileLayer({
        source: new XYZ({
          url: `https://webst01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&style=6`,
          attributions: '© 高德卫星图',
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          wrapX: true
        })
      })
  },
  {
    key: 'tiandituRd',
    label: '天地图路网图',
    createLayer: () =>
      new TileLayer({
        source: new XYZ({
          url: `http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tiandituToken}`,
          attributions: '© 天地图',
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          wrapX: true
        })
      })
  },
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
    label: 'ArcGIS',
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
]

const createBasemapLayer = (key) => {
  const option = basemapOptions.find((item) => item.key === key)
  return option ? option.createLayer() : basemapOptions[0].createLayer()
}

const toggleBasemapPanel = () => {
  showBasemapPanel.value = !showBasemapPanel.value
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
    center: fromLonLat([118, 32]),
    zoom: 6
  })

  createdMaps = [leftMap.value, rightMap.value]
    .filter(Boolean)
    .map((target) => createMap(target, view))
})

onBeforeUnmount(() => {
  createdMaps.forEach((mapInstance) => mapInstance.setTarget(null))
  createdMaps = []
})
</script>

<style scoped>
.map-compare {
  position: relative;
  display: flex;
  height: 100%;
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
