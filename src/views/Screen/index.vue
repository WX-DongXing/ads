<template>
  <div class="screen" ref="screen">
    <div class="screen__view view" ref="view">

      <Widget width="1200" height="700" @select="(rect) => select$.next({ el: 'widget', events: rect })" />
      <Widget width="1420" height="500" @select="(rect) => select$.next({ el: 'widget', events: rect })" />

    </div>
  </div>
</template>

<script>
import key from 'keymaster'
import anime from 'animejs'
import { fromEvent, Subject, merge, zip } from 'rxjs'
import { takeWhile, map, filter } from 'rxjs/operators'
import { mapState, mapMutations, createNamespacedHelpers } from 'vuex'
import { ScreenMutationTypes } from '@/store/modules/screen'
import Widget from '@/components/Widget'

const stateshot = createNamespacedHelpers('vuexstateshot')

export default {
  name: 'Screen',
  // 选择器调整事件流
  domStreams: ['select$', 'adjust$'],
  components: {
    Widget
  },
  data () {
    return {
      isSubjected: true,
      select$: new Subject()
    }
  },
  computed: {
    ...mapState('screen', ['viewScale'])
  },
  mounted () {
    this.registerKeyMap()
    this.handleViewScale()

    fromEvent(this.$refs.screen, 'wheel')
      .pipe(
        takeWhile(() => this.isSubjected)
      )
      .subscribe(event => {
        const scale = this.viewScale + event.deltaY * 0.0001
        this.setViewScale(scale)
        this.handleViewScale(scale)
      })

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
        takeWhile(() => this.isSubjected)
      )
      .subscribe(res => {
        this.$emit('select', res)
      })
  },
  methods: {
    ...mapMutations('screen', {
      setViewScale: ScreenMutationTypes.SET_VIEW_SCALE,
      setCursor: ScreenMutationTypes.SET_CURSOR
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
    this.isSubjected = false
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
