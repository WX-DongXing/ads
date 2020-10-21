/**
* dom元素调整 mixins
* Author: dong xing
* Date: 2019/11/15
* Time: 2:32 下午
* Email: dong.xing@outlook.com
*/
<script>
import anime from 'animejs'
import { mapState } from 'vuex'

export default {
  name: 'AdjustMixins',
  data: () => ({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  }),
  computed: {
    ...mapState('screen', ['viewScale'])
  },
  methods: {
    /**
     * 通用dom元素调整方法，以方便部件使用
     * @param target dom元素
     * @param mutation wrapper选择器标准事件流
     */
    // Todo 修改事件流格式，格式化为绝对位置进行修改
    adjust ({ target, mutation }) {
      const { event, originalState } = mutation
      const {
        eventType, position, distance, type, direction
      } = event
      // 初始位置
      const {
        top, left, width, height
      } = originalState
      switch (eventType) {
        case 'MOVE':
          anime.set(target, {
            top: top + position.top,
            left: left + position.left
          })
          break
        case 'SINGLE':
          switch (type) {
            case 'tc':
              anime.set(target, {
                top: top - distance,
                height: height + distance
              })
              break
            case 'cr':
              anime.set(target, {
                width: width + distance
              })
              break
            case 'bc':
              anime.set(target, {
                height: height + distance
              })
              break
            case 'cl':
              anime.set(target, {
                left: left - distance,
                width: width + distance
              })
              break
            default:
              break
          }
          break
        case 'SCALE':
          // eslint-disable-next-line no-case-declarations
          const absDistance = direction === 'EXPAND'
            ? Math.abs(distance) : -Math.abs(distance)
          switch (type) {
            case 'tl':
              anime.set(target, {
                top: top + distance,
                left: left + distance,
                width: width - distance,
                height: height - distance
              })
              break
            case 'tr':
              anime.set(target, {
                top: top - absDistance,
                width: width + absDistance,
                height: height + absDistance
              })
              break
            case 'br':
              anime.set(target, {
                width: width + distance,
                height: height + distance
              })
              break
            case 'bl':
              anime.set(target, {
                left: left - absDistance,
                width: width + absDistance,
                height: height + absDistance
              })
              break
            default:
              break
          }
          break
        default:
          break
      }
    }
  }
}
</script>
