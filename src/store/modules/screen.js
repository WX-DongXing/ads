export const ScreenMutationTypes = {
  SET_VIEW_SCALE: 'SET_VIEW_SCALE[设置缩放比例]',
  SET_CURSOR: 'SET_CURSOR[设置鼠标指针及功能模式]',
  SET_VIEW: 'SET_VIEW[设置视图对象]',
  ADD_WIDGET: 'ADD_WIDGETS[添加部件]',
  SET_ACTIVE_WIDGET: 'SET_ACTIVE_WIDGET[设置激活的部件]'
}

export default {
  namespaced: true,
  state: {
    type: '',
    viewScale: 0,
    cursor: 'default',
    view: null,
    widgets: [],
    activeWidget: null
  },
  getters: {},
  mutations: {
    [ScreenMutationTypes.SET_VIEW_SCALE] (state, payload) {
      state.viewScale = payload
    },
    [ScreenMutationTypes.SET_CURSOR] (state, payload) {
      state.cursor = payload
    },
    [ScreenMutationTypes.SET_VIEW] (state, payload) {
      state.view = payload
    },
    [ScreenMutationTypes.ADD_WIDGET] (state, payload) {
      state.widgets.push(payload)
    },
    [ScreenMutationTypes.SET_ACTIVE_WIDGET] (state, payload) {
      state.activeWidget = payload
    }
  },
  actions: {}
}
