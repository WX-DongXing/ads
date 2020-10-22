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
    <splitpanes class="ads__main" @resized="handleSplit" @ready="handleSplit">
      <pane class="ads__aside" size="15">
        <div
          class="ads__template"
          v-for="template in Templates"
          v-stream:mousedown="{ subject: itemMouseDown$, data: template }"
          :key="template.type">
          <p>{{ template.name }}</p>
        </div>
      </pane>
      <pane class="ads__container">
        <splitpanes horizontal @resized="handleSplit">
          <pane class="ads__scene">

            <screen ref="screen" @select="(data) => select$.next(data)"  />

          </pane>
          <pane min-size="25" size="25" class="ads__control">
          </pane>
        </splitpanes>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import _ from 'lodash'
import anime from 'animejs'
import { Subject, fromEvent, merge } from 'rxjs'
import { takeWhile, tap, map, takeUntil, switchMap, withLatestFrom, first, filter } from 'rxjs/operators'
import { mapMutations, mapState } from 'vuex'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import Screen from './Screen'
import { ScreenMutationTypes } from '@/store/modules/screen'
import Widget from '@/model/Widget'

const Templates = [
  {
    name: '矩形',
    type: 'Rectangle'
  },
  {
    name: '三角形',
    type: 'Triangle'
  },
  {
    name: '圆形',
    type: 'Circles'
  },
  {
    name: '立方体',
    type: 'Cube'
  }
]

export default {
  name: 'ADS',
  components: {
    Screen,
    Splitpanes,
    Pane
  },
  computed: {
    ...mapState('screen', ['view', 'cursor', 'viewScale', 'widgets'])
  },
  data () {
    return {
      isSubscribed: true,
      Templates
    }
  },
  subscriptions () {
    // 模板 mousedown 事件
    this.itemMouseDown$ = new Subject()
    // 全局 mousemove 事件
    this.documentMove$ = fromEvent(document, 'mousemove')
    // 全局 mouseup 事件
    this.documentUp$ = fromEvent(document, 'mouseup')
  },
  mounted () {
    // 模板移动至视图操作
    this.itemMouseDown$
      .pipe(
        takeWhile(() => this.isSubscribed),
        tap(({ event }) => {
          this.cloneTemplate = event.target.cloneNode(true)
          const { x, y } = event.target.getBoundingClientRect()
          const { pageX, pageY } = event
          this.xDistance = Math.abs(pageX - x)
          this.yDistance = Math.abs(pageY - y)
          anime.set(this.cloneTemplate, {
            position: 'fixed',
            margin: 0,
            top: y,
            left: x,
            zIndex: 3
          })
          document.body.append(this.cloneTemplate)
          event.preventDefault()
        }),
        map(() => this.documentMove$.pipe(takeUntil(this.documentUp$))),
        switchMap(move$ => merge(this.documentUp$.pipe(first()), move$)),
        withLatestFrom(this.itemMouseDown$, (event, { data }) => ({ event, data })),
        tap(({ event, data }) => {
          const { pageX, pageY } = event
          // 设置克隆节点的位置
          anime.set(this.cloneTemplate, {
            transformOrigin: '0 0',
            top: pageY - this.yDistance,
            left: pageX - this.xDistance
          })
        }),
        filter(({ event }) => event.type === 'mouseup')
      )
      .subscribe(({ event, data }) => {
        if (this.isWithinScope(event)) {
          const { x, y } = this.view
          const targetRect = event.target.getBoundingClientRect()
          const zIndexList = [...this.widgets].map(widget => widget.zIndex)
          // 部件层级
          const zIndex = _.isEmpty(zIndexList) ? 0 : Math.max(...zIndexList) + 1
          // 将模板对应为部件
          const widget = new Widget({
            ...data,
            zIndex,
            top: (targetRect.y - y) / this.viewScale,
            left: (targetRect.x - x) / this.viewScale
          })
          // 将当期拖动的模板添加到视图的部件库中
          this.addWidget(widget)
          // 选择器选中该部件
          // this.wrapperService.next({ el: 'widget', widget })
        }
        // 从当前文档中移除该dom节点
        document.body.removeChild(this.cloneTemplate)
      })
  },
  methods: {
    ...mapMutations('screen', {
      setView: ScreenMutationTypes.SET_VIEW,
      addWidget: ScreenMutationTypes.ADD_WIDGET
    }),
    switchCursor (mode) {
      this.$refs.screen.handleCursor(mode)
    },
    handleSplit () {
      const [viewDom] = document.getElementsByClassName('view')
      this.setView(viewDom.getBoundingClientRect())
    },
    /**
     * 是否进入画板区域
     * @param pageX
     * @param pageY
     * @returns {boolean|boolean}
     */
    isWithinScope ({ pageX, pageY }) {
      const { x, y, width, height } = this.view
      const xRange = {
        min: x,
        max: x + width
      }
      const yRange = {
        min: y,
        max: y + height
      }
      return (pageX >= xRange.min && pageX <= xRange.max) &&
        (pageY >= yRange.min && pageY <= yRange.max)
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
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: flex-start;
    align-content: flex-start;
    height: 100%;
    background: #313131;
    box-sizing: border-box;
    padding: 16px;
  }

  &__template {
    flex: none;
    width: 56px;
    height: 56px;
    background: #a5a5a5;
    border-radius: 4px;
    text-align: center;
    line-height: 32px;
    font-size: 12px;
    color: white;
    cursor: pointer;

    p {
      pointer-events: none;
    }

    &:first-child {
      margin-right: 16px;
      margin-bottom: 16px;
    }

    & + & {
      margin-right: 16px;
      margin-bottom: 16px;
    }

    &:last-child {
      margin-right: 0;
      margin-bottom: 16px;
    }
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
