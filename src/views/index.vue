<template>
  <div class="ads">
    <header>
      <p>ADS</p>
    </header>
    <splitpanes class="ads__main">
      <pane class="ads__aside" size="15"></pane>
      <pane class="ads__container">
        <splitpanes horizontal>
          <pane class="ads__scene">
            <screen />
          </pane>
          <pane min-size="25" size="25" class="ads__control">
          </pane>
        </splitpanes>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import Screen from './Screen'

export default {
  name: 'ADS',
  components: {
    Screen,
    Splitpanes,
    Pane
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
    justify-content: space-between;
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
