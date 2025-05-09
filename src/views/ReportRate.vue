<template>
  <div class="flex_row_center">
    <div
      v-for="(value, index) in reportRates"
      :key="index">
      <el-button class="margin_left"
      style="width: 120px;"
      :style="{backgroundColor:reportRate == index?'#32A07E' : 'Transparent'}"
      @click="handleReportRateClick(index)">{{value.option}}</el-button>
      </div>
  </div>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle';
import en from '../assets/en.json'
export default({
  data() {
    return {
      language:en,
      reportRate:1,
      reportRates:[]
    }
  },
  methods: {
    async handleReportRateClick(index) {
      this.reportRate = index;
      await HIDHandle.Set_MS_ReportRate(this.reportRates[index].rate);
      this.$bus.$emit("updateSensorMode",this.reportRates[index].rate > 1000);
    }
  },
  mounted() {
    this.reportRates = this.language.ReportRates;

    this.$bus.$on("updateMouseUI",value => {
      for(var i = 0;i < this.reportRates.length;i++) {
        if(this.reportRates[i].rate == value.reportRate) {
          this.reportRate = i;
          break;
        }
      }
    });

    this.$bus.$on("updateReportRate",value => {
      for(var i = 0;i < this.reportRates.length;i++) {
        if(this.reportRates[i].rate == value) {
          this.reportRate = i;
          break;
        }
      }
    });
  }
})
</script>
