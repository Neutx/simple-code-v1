<template>
  <div class="beta-logo-container">
    <span class="beta-text">BETA</span>
  </div>
</template>

<script>
export default {
  name: 'BetaLogo',
}
</script>

<style lang="scss" scoped>
.beta-logo-container {
  position: fixed;
  bottom: 2vh;
  right: 2vh;
  padding: 0.8vh 1.6vh;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.6vh;
  backdrop-filter: blur(1vh);
  z-index: 1000;
  box-shadow: 0 0.4vh 1.2vh rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  /* Fixed size regardless of zoom */
  transform: scale(1);
  transform-origin: bottom right;
}

.beta-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.4vh;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
</style> 