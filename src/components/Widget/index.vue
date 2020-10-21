<template>
  <div
    class="widget"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      background: `hsla(${Math.random() * 100}, 50%, 60%, 1)`
    }"
    @click="handleClick" ref="widget">
  </div>
</template>

<script>
export default {
  name: 'Widget',
  props: {
    width: {
      type: Number,
      default: 1080
    },
    height: {
      type: Number,
      default: 1080
    }
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
}
</style>
