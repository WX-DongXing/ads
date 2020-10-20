export const ScreenMutationTypes = {
  SET_VIEW_SCALE: 'SET_VIEW_SCALE[设置缩放比例]',
  SET_CURSOR: 'SET_CURSOR[设置鼠标指针及功能模式]'
}

export default {
  namespaced: true,
  state: {
    type: '',
    viewScale: 0,
    cursor: 'default'
  },
  getters: {},
  mutations: {
    [ScreenMutationTypes.SET_VIEW_SCALE] (state, payload) {
      state.viewScale = payload
    },
    [ScreenMutationTypes.SET_CURSOR] (state, payload) {
      state.cursor = payload
    }
  },
  actions: {}
}
