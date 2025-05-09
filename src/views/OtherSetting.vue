<template>
  <div class="flex_row_center">
    <div class="flex_row_center">
      <span>Current Profile</span>
      <select 
      v-model="profile"
      @change="handleProfileCHange">
        <option 
        v-for="item in profiles"
        :key="item.value"
        :value="item.value">{{item.option}}</option>
      </select>
    </div>
    <div class="flex_row_center">
      <span>Debounce Time</span>
      <select 
      v-model="debounceTime"
      @change="handleDebounceTimeChange">
        <option 
        v-for="item in 21"
        :key="item"
        :value="item">{{item - 1}}</option>
      </select>
    </div>

    <div class="flex_row_center">
      <span>Time until lights turn off after stationary(Sleep Time)</span>
      <select 
      v-model="sleepTime"
      @change="handleSleepTimeCHange">
        <option 
        v-for="item in sleepTimes"
        :key="item.value"
        :value="item.value">{{item.option}}</option>
      </select>
    </div>
    <div class="flex_row_center">
      <el-checkbox 
      v-model="longDistance" 
      @change="handleMovingOffChange"
      :disabled="supportLongDistance">Turn off lights while moving</el-checkbox>      
    </div>
    <el-checkbox 
    v-model="movingOff" 
    @change="handleLongDistanceChange">Long Distance</el-checkbox>
    <el-button @click="handleRestoreCLick">Restore</el-button>
  </div>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle';

export default({
  data() {
    return {
      profiles: [
        {
            value:0,
            option:"Profile 1"
        },
        {
            value:1,
            option:"Profile 2"
        },
        {
            value:2,
            option:"Profile 3"
        },
        {
            value:3,
            option:"Profile 4"
        }    
      ],
      profile:0,
      sleepTime:3,
      sleepTimes:[
        {
            value:1,
            option:"10sec"
        },
        {
            value:3,
            option:"30sec"
        },
        {
            value:6,
            option:"1min"
        },
        {
            value:12,
            option:"2min"
        },
        {
            value:30,
            option:"5min"
        },
        {
            value:60,
            option:"10min"
        },
        {
            value:90,
            option:"15min"
        }        
      ],
      movingOff:false,
      longDistance:false,
      supportLongDistance:false,
      debounceTime:8
    }
  },
  methods: {
    async handleProfileCHange() {
      await HIDHandle.Set_Device_Profile(this.profile);
    },
    async handleDebounceTimeChange() {
      await HIDHandle.Set_MS_DebounceTime(this.debounceTime - 1);
    },
    async handleRestoreCLick() {
      this.$message('Restoring');
      await HIDHandle.Device_Restore();
      this.$message({
        message:'Restore success',type: 'success'
      });
    },
    async handleSleepTimeCHange() {
      await HIDHandle.Set_MS_LightOffTime(this.sleepTime);
    },
    async handleMovingOffChange() {
      await HIDHandle.Set_MS_MovingOffState(this.movingOff ? 1 : 0);
    },
    async handleLongDistanceChange() {
      await HIDHandle.Set_Device_LongDistance(this.longDistance?1:0);
    }
  },
  mounted() {
    this.$bus.$on("updateMouseUI",value => {
      this.supportLongDistance = value.supportLongDistance == false;
      this.longDistance = value.longDistance;
      this.debounceTime = value.debounceTime + 1;
      this.sleepTime = value.sleepTime;
      this.movingOff = value.lightEffect.movingOff;
    });

    this.$bus.$on("updateDeviceInfo",info => {
      this.profile = info.profile;
    });    
  }
})
</script>
