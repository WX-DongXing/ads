<template>
  <div class="ads">
    <header>
      <p>ADS</p>
      <div class="ads__mode">
        <span
          :class="[cursor === 'default' && 'ads__mode--active']"
          @click="() => switchCursor('default')"
        >
          选择
        </span>
        <span
          :class="[cursor === 'crosshair' && 'ads__mode--active']"
          @click="() => switchCursor('crosshair')"
        >
          旋转
        </span>
        <span
          :class="[cursor === 'pointer' && 'ads__mode--active']"
          @click="() => switchCursor('pointer')"
        >
          移动
        </span>
      </div>
    </header>
    <splitpanes class="ads__main">
      <pane class="ads__aside" size="15"></pane>
      <pane class="ads__container">
        <splitpanes horizontal>
          <pane class="ads__scene">

            <screen ref="screen" @select="(data) => select$.next(data)" />

            <Wrapper ref="wrapper" v-stream:adjust="adjust$" />
            <!-- / 选择指示器 -->

          </pane>
          <pane min-size="25" size="25" class="ads__control">
          </pane>
        </splitpanes>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import { Subject } from 'rxjs'
import { takeWhile } from 'rxjs/operators'
import { mapState } from 'vuex'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import Screen from './Screen'
import Wrapper from '@/components/Wrapper/index'
import AdjustMixins from '@/components/Wrapper/AdjustMixins'
import WrapperService from '@/components/Wrapper/WrapperService'

export default {
  name: 'ADS',
  components: {
    Screen,
    Splitpanes,
    Pane,
    Wrapper
  },
  mixins: [AdjustMixins],
  domStreams: ['adjust$'],
  computed: {
    ...mapState('screen', ['cursor', 'viewScale'])
  },
  data () {
    return {
      isSubjected: true,
      wrapperChange$: new WrapperService().change$,
      select$: new Subject()
    }
  },
  mounted () {
    this.select$.asObservable()
      .pipe(
        takeWhile(() => this.isSubjected)
      )
      .subscribe(({ el, events }) => {
        let styles
        switch (el) {
          case 'widget':
            // eslint-disable-next-line no-case-declarations
            const { width, height, top, left } = events
            styles = {
              display: 'block',
              width,
              height,
              top,
              left
            }
            break
          case 'screen':
          case 'view':
            styles = {
              display: 'none'
            }
            break
          default:
            break
        }
        // 设置选择器样式
        styles && this.$refs.wrapper.setSize(styles)
      })

    this.adjust$
      .pipe()
      .subscribe(res => console.log(res))
  },
  methods: {
    switchCursor (mode) {
      this.$refs.screen.handleCursor(mode)
    }
  },
  beforeDestroy () {
    this.isSubjected = false
  }
}
</script>
<style scoped lang="scss">
.ads {
  display: flex;
  flex-flow: column nowrap;

  header {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 48px;
    box-sizing: border-box;
    padding: 0 16px;
    background: #414141;

    p {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      color: #ABABAB;
    }
  }

  &__mode {
    margin-left: 24px;

    span {
      cursor: pointer;
      font-size: 12px;
      color: rgba(136, 136, 136, 1);
    }

    span + span {
      margin-left: 12px;
    }

    &--active {
      color: rgba(255, 255, 255, 1) !important;
    }
  }

  &__main {
    width: 100%;
    height: calc(100vh - 48px);
  }

  &__aside {
    height: 100%;
    background: #313131;
  }

  &__container {
    width: 100%;
    height: calc(100vh - 48px);
  }

  &__scene {
    width: 100%;
    background: #1D1D1D;
    overflow: hidden;
  }

  &__control {
    width: 100%;
    background: #292929;
  }
}
</style>
