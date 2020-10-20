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
            <screen ref="screen" />
          </pane>
          <pane min-size="25" size="25" class="ads__control">
          </pane>
        </splitpanes>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import Screen from './Screen'

export default {
  name: 'ADS',
  components: {
    Screen,
    Splitpanes,
    Pane
  },
  computed: {
    ...mapState('screen', ['cursor'])
  },
  methods: {
    switchCursor (mode) {
      this.$refs.screen.handleCursor(mode)
    }
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
