<template>
  <div class="flex_row_center" style="justify-content: flex-start;">
    <div>
      <span>DPI Light Mode</span>
      <select 
      v-model="mode"
      @change="handleDPIEffectChange">
        <option 
        v-for="item in dpiLightMode"
        :key="item.value"
        :value="item.value">{{item.option}}</option>
      </select>
    </div>
    <div class="flex_column_center" style="align-items: flex-end; margin-left: 50px;">
      <div class="flex_row_center">
        <span>Brightness</span>
        <el-slider
        v-model="brightness"
        @change="handleBrightnessChange"
        :min="1"
        :max="10"
        :disabled="brightnessDisable"
        style="width: 200px;">
        </el-slider>
        <span class="margin_left">{{brightness}}</span>
      </div>
      <div class="flex_row_center">
        <span>Speed</span>
        <el-slider
        v-model="speed"
        @change="handleSpeedChange"
        :min="1"
        :max="5"
        :disabled="speedDisable"
        style="width: 200px;">
        </el-slider>
        <span class="margin_left">{{speed}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle';
export default({
  data() {
    return {
      dpiLightMode:[
        {
            value:0,
            option:"Off"
        },
        {
            value:1,
            option:"Steady"
        },
        {
            value:2,
            option:"Breathing"
        }
      ],
      mode:0,
      brightness:3,
      speed:3,
      brightnessDisable:false,
      speedDisable:false,
    }
  },
  methods: {
    effectToDisable() {
      switch(this.mode) {
        case 0:
          this.brightnessDisable = true;
          this.speedDisable = true;
          break;

        case 1:
          this.brightnessDisable = false;
          this.speedDisable = true;
          break;

        case 2:
          this.brightnessDisable = true;
          this.speedDisable = false;
          break;
      }
    },
    async handleDPIEffectChange() {
      if(this.mode == 0) {
        await HIDHandle.Set_MS_DPILightOff();
      }
      else {
        await HIDHandle.Set_MS_DPILightMode(this.mode);
      }
      this.effectToDisable();
    },
    async handleBrightnessChange() {
      await HIDHandle.Set_MS_DPILightBrightness(this.brightness);
    },
    async handleSpeedChange() {
      await HIDHandle.Set_MS_DPILightSpeed(this.speed); 
    }
  },
  mounted() {
    this.$bus.$on("updateMouseUI",value => {
      this.mode = value.dpiEffect.state == false ? 0 : value.dpiEffect.mode;
      this.brightness = value.dpiEffect.brightness;
      this.speed = value.dpiEffect.speed;

      this.effectToDisable();
    });
  }
})
</script>
