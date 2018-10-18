// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueResource from 'vue-resource'
import store from './store'
import VueFire from 'vuefire'
import {
  Vuetify,
  VApp,
  VAlert,
  VCard,
  VNavigationDrawer,
  VFooter,
  VList,
  VBtn,
  VIcon,
  VGrid,
  VToolbar,
  VSubheader,
  VTextarea,
  VImg,
  transitions,
  VTextField,
  VDialog,
  VDivider
} from 'vuetify'
import '../node_modules/vuetify/src/stylus/app.styl'
import VueObserveVisibility from 'vue-observe-visibility'
import * as VueGoogleMaps from 'vue2-google-maps'
Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyCgYdhYLkKleeZbS8PrknHCzEe453hscg4',
    libraries: 'places' // necessary for places input
  }
})
Vue.use(VueObserveVisibility)
Vue.use(VueFire)
Vue.use(Vuetify, {
  components: {
    VApp,
    VAlert,
    VCard,
    VNavigationDrawer,
    VFooter,
    VList,
    VBtn,
    VIcon,
    VGrid,
    VToolbar,
    VSubheader,
    VTextarea,
    VImg,
    transitions,
    VTextField,
    VDialog,
    VDivider
  }
})
Vue.use(VueResource)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
