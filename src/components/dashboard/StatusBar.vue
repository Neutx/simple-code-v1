<template>
  <div class="status-bar">
    <div class="status-item">
      <div class="status-icon">
        <i class="el-icon-mouse"></i>
      </div>
      <div class="status-text">
        <span class="status-label">Model: </span>
        <span class="status-value">{{ deviceModel }}</span>
      </div>
    </div>

    <div class="status-item">
      <div class="status-icon dpi-icon">
        <div class="dpi-center"></div>
        <div class="dpi-line-v"></div>
        <div class="dpi-line-h"></div>
      </div>
      <div class="status-text">
        <span class="status-label">DPI: </span>
        <span class="status-value">{{ currentDPI }}</span>
      </div>
    </div>

    <div class="status-item">
      <div class="status-icon">
        <i class="el-icon-odometer"></i>
      </div>
      <div class="status-text">
        <span class="status-label">Polling rate: </span>
        <span class="status-value">{{ pollingRate }}Hz</span>
      </div>
    </div>

    <div class="status-item">
      <div class="status-icon">
        <i class="el-icon-battery"></i>
      </div>
      <div class="status-text">
        <span class="status-label">Battery: </span>
        <span class="status-value">{{ batteryLevel }}%</span>
      </div>
    </div>

    <div class="status-item">
      <div class="status-icon">
        <i class="el-icon-sort"></i>
      </div>
      <div class="status-text">
        <span class="status-label">LOD: </span>
        <span class="status-value">{{ liftOffDistance }}</span>
      </div>
    </div>

    <div class="status-item">
      <div class="status-icon">
        <i class="el-icon-s-operation"></i>
      </div>
      <div class="status-text">
        <span class="status-label">Motion sync: </span>
        <span class="status-value">{{ motionSync ? 'ON' : 'OFF' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatusBar',
  props: {
    deviceModel: {
      type: String,
      default: 'Ikarus'
    },
    currentDPI: {
      type: [String, Number],
      default: '420'
    },
    pollingRate: {
      type: [String, Number],
      default: '4000'
    },
    batteryLevel: {
      type: [String, Number],
      default: '69'
    },
    liftOffDistance: {
      type: String,
      default: '1MM'
    },
    motionSync: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="scss" scoped>
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1282px;
  margin: 0 auto;
  height: 24px;
}

.status-item {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  position: relative;
  
  i {
    font-size: 20px;
    color: white;
  }
  
  &.dpi-icon {
    .dpi-center {
      box-sizing: border-box;
      width: 12px;
      height: 12px;
      background: #010101;
      border: 1.5px solid white;
      border-radius: 50%;
      position: absolute;
      top: 6px;
      left: 6px;
    }
    
    .dpi-line-v,
    .dpi-line-h {
      position: absolute;
      background: white;
    }
    
    .dpi-line-v {
      width: 1.5px;
      height: 22px;
      left: 11.25px;
      top: 1px;
    }
    
    .dpi-line-h {
      width: 22px;
      height: 1.5px;
      left: 1px;
      top: 11.25px;
    }
  }
}

.status-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 17.4px;
  line-height: 23px;
  
  .status-label {
    color: rgba(255, 255, 255, 0.5);
  }
  
  .status-value {
    color: white;
  }
}
</style> 