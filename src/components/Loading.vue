<template>
  <div id="loading-comp">
    <img class="loading-img" src="https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca_w200.gif">
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Loading'
}
</script>

<style lang="scss">
#loading-comp {
  display: flex;
  height: 100%;
  width: 100%;

  .loading-img {
    margin: auto;
  }
}
</style>