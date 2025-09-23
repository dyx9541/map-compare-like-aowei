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
      >
        <span class="icon" aria-hidden="true">🗺️</span>
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
import { fromLonLat } from 'ol/proj'
import 'ol/ol.css'

const leftMap = ref(null)
const rightMap = ref(null)
let createdMaps = []

const createMap = (target, view) =>
  new Map({
    target,
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    view
  })

onMounted(() => {
  const view = new View({
    center: fromLonLat([0, 0]),
    zoom: 2
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
