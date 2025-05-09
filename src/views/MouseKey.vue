<template>
  <div class="flex_row_center">
    <div class="flex_row_start"
    v-for="(item,index) in keys" 
    :key="index">
    <!--按键功能显示-->
    <template
    v-if="refreshing">
      <el-cascader 
        v-model="keys[index]"
        :options="keyOptions" 
        @change="handleKeyValueChange(index, ...arguments)"
        :show-all-levels="false">
        <template slot-scope="{data}">
          <span 
          style="display: block;width: 100%;">{{data.label}}</span>
        </template>    
      </el-cascader>    
    </template> 
    </div>
  </div>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle';
import UserConvert from '@/assets/js/UserConvert';

import en from '../assets/en.json'

export default({
  data() {
    return {
      refreshing:false,
      keyOptions:[],
      keys:[{},{},{}],
      language:en,
      macros:{}
    }
  },
  methods: {
    async handleKeyValueChange(selectIndex) {
      var value = this.keys[selectIndex];
      var index = selectIndex;

      this.selectIndex = selectIndex;
      var macroName;
      var type = value[0];
      var param = 0x0000;
      var macroIndex = 0;
      //多媒体键
      if(value[0] == 1005) {
        type = 0x05;
        await HIDHandle.Set_MS_Multimedia(index,value[1]);
      }
      else
      {
        type = UserConvert.String_To_Hex(value[0]);
        console.log("handleKeyValueChange",selectIndex,index,value); 
        //组合键
        //shortcut数组最大为3个
        //example:Ctrl+A
        //TODO:Ctrl/Shift/Win/Alt need Add L
        if(type == HIDHandle.MouseKeyFunction.ShortcutKey) {
          var shortcut = ["LCtrl","A"];
          await HIDHandle.Set_MS_ShortcutKey(selectIndex,shortcut);         
        }
        //宏
        else if(type == HIDHandle.MouseKeyFunction.Macro) {
          macroName = value[1];
          for(macroIndex = 0;macroIndex < this.macros.length;macroIndex++) {
            if(this.macros[macroIndex].name == macroName) {
              break;
            }
          }
          param = (index << 8) + parseInt(this.macros[macroIndex].cycleTimes);
        }
        //火力键
        //param0:interval(3-255)3ms ~ 255ms，默认10ms（当驱动发送的值小于10ms时，鼠标该参数改为10ms）
        //param1:times(0-3)0:始终发，直到该键释放
        //example:interval 20,times 3
        else if(type == HIDHandle.MouseKeyFunction.FireKey) {
          var interval = 20;//3ms ~ 255ms，默认10ms（当驱动发送的值小于10ms时，鼠标该参数改为10ms）
          var times = 3;//0:始终发，直到该键释放,1:1次；2:2次；3:3次
          param = (interval << 8) + times;
        }
        else {
          //禁用键，鼠标键，DPI切换，鼠标左右滚，切换报告率，开关装饰灯，切换配置，鼠标上下滚
          param = UserConvert.String_To_Hex(value[1]);
        }
      }
        
        var keyFunction = {
          type:type,
          param:param
        }

        await HIDHandle.Set_MS_KeyFunction(index,keyFunction);

        if(type == HIDHandle.MouseKeyFunction.Macro) {
          console.log("set macro",macroName,this.keys,macroIndex,this.macros);
          await HIDHandle.Set_MS_Macro(index,this.macros[macroIndex]);
        }    
    },
    updateMacros() {
      var macros = [];
      
      for(var i = 0; i < this.keyOptions.length; i++)
      {
        if(this.keyOptions[i].value == HIDHandle.MouseKeyFunction.Macro)
        {
          this.keyOptions[i].children = [];
          for(var j = 0;j < this.macros.length;j++)
          {
            var children = {
              value:this.macros[j].name,
              label:this.macros[j].name
            }
            macros.push(children);
            this.keyOptions[i].children.push(children);
          }
        }
      }
    }
  },
  mounted() {
    this.keyOptions = this.language.KeyOptions;

    this.$bus.$on("updateMouseUI",value => {
      this.refreshing = false;

      for(var i = 0;i < value.keysCount;i++) {
      var index = i;

      if((value.keys[i][0] == HIDHandle.MouseKeyFunction.FireKey) || 
        (value.keys[i][0] == HIDHandle.MouseKeyFunction.ProfileSwitch) ||
        (value.keys[i][0] == HIDHandle.MouseKeyFunction.ReportRateSwitch) || 
        (value.keys[i][0] == HIDHandle.MouseKeyFunction.Disable)) {
          this.keys[index] = value.keys[i][0];
      }
      else if(value.keys[i][0] == HIDHandle.MouseKeyFunction.Macro) {

      }
      else if(value.keys[i][0] == HIDHandle.MouseKeyFunction.ShortcutKey) {
        var key = [];
        if(value.shortCutKey[i].isMedia) {
          key.push("1005");
          key.push(value.shortCutKey[i].contexts[0].value);
        }
        else {
          key.push(HIDHandle.MouseKeyFunction.ShortcutKey.toString());
        }
        this.keys[index] = key;
      }
      else {
        this.keys[index] = value.keys[i];
      }
      }

      this.refreshing = true;
      console.log("KeyOptions",this.language.KeyOptions,this.keys);
    });

    //更新宏名称列表
    this.$bus.$on("updateMacroList",async(value) => {
      this.macros = value;
      this.updateMacros();
    });
  }
})
</script>
