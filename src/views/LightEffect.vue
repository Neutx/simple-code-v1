<template>
  <div class="flex_row_center" style="justify-content: flex-start;">
    <div>
      <span>Light Mode</span>
      <select 
      v-model="mode"
      @change="handleDPIEffectChange">
        <option 
        v-for="item in lightMode"
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
        :min="0"
        :max="9"
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
        :min="0"
        :max="9"
        :disabled="speedDisable"
        style="width: 200px;">
        </el-slider>
        <span class="margin_left">{{speed}}</span>
      </div>
    </div>

    <div style="margin-left: 50px;">
      <el-color-picker
        v-model="color"
        @change="handleColorChange()"
        :disabled="colorDisable"></el-color-picker>
    </div>
  </div>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle';
export default({
  data() {
    return {
      lightMode:[
        {
            value:0,
            option:"Off"
        },
        {
            value:1,
            option:"Rainbow"
        },
        {
            value:2,
            option:"Single Color Breath"
        },
        {
            value:3,
            option:"Fixed Color"
        },
        {
            value:4,
            option:"Neon"
        },
        {
            value:5,
            option:"Rainbow Breath"
        },
        {
            value:6,
            option:"Fixed Rainbow"
        }
      ],
      mode:0,
      brightness:3,
      speed:3,
      color:'rgb(255,0,0)',
      colorDisable:false,
      brightnessDisable:false,
      speedDisable:false,
    }
  },
  methods: {
    effectToDisable() {
      this.colorDisable = false;
      this.brightnessDisable = false;
      this.speedDisable = false;
      switch(this.mode) {
        case 0:
        this.colorDisable = true;
        this.brightnessDisable = true;
        this.speedDisable = true;
        break;

      case 1:
      case 4:
      case 5:
        this.colorDisable = true;
        break;

      case 6:
        this.colorDisable = true;
        this.speedDisable = true;
        break;

      case 2:
        break;

      case 3:
        this.speedDisable = true;
        break;

      default:
        break;
      }
    },
    async handleDPIEffectChange() {
      await HIDHandle.Set_MS_LightMode(this.mode);  
      this.effectToDisable();
    },
    async handleBrightnessChange() {
      await HIDHandle.Set_MS_LightBrightness(this.brightness);
    },
    async handleSpeedChange() {
      await HIDHandle.Set_MS_LightSpeed(this.speed); 
    },
    async handleColorChange() {
      await HIDHandle.Set_MS_LightColor(this.color);
    }
  },
  mounted() {
    this.$bus.$on("updateMouseUI",value => {
      this.mode = value.lightEffect.state == false ? 0 : value.lightEffect.mode;
      this.brightness = value.lightEffect.brightness;
      this.speed = value.lightEffect.speed;

      this.effectToDisable();
    });
  }
})
</script>
