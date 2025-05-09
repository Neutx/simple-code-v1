<template>
  <div class="flex_column">
    <div class="flex_row_center" style="justify-content: flex-start;">
      <div class="flex_row_center">
        <p>Max DPI</p>
        <select 
        v-model="maxDpi"
        @change="handleMaxDPIChange">
          <option 
          v-for="item in 8" 
          :key="item" 
          :value="item">{{item}}</option>
        </select>
      </div>

      <div class="flex_row_center" style="margin-left: 50px;">
        <p>Current DPI</p>
        <select 
        v-model="currentDpi"
        @change="handleCurrentDPIChange">
          <option 
          v-for="item in (maxDpi)" 
          :key="item" 
          :value="item">{{item - 1}}</option>
        </select>
      </div>
    </div>

    <div class="flex_row_center function_width">
      <div class="flex_row_center"
      v-for="(item,index) in dpiParams"
      :key="index">
        <el-input
        v-model="item.value"
        style="width: 120px;"
        @blur="handleInputBlur(index)"
        :disabled="index >= maxDpi"></el-input>
        <el-color-picker
        v-model="item.color"
        @change="handleColorChange(index,value.color)"
        :disabled="index >= maxDpi"></el-color-picker>
      </div>
    </div>

  </div>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle';
export default({
  data() {
    return {
      maxDpi:8,
      currentDpi:1,
      dpiParams:[
        {
          value:400,
          color:'rgb(255,0,0)'
        },
        {
          value:800,
          color:'rgb(0,255,0)'
        },
        {
          value:2400,
          color:'rgb(0,0,255)'
        },
        {
          value:4800,
          color:'rgb(255,255,0)'
        },
        {
          value:26000,
          color:'rgb(255,255,255)'
        },
      ],
    }
  },
  methods: {
    async handleMaxDPIChange() {
      await HIDHandle.Set_MS_MaxDPI(this.maxDpi);

      if(this.maxDpi <= this.currentDpi) {
        await HIDHandle.Set_MS_CurrentDPI(this.currentDpi - 1);
      }
    },
    async handleCurrentDPIChange(value) {
      await HIDHandle.Set_MS_CurrentDPI(this.currentDpi - 1);
    },
    async handleInputBlur(index) {
      var value = Math.ceil(this.dpiParams[index].value / 50) * 50;
      if(value > 26000) {
        value = 26000;
      }

      if(value < 50)
        value = 50;
      
      await HIDHandle.Set_MS_DPIValue(index, value)
    },
    async handleColorChange(index,color) {

      await HIDHandle.Set_MS_DPIColor(index,color);
    }
  },
  mounted() {
    this.$bus.$on("updateMouseUI",value => {
      this.dpiParams = [];
      for(var i = 0;i < 8;i++) {
        var param = {
          value:value.dpis[i].value,
          color:value.dpis[i].color,
        };

        this.dpiParams.push(param);
      }

      this.maxDpi = value.maxDpiStage;
      this.currentDpi = value.currentDpi + 1;

      console.log("dpi setting",this.currentDpi);
    });

    this.$bus.$on("updateCurrentDPI",value => {
      this.currentDpi = value + 1;
    }); 
  }
})
</script>
