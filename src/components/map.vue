<template>
  <v-layout fill-height column>
    <v-list>
      <v-list-tile value="true" v-for="(item, i) in items" :key="i">
        <v-list-tile-action>
          <v-icon v-html="item.icon"></v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title v-text="item.title"></v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-flex ref="mapRef">
      <img v-if="listeningUserCount === 0" class="globe" src="@/assets/globe.jpg" />
      <div v-else-if="center">
        <gmap-map :center="center" :zoom="zoom" :style="`width:100%;  height: ${height}px;`" :options="mapOption">
          <gmap-circle :center="center" :radius="radius"></gmap-circle>
        </gmap-map>
      </div>
      <div class="tip">
        <div>You can listen to {{listeningUserCount}} user{{listeningUserCount > 1 ? 's' : ''}} near you.</div>
        <div v-if="listeningUserCount === 0">Hence you have access to locaries from the whole globe!</div>
        <div v-else>
          <span>The furthest user is within {{listeningRadius}} km,</span>
          <span>Hence you have access to locaries within this distance</span>
        </div>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data () {
    return {
      items: [{
        icon: 'map',
        title: 'My Scope Range'
      }],
      mapOption: {
        disableDefaultUI: true,
        gestureHandling: 'none',
        zoomControl: false
      }
    }
  },
  computed: {
    center () {
      const coords = this.$store.getters.position
      const center = coords ? { lat: coords.latitude, lng: coords.longitude } : null
      return center
    },
    height () {
      return this.$refs.mapRef.clientHeight
    },
    radius () {
      // google map radius in m
      return this.$store.getters.listeningRadius * 1000
    },
    listeningRadius () {
      // firebase radius in km
      return this.$store.getters.listeningRadius
    },
    zoom () {
      const radius = this.$store.getters.listeningRadius
      let x = 1
      for (let index = 0; index <= 14; index++) {
        if (x << index <= radius && x << (index + 1) > radius) {
          return 14 - index
        }
      }
    },
    listeningUserCount () {
      return this.$store.getters.listeningUserCount
    }
  }
}
</script>
<style scoped>
.globe {
  width: 100%;
  object-fit: contain;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.tip {
  position: absolute;
  top: 50%;
  background: white;
  max-width: 70%;
  left: 50%;
  transform: translate(-50%, -30%);
  border-radius: 20px;
  padding: 10px;
}
</style>
