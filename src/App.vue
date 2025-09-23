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
import { onMounted, ref } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import 'ol/ol.css'

export default {
  name: 'App',
  setup() {
    const leftMap = ref(null)
    const rightMap = ref(null)

    const createMap = (target) => {
      if (!target) {
        return null
      }

      return new Map({
        target,
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: fromLonLat([0, 0]),
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
