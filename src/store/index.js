import Vue from 'vue'
import Vuex from 'vuex'
import { createPlugin } from 'vuex-stateshot'
import screen from '@/store/modules/screen'
import camera from '@/store/modules/camera'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    screen,
    camera
  },
  plugins: [
    createPlugin({
      rootModule: {
        actions: [],
        mutations: []
      },
      screen: {
        actions: [],
        mutations: [
        ]
      }
    }, {
      maxLength: 20
    })
  ]
})
