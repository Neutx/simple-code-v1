<template>
  <div class="keys-view">
    <!-- Key Remapping Panel -->
    <KeyRemappingPanel @key-mapping-updated="handleKeyMappingUpdate" />
    
    <!-- Key Remapping Mouse Display -->
    <div class="mouse-display-section">
      <KeyRemappingMouseDisplay 
        :device-model="deviceModel"
        :mouse-image-src="mouseImageSrc"
        @key-selected="handleKeySelected"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import KeyRemappingPanel from '@/components/dashboard/KeyRemappingPanel.vue'
import KeyRemappingMouseDisplay from '@/components/dashboard/KeyRemappingMouseDisplay.vue'

export default {
  name: 'KeysView',
  components: {
    KeyRemappingPanel,
    KeyRemappingMouseDisplay
  },
  computed: {
    ...mapGetters('device', ['isConnected']),
    ...mapGetters('settings', ['keyMappings']),
    
    deviceModel() {
      return 'Ikarus' // Default mouse model
    },
    
    mouseImageSrc() {
      return '/mice/ikarus.svg'
    }
  },
  methods: {
    handleKeySelected(key) {
      // Handle key selection logic
      this.$emit('key-selected', key)
    },
    
    handleKeyMappingUpdate(mapping) {
      // Handle key mapping update logic
      this.$emit('key-mapping-update', mapping)
    }
  }
}
</script>

<style lang="scss" scoped>
.keys-view {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.mouse-display-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  z-index: 1;
}
</style> 