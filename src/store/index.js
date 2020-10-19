import Vue from 'vue'
import Vuex from 'vuex'
import screen from '@/store/modules/screen'
import camera from '@/store/modules/camera'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    screen,
    camera
  }
})
