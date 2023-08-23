<template>
  <v-btn id="layers-btn" :class="asideStatus ? 'aside-open': ''" @click="toggleAside()">
    <v-icon class="layers-icon" icon="mdi-layers" />
  </v-btn>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AsideBtn',
  computed: {
    ...mapGetters({
      getAsideStatus: 'aside/getAsideStatus'
    }),
    asideStatus() {
      return this.getAsideStatus
    }
  },
  methods: {
    ...mapActions({
      setAsideStatus: 'aside/setAsideStatus'
    }),
    toggleAside() {
      this.setAsideStatus(!this.asideStatus)
    }
  }
}
</script>

<style lang="scss">
#layers-btn {
  position: absolute;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  top: 56px;
  right: 0;
  width: 50px;
  height: 50px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  border-left: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px 0 0 10px;
  z-index: 4;
  transition: all 0.1s ease-out;

  &.aside-open {
    margin-right: 400px;
  }

  .layers-icon {
    font-size: 26px;
  }
}
</style>