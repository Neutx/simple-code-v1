<template>
  <div class="flex_row_center">
    <div>
      <p>Sensor Mode</p>
      <select           
      v-model="sensorMode"
      @change="handleSensorModeChange"
      :disabled="corderMode">
        <option 
        v-for="item in sensorModeOptions" 
        :key="item.value" 
        :value="item.value"
        :disabled="item.value == 256">{{item.option}}</option>
      </select>
    </div>

    <div>
      <p>LOD</p>
      <select
        v-model="lod"
        @change="handleLODChange">
        <option 
        v-for="item in lodOptions" 
        :key="item.value" 
        :value="item.value">{{item.option}}</option>
      </select>  
    </div>
 
    <div class="flex_column">
      <div class="flex_row" style="justify-content: center;">
        <el-checkbox 
        v-model="performanceState"
        @change="handlePerformanceStateChange">
        </el-checkbox>
        <span lang="Performance">Highest performance</span>
      </div>
      <select
        v-model="performance"
        @change="handlePerformanceChange"
        :disabled="performanceState == false">
        <option 
        v-for="item in performanceOptions" 
        :key="item.value" 
        :value="item.value">{{item.option}}</option>
      </select>  
    </div>


    <div class="flex_column" style="align-items: baseline;">
      <div class="flex_row">
        <el-switch 
        v-model="ripple"
        @click.native="handleRippleClick"></el-switch>
        <span lang="Ripple" class="margin_left">Ripple control</span> 
      </div>
      
      <div class="flex_row">
        <el-switch 
        v-model="angle"
        @click.native="handleAngleClick"></el-switch>  
        <span lang="Angle" class="margin_left">Angle snap</span>
      </div>  

      <div class="flex_row">
        <el-switch 
        v-model="motionSync"
        @click.native="handleMotionSyncClick"></el-switch> 
        <span lang="MotionSync" class="margin_left">Motion sync</span>
      </div>
    </div>        
  </div>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle';
import en from '../assets/en.json'
export default ({
  data() {
    return {
      sensorMode:0,
      lastSensorMode:0,
      sensorModeOptions:[],
      corderMode:false,

      lod:1,
      lodOptions:[],

      performanceState:false,
      performance:6,
      performanceOptions:[],

      ripple:false,
      angle:false,
      motionSync:false,
      language:en,
      info:HIDHandle.deviceInfo,
      isWired:false
    }
  },
  methods: {
      async handleSensorModeChange() {
        await HIDHandle.Set_MS_SensorMode(this.sensorMode);
      },
      setCorderMode(result) {
        if(result) {
          this.sensorMode = 256;
          this.corderMode = true;
        }
        else {
          this.sensorMode = this.lastSensorMode;
          this.corderMode = false;
        }
      },
      async handleLODChange() {
        await HIDHandle.Set_MS_LOD(this.lod);
      },
      async handlePerformanceStateChange() {
        await HIDHandle.Set_MS_PerformanceState(this.performanceState ? 1 : 0);
      },
      async handlePerformanceChange() {
        await HIDHandle.Set_MS_PerformanceTime(this.performance);
      },
      async handleRippleClick() {
        await HIDHandle.Set_MS_Ripple(this.ripple? 1 : 0);
      },
      async handleAngleClick() {
        await HIDHandle.Set_MS_Angle(this.angle? 1 : 0);
      },
      async handleMotionSyncClick() {
        await HIDHandle.Set_MS_MotionSync(this.motionSync? 1 : 0);
      }
    },
    watch: {
      "info.mouseCfg.reportRate": {
        handler() {
          console.log("report",this.info.mouseCfg.reportRate);
          if(this.isWired == false) {
            this.setCorderMode(this.info.mouseCfg.reportRate > 1000);
          }
        }
      }
    },
    mounted() {
      //Sensor模式下拉框
      this.sensorModeOptions = this.language.SensorModeOptions;
      //LOD模式下拉框
      this.lodOptions = this.language.LODOptions;
      //火力全开下拉框
      this.performanceOptions = this.language.PerformanceOptions;

      this.$bus.$on("updateMouseUI",cfg => {
        var value = cfg.sensor;
        this.sensorMode = value.sensorMode;
        this.lod = value.lod;
        this.performanceState = value.performanceState;
        this.performance = value.performance;
        this.ripple = value.ripple;
        this.angle = value.angle;
        this.motionSync = value.motionSync;
      });

      this.$bus.$on("updateDeviceInfo",info => {
        this.isWired = info.isWired;

        if(this.isWired) {
          this.setCorderMode(true);
        }
      });

      this.$bus.$on("updateSensorMode",value => {
        if(this.isWired) {
          this.setCorderMode(true);
        } 
        else {
          this.setCorderMode(value);
        }
      });
    },
})
</script>
