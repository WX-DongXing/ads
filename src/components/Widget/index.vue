<template>
  <div
    class="widget"
    :style="{ top: `${widget.top}px`, left: `${widget.left}px` }"
    @click="handleClick" ref="widget">
    <component :is="widget.type" />
  </div>
</template>

<script>
import Rectangle from '@/components/Rectangle'
import Triangle from '@/components/Triangle'
import Circles from '@/components/Circles'
import Cube from '@/components/Cube'

export default {
  name: 'Widget',
  props: {
    widget: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    Rectangle,
    Triangle,
    Circles,
    Cube
  },
  data () {
    return {}
  },
  methods: {
    handleClick () {
      this.$emit('select', this.$refs.widget.getBoundingClientRect())
    }
  }
}
</script>

<style scoped lang="scss">
.widget {
  position: absolute;
}
</style>
