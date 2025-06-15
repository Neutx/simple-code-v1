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
      default: 'https://placehold.co/125x38/ffffff/000000?text=KREO'
    }
  },
  methods: {
    handleImageError(event) {
      // Fallback to placeholder if logo fails to load
      event.target.src = 'https://placehold.co/125x38/ffffff/000000?text=KREO'
    }
  }
}
</script>

<style lang="scss" scoped>
.kreo-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: 125px;
  height: 38px;
  object-fit: contain;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
}
</style> 