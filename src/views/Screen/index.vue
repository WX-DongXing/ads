<template>
  <div class="screen" ref="screen">

      <div class="screen__view view" ref="view">
        <widget
          v-for="widget in widgets"
          :key="widget.id"
          :widget="widget"
          :ref="widget.widgetId"
          @select="(rect) => select$.next({ el: 'widget', events: rect, widget })"
        />
      </div>

      <Wrapper ref="wrapper" v-stream:adjust="adjust$" />
      <!-- / 选择指示器 -->
  </div>
</template>

<script>
import _ from 'lodash'
import key from 'keymaster'
import anime from 'animejs'
import { fromEvent, Subject, merge, zip } from 'rxjs'
import { takeWhile, map, filter, startWith, pluck } from 'rxjs/operators'
import { mapState, mapMutations, createNamespacedHelpers } from 'vuex'
import { ScreenMutationTypes } from '@/store/modules/screen'
import Widget from '@/components/Widget'
import Wrapper from '@/components/Wrapper/index'
import AdjustMixins from '@/components/Wrapper/AdjustMixins'
import WrapperService from '@/components/Wrapper/WrapperService'

const stateshot = createNamespacedHelpers('vuexstateshot')

export default {
  name: 'Screen',
  mixins: [AdjustMixins],
  // 选择器调整事件流
  domStreams: ['select$', 'adjust$'],
  components: {
    Widget,
    Wrapper
  },
  data () {
    return {
      isSubscribed: true,
      select$: new Subject(),
      wrapperChange$: new WrapperService().change$
    }
  },
  computed: {
    ...mapState('screen', ['viewScale', 'widgets', 'activeWidget'])
  },
  mounted () {
    this.registerKeyMap()

    fromEvent(this.$refs.screen, 'wheel')
      .pipe(
        takeWhile(() => this.isSubscribed),
        startWith('')
      )
      .subscribe(event => {
        const scale = this.viewScale + event.deltaY * 0.0001
        this.setView(this.$refs.view.getBoundingClientRect())
        this.setViewScale(scale)
        this.handleViewScale(scale)
      })

    // 重新计算视图位置对象
    setTimeout(() => {
      this.setView(this.$refs.view.getBoundingClientRect())
    }, 1000)

    merge(
      this.select$,
      // 作为子元素的选择器事件取消冒泡，只有 mousedown 和 mouseup 时间逐次在 view 视图上触发时，才响应为一次事件
      zip(
        fromEvent(this.$refs.screen, 'mousedown', { capture: false }),
        fromEvent(this.$refs.screen, 'mouseup', { capture: false })
      ).pipe(
        map(events => ({ el: 'screen', events })),
        filter(({ events: [mousedownEvent] }) => [...mousedownEvent.target.classList].includes('screen'))
      ),
      zip(
        fromEvent(this.$refs.view, 'mousedown', { capture: false }),
        fromEvent(this.$refs.view, 'mouseup', { capture: false })
      ).pipe(
        map(events => ({ el: 'view', events })),
        filter(({ events: [mousedownEvent] }) => [...mousedownEvent.target.classList].includes('view'))
      )
    )
      .pipe(
        takeWhile(() => this.isSubscribed)
      )
      .subscribe(({ el, events, widget }) => {
        let styles
        let activeWidget
        switch (el) {
          case 'widget':
            const { top: screenTop, left: screenLeft } = this.$refs.screen.getBoundingClientRect()
            const { width, height, top, left } = events
            activeWidget = { ...widget, width, height }
            styles = {
              display: 'block',
              width,
              height,
              top: top - screenTop,
              left: left - screenLeft
            }
            break
          case 'screen':
          case 'view':
            styles = {
              display: 'none'
            }
            break
          default:
            activeWidget = null
            break
        }
        if (el !== 'adjust') {
          // 设置激活的部件
          this.setActiveWidget(activeWidget)
          // 设置选择器样式
          styles && this.$refs.wrapper.setSize(styles)
        }
      })

    // 部件尺寸调整
    this.adjust$
      .pipe(
        takeWhile(() => this.isSubscribed),
        pluck('event', 'msg')
      )
      .subscribe((mutation) => {
        const { widgetId } = this.activeWidget
        const [targetComponent] = this.$refs[widgetId]
        const { event: { mouseType } } = mutation
        // 当鼠标抬起时更新部件位置状态
        if (mouseType === 'mouseup') {
          const {
            top, left, width, height
          } = window.getComputedStyle(targetComponent.$el, null)
          const widgetPositionState = {
            top: (Number(top.split('px')[0]) || 0) / this.viewScale,
            left: (Number(left.split('px')[0]) || 0) / this.viewScale,
            width: Number(width.split('px')[0]) || 0,
            height: Number(height.split('px')[0]) || 0
          }
          // 更新部件位置信息
          const widget = _.cloneDeep(this.activeWidget)
          Object.assign(widget, widgetPositionState)
          this.setActiveWidget(widget)
          return
        }
        // 调整部件大小
        this.adjust({
          target: targetComponent.$el,
          mutation
        })
      })
  },
  methods: {
    ...mapMutations('screen', {
      setView: ScreenMutationTypes.SET_VIEW,
      setViewScale: ScreenMutationTypes.SET_VIEW_SCALE,
      setCursor: ScreenMutationTypes.SET_CURSOR,
      setActiveWidget: ScreenMutationTypes.SET_ACTIVE_WIDGET
    }),
    ...stateshot.mapActions(['undo']),
    registerKeyMap () {
      key('q', this.handleKeySelect)
      key('w', this.handleKeyRotate)
      key('e', this.handleKeyMove)
      key('⌘+z, ctrl+z', this.handleUndo)
    },
    cancelKapMap () {
      key.unbind('⌘+z, ctrl+z')
    },
    async handleUndo () {
      const { screen: { type, viewScale } } = await this.undo()
      switch (type) {
        case 'scale':
          this.handleViewScale(viewScale)
          break
        default:
          break
      }
    },
    handleCursor (mode) {
      this.setCursor(mode)
      anime.set(this.$refs.screen, {
        cursor: mode
      })
    },
    handleKeySelect () {
      this.handleCursor('default')
    },
    handleKeyRotate () {
      this.handleCursor('crosshair')
    },
    handleKeyMove () {
      this.handleCursor('pointer')
    },
    handleViewScale (scale) {
      let scaleValue = scale
      if (!scale) {
        const { width, height } = this.$refs.screen.getBoundingClientRect()
        const direction = width / height - 1
        scaleValue = direction ? (height - 48) / 1080 : (width - 48) / 1920
      }
      this.setViewScale(scaleValue)
      anime({
        targets: this.$refs.view,
        scale: scaleValue
      })
    }
  },
  beforeDestroy () {
    this.isSubscribed = false
    this.cancelKapMap()
  }
}
</script>

<style scoped lang="scss">
.screen {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 24px;
  overflow: hidden;

  &__view {
    position: absolute;
    width: 1920px;
    height: 1080px;
    background: #ABABAB;
    overflow: hidden;
  }
}
</style>
