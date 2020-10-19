<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100vw;
  height: 100vh;
}

.splitpanes {

  * > &__splitter {
    position: relative;
    min-width: 0 !important;
    min-height: 0 !important;
  }

  &__splitter:before {
    position: absolute;
    content: '';
    left: 0;
    top: 0;
    transition: opacity 0.4s;
    background-color: #65AEF6;
    opacity: 0;
    z-index: 1;
  }

  &__splitter:hover:before {
    opacity: 1;
  }

  &--vertical > .splitpanes__splitter:before {
    height: 100%;
    left: -2px;
    right: -2px;
  }

  &--horizontal > .splitpanes__splitter:before {
    width: 100%;
    top: -2px;
    bottom: -2px;
  }
}
</style>
