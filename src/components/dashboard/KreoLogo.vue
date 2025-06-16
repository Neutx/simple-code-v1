<template>
  <div class="kreo-logo">
    <img 
      :src="logoSrc" 
      alt="Kreo Logo"
      class="logo-image"
      @error="handleImageError"
    />
  </div>
</template>

<script>
export default {
  name: 'KreoLogo',
  props: {
    logoSrc: {
      type: String,
      default: '/logos/kreo-navbar.svg'
    }
  },
  methods: {
    handleImageError(event) {
      // Fallback to placeholder if logo fails to load
      event.target.src = '/logos/kreo-navbar.svg'
    }
  }
}
</script>

<style lang="scss" scoped>
.kreo-logo {
  height: clamp(32px, 3.5vh, 48px);
  width: auto;
  object-fit: contain;
  filter: brightness(1.1);
  transition: all 0.3s ease;
  
  &:hover {
    filter: brightness(1.3);
    transform: scale(1.02);
  }
}

.logo-image {
  height: 4vh;
  width: auto;
  min-height: 38px;
  max-height: 60px;
  object-fit: contain;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.logo-fallback {
  color: white;
  font-size: clamp(18px, 1.5vw, 32px);
  font-weight: bold;
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0.1em;
}

// Responsive breakpoints
@media (max-width: 1600px) {
  .logo-image {
    height: 3.8vh;
    min-height: 36px;
    max-height: 58px;
  }
}

@media (max-width: 1440px) {
  .logo-image {
    height: 3.5vh;
    min-height: 34px;
    max-height: 55px;
  }
}

@media (max-width: 1200px) {
  .logo-image {
    height: 3.2vh;
    min-height: 32px;
    max-height: 52px;
  }
}

@media (max-width: 1024px) {
  .logo-image {
    height: 4.5vh;
    min-height: 38px;
    max-height: 58px;
  }
}

@media (max-width: 768px) {
  .logo-image {
    height: 5vh;
    min-height: 40px;
    max-height: 55px;
  }
}

@media (max-width: 480px) {
  .logo-image {
    height: 5.5vh;
    min-height: 42px;
    max-height: 52px;
  }
}
</style> 