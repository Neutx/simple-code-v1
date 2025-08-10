<template>
  <div>
    <div class="flex_column_end">
      <div style="display: flex; justify-content: flex-end;margin-right: 20px; margin-top: 20px;">
        <div class="flex_row_center">
          <div v-if="info.isWired" style="text-align: center;">
            <IconifyIcon icon="material-symbols:charging-station" style="font-size: 24px;"/>
            <div style="font-size: 12px; margin-top: -5px;">Charging</div>
          </div>
          <div v-else>
            <span>Battery:</span>
            <span>{{battery}}%</span>
          </div>
          <el-button @click="handleCloseClick" class="margin_left">
            <IconifyIcon icon="material-symbols:close" />
          </el-button>
        </div>
      </div>


      <!-- key -->
      <div class="flex_column_center">
        <div class="function_width">
          <h1>KeyFunction</h1>
          <mouse-key></mouse-key>
        </div>
        <div class="function_width">
          <h1>DPI Setting</h1>
          <dpi-setting></dpi-setting>
        </div>

        <div class="function_width">
          <h1>DPI Effect</h1>
          <dpi-effect></dpi-effect>
        </div>

        <div class="function_width">
          <h1>ReportRate</h1>
          <report-rate></report-rate>
        </div>
        <div class="function_width">
          <h1>Sensor Setting</h1>
          <sensor-setting></sensor-setting>
        </div>

        <div class="function_width">
          <h1>Light Effect</h1>
          <light-effect></light-effect>
        </div>

        <div class="function_width">
          <h1>Macro</h1>
          <macro-setting></macro-setting>
        </div>

        <div class="function_width">
          <h1>Other</h1>
          <other-setting></other-setting>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle';
import DpiEffect from './DpiEffect.vue';
import DpiSetting from './DpiSetting.vue';
import MouseKey from './MouseKey.vue';
import ReportRate from './ReportRate.vue';
import SensorSetting from './SensorSetting.vue';
import LightEffect from './LightEffect.vue';
import MacroSetting from './MacroSetting.vue';
import OtherSetting from './OtherSetting.vue'

export default {
  name: 'MouseView',
  components: {
    MouseKey,
    DpiEffect,
    DpiSetting,
    ReportRate,
    SensorSetting,
    LightEffect,
    MacroSetting,
    OtherSetting
  },
  data() {
    return {
      info:HIDHandle.deviceInfo,
      battery:50,
      charging:false
    }
  },
  methods: {
    handleCloseClick() {
      this.$bus.$emit("deviceConnect",false);
    },
  },
  watch: {
    "info.connectState": {
      handler() {
        if(this.info.connectState == HIDHandle.DeviceConectState.Connected) {
          this.$bus.$emit("updateMouseUI",HIDHandle.deviceInfo.mouseCfg); 
          this.$bus.$emit("updateDeviceInfo",HIDHandle.deviceInfo); 
        }
      }
    },
    //报告率发生变化
    "info.mouseCfg.reportRate": {
      handler() {
        this.$bus.$emit("updateReportRate",this.info.mouseCfg.reportRate);
      },
      deep: true
    },
    //更新电量
    "info.battery": {
      handler() {
        this.battery = this.info.battery.level;
        this.charging = this.info.battery.charging;
      },
      deep: true
    },
    // Watch for changes in the wired connection state
    "info.isWired": {
      handler() {
        // This watcher ensures that the component reacts to changes in the isWired property.
        // The template will automatically re-render when this value changes.
      },
      immediate: true, // This ensures the handler runs immediately on component load
      deep: true
    },
    //当前DPI发生变化
    "info.mouseCfg.currentDpi": {
      handler() {
        this.$bus.$emit("updateCurrentDPI",this.info.mouseCfg.currentDpi);
      },
      deep: true
    },
    //设备版本
    "info.version": {
      handler() {
        this.$bus.$emit("updateVersion",this.info.version);
      },
      deep: true
    }, 
    "info.deviceOpen": {
        handler() {
          if(this.info.deviceOpen == false) {
            this.$bus.$emit('deviceConnect',false);
          }
        },
        deep: true
      }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
