<template>
  <div id="app">
    <home v-show="connect == false" style="height: 100vh;"></home>
    <mouse v-show="connect"></mouse>
  </div>
</template>

<script>
import Home from './views/Home.vue'
import Mouse from './views/Mouse.vue'

export default {
  name: 'App',
  components: {
    Home,
    Mouse
  },
  data() {
    return {
      connect:false,
    }
  },
  mounted() {
    this.$bus.$on("deviceConnect",value => {
      this.connect = value;
    });
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  overflow: auto;
  /* height: 100vh; */
  background-repeat: no-repeat;
  background-size: cover;
  background-image: url('./assets/img/home_bg.png');
}
</style>
