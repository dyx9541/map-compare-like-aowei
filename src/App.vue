<template>
  <div class="app-layout"> 
    <MapCompare />
 
  </div>
</template>

<script>
 
import MapCompare from './components/MapCompare.vue'

export default {
  name: 'App',
  components: {
    MapCompare
 
  }
}
</script>

<style> 
html,
body,
#app {
 
  height: 100%;
  margin: 0;
}

.app-layout {
 
  height: 100%;
}
</style>
