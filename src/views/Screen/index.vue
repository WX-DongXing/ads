<template>
  <div class="screen" ref="screen">
    <div class="screen__view" ref="view">
    </div>
  </div>
</template>

<script>
import key from 'keymaster'
import anime from 'animejs'
import { fromEvent } from 'rxjs'
import { takeWhile } from 'rxjs/operators'
import { mapState, mapMutations, createNamespacedHelpers } from 'vuex'
import { ScreenMutationTypes } from '@/store/modules/screen'
const stateshot = createNamespacedHelpers('vuexstateshot')

export default {
  name: 'Screen',
  data () {
    return {
      isSubjected: true
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
  },
  methods: {
    ...mapMutations('screen', {
      setViewScale: ScreenMutationTypes.SET_VIEW_SCALE,
      setCursor: ScreenMutationTypes.SET_CURSOR
    }),
    ...stateshot.mapActions(['undo']),
    registerKeyMap () {
      key('v', this.handleKeySelect)
      key('w', this.handleKeyRotate)
      key('H', this.handleKeyMove)
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
        width: 1920 * scaleValue,
        height: 1080 * scaleValue
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
  }
}
</style>
