<template>
  <div class="screen" ref="screen">
    <div class="screen__view">
    </div>
  </div>
</template>

<script>
import { fromEvent } from 'rxjs'
import { startWith, tap } from 'rxjs/operators'

export default {
  name: 'Screen',
  mounted () {
    fromEvent(window, 'resize')
      .pipe(
        startWith(''),
        tap(() => {
          const { width, height } = this.$refs.screen.getBoundingClientRect()
          console.log(width, height)
        })
      )
      .subscribe(res => {
        console.log(res)
      })
  }
}
</script>

<style scoped lang="scss">
.screen {
  position: relative;
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
