<template>
  <div class="map-compare">
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
  display: flex;
  height: 100%;
}

.map {
  flex: 1;
  min-width: 0;
  height: 100%;
}
</style>
