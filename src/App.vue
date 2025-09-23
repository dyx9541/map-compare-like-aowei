<template>
  <div class="app-layout">
    <div class="map-column">
      <div ref="leftMap" class="map"></div>
    </div>
    <div class="map-column">
      <div ref="rightMap" class="map"></div>
    </div>
  </div>
</template>

<script>
/* global ol */
import { onMounted, ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const leftMap = ref(null)
    const rightMap = ref(null)

    const createMap = (target) => {
      if (!target || typeof ol === 'undefined') {
        return null
      }

      return new ol.Map({
        target,
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([0, 0]),
          zoom: 2
        })
      })
    }

    onMounted(() => {
      createMap(leftMap.value)
      createMap(rightMap.value)
    })

    return {
      leftMap,
      rightMap
    }
  }
}
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
}

.app-layout {
  display: flex;
  height: 100vh;
}

.map-column {
  flex: 1;
  min-width: 0;
}

.map {
  width: 100%;
  height: 100%;
}
</style>
