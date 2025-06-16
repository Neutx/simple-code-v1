<template>
  <div class="flex_row_center" style="align-items: flex-start;">
    <div class="flex_column" style="height: 54vh;">
      <el-table
      :data="macros"
      @row-click="handleMacroRowClick" >
      <el-table-column>
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      </el-table>
      <el-button
      @click="handleNewMacroClick">New Macro</el-button>
    </div>

    <div class="flex_column" style="height: 50vh;">
      <el-table
      ref="keyTable"
      :data="contexts">
      <el-table-column>
        <template slot-scope="scope">
          <div class="flex_row_center">
            <IconifyIcon icon="material-symbols:keyboard-arrow-up" v-show="scope.row.status == 1" />
            <IconifyIcon icon="material-symbols:keyboard-arrow-down" v-show="scope.row.status == 0" />
            <span class="margin_left">{{getKeyText(scope.row)}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          <div style="display: flex; flex-direction: row;align-items: center;">
            <IconifyIcon icon="material-symbols:schedule" class="margin_left" />
            <span>{{scope.row.delay}}</span>
          </div>
        </template>
      </el-table-column>
      </el-table>
    </div>

    <div class="flex_column">
      <div class="flex_column_start">
        <el-radio v-model="cycleAction" label="254" class="flex_row_center"> <span>Cycle until the button is released</span></el-radio>
        <el-radio v-model="cycleAction" label="255" class="flex_row_center"><span>Cycle until any button is pressed</span></el-radio>
        <el-radio v-model="cycleAction" label="253" class="flex_row_center"><span>Cycle until the button is pressed</span></el-radio>
        <el-radio v-model="cycleAction" label="1" class="flex_row_center"> <span>Cycle Times</span></el-radio>
        <el-input :disabled="isRecording" v-model="cycleTimes" placeholder="1-250"></el-input>
      </div>
      <el-button @click="handleRecordClick">{{recordingLabel}}</el-button>
      <el-button @click="handleSaveClick">Save</el-button>
    </div>
  </div>
</template>

<script>
import HIDKey from '@/assets/js/HIDKey';
export default ({
  data() {
    return {
      macros:[],
      currentMacroIndex:-1,
      contexts:[],
      currentContextIndex:-1,
      isRecording:false,
      recordingLabel:'Start Recording',
      contextCount:0,
      cycleAction:1,
      cycleTimes:1,
    }
  },
  methods: {
    handleNewMacroClick() {
      var name = "macro" + this.macros.length;
      var macro = {
        name:name,
        contexts:[],
        cycleTimes:1
      }

      this.macros.push(macro);
      this.currentMacroIndex = this.macros.length - 1;
    },
    handleMacroRowClick(val) {
      if(val != null) {
        if(this.isRecording == false) {
          this.currentMacroIndex = this.macros.indexOf(val);
          this.contexts = val.contexts;
          this.cycleTimes = "1";   
          this.currentContextIndex = -1;
        }
      }
    },
    handleRecordClick() {
      this.isRecording = !this.isRecording;
      this.recordingLabel = this.isRecording ? "Stop recording" : "Start recording";

      if(this.isRecording){
          // 在全屏模式下监听键盘事件
          document.addEventListener('keydown', this.handleKeyDown);
          document.addEventListener('keyup', this.handleKeyUp);  
          this.contextCount = 0;   

          this.contexts = [];  
      }
      else
      {
        // 组件销毁前移除事件监听
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
      }
    },
    addKeyContext(event,tmp) {
      event.preventDefault();
      if(this.contexts.length < 70) {

        var keyCode = HIDKey.keyToHID(event.code);

        var context ={
          status:tmp.status,
          type:keyCode.type,
          value:keyCode.value,
          delay:50,
        };


        this.contexts.push(context);

        this.$nextTick(function() { //此处必须使用nextTick函数,使页面渲染完后再执行
          this.$refs.keyTable.bodyWrapper.scrollTop = 
          this.$refs.keyTable.bodyWrapper.scrollHeight;
        });
      }
      else
      {
        console.log("Macro Key max number reached");
      }   
      this.currentContextIndex = this.contexts.length - 1; 
    },
    handleKeyDown(event) {
      if(this.isRecording)
      {
        var tmp = {
          status:0,
          type:1,
          value:event.keyCode,
        }
        this.addKeyContext(event,tmp);
      }
    },
    handleKeyUp(event) {
      if(this.isRecording)
      {
        var tmp = {
          status:1,
          type:1,
          value:event.keyCode,
        }
        this.addKeyContext(event,tmp);
      }
    },
    handleSaveClick() {
      var times = 1;
      if(this.cycleAction == 1) {
        if(this.cycleTimes < 1) {
          this.cycleTimes = 1;
        }

        if(this.cycleTimes > 250) {
          this.cycleTimes = 250;
        }

        times = this.cycleTimes;
      }
      else
        times = this.cycleAction;

      this.macros[this.currentMacroIndex].cycleTimes = times;
      this.macros[this.currentMacroIndex].contexts = this.contexts;

      this.$bus.$emit("updateMacroList",this.macros);
    }
  },
  computed: {
    getKeyText() {
      return context => {
        return HIDKey.HIDToKey(context).text;         
      }
    }
  },
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>

</style>