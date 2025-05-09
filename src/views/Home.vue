<template>
  <div class="flex_column_center">
    <h1>Please connect first</h1>
    <el-button @click="handleConnectClick" :disabled="isPairing" style="margin: 50px; width: 120px;">connect</el-button>
    <el-button @click="handlePairCLick" :disabled="isPairing" style="margin: 50px; width: 120px;">Pair</el-button>
  </div>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle'

export default {
  data() {
    return {
      pairResult:HIDHandle.pairResult,
      isPairing:false,
    }
  },
  methods:{
    async handleConnectClick() {
      var filters = [];
      // note:if need filter device,add your VID/PID
      // var filter = {
      //   vendorId: Number.parseInt("0x3554"),
      //   productId: Number.parseInt("0xF516"),
      // }

      // filters.push(filter);

      if(await HIDHandle.Request_Device(filters)) {
        var info = await HIDHandle.Get_Device_Info();

        if((info.cid != 0) && (info.mid != 0)) {
          //you should setting sensor and key count before connect
          HIDHandle.deviceInfo.mouseCfg.sensor.cfg = {
            range: [
              {
                min: 50,
                max: 26000,
                step: 50,
                DPIex: 0
              },
              {
                min: 26100,
                max: 52000,
                step: 100,
                DPIex: 17
              }
            ]
          }
          HIDHandle.deviceInfo.mouseCfg.keysCount = 6;
          await HIDHandle.Device_Connect();

          this.$bus.$emit("deviceConnect",true);
        }
      }
    },
    async handlePairCLick() {
      var filters = [];
      // note:if need filter device,add your VID/PID
      // var filter = {
      //   vendorId: Number.parseInt("0x3554"),
      //   productId: Number.parseInt("0xF516"),
      // }

      // filters.push(filter);

      if(await HIDHandle.Request_Device(filters)) {
        var info = await HIDHandle.Get_Device_Info();

        if((info.cid != 0) && (info.mid != 0)) {
          await HIDHandle.Set_Device_EnterPairMode();
          this.isPairing=true;
        }
      }
    }
  },
  watch: {
    'pairResult.pairStatus':{
      handler() {
        if(this.pairResult.pairStatus == HIDHandle.DevicePairResult.Success) {
          this.$message({
            message:'Pair success',type: 'success'
          });
          this.isPairing = false;
        }else if(this.pairResult.pairStatus == HIDHandle.DevicePairResult.Fail) {
          this.$message.error('Pair fail');
          this.isPairing = false;
        }else if(this.pairResult.pairStatus == HIDHandle.DevicePairResult.Pairing) {
          this.$message('Pairing');
        }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>

</style>
