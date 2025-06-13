# Device Configuration Guide

## 1. Introduction

This guide provides a comprehensive overview of all the configurable settings available in the Simple Code application for supported devices. It details how to customize mouse settings, lighting effects, button functions, and advanced features.

## 2. DPI Settings

### 2.1 DPI Stages

Devices support multiple DPI stages (up to 8):

```javascript
dpis: [
  {
    value: 400, // DPI value
    color: "#ff0000" // DPI color indicator
  },
  {
    value: 800,
    color: "#00ff00"
  },
  // ... additional stages
]
```

### 2.2 DPI Range

DPI values can be configured within specific ranges:

```javascript
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
```

### 2.3 DPI Indicators

Each DPI stage can have a customized color indicator:

```javascript
async function Set_MS_DPIColor(index, color) {
  var address = MouseEepromAddr.DPIColor + (index * 4);
  var rgbValue = UserConvert.Color_To_Buffer(color);
  
  await Set_Device_Eeprom_Array(address, rgbValue);
  deviceInfo.mouseCfg.dpis[index].color = color;
}
```

## 3. Button Configuration

### 3.1 Button Functions

Mouse buttons can be configured with various functions:

| Function Type | Description |
|---------------|-------------|
| Disable | Disables the button |
| MouseKey | Standard mouse button function |
| DPISwitch | Switch between DPI stages |
| LeftRightRoll | Horizontal scroll wheel |
| FireKey | Rapid-fire function |
| ShortcutKey | Keyboard shortcut |
| Macro | Execute programmed macro |
| ReportRateSwitch | Switch polling rates |
| LightSwitch | Toggle lighting effects |
| ProfileSwitch | Switch between profiles |
| DPILock | Lock DPI setting |
| UpDownRoll | Vertical scroll |

### 3.2 Shortcut Keys

Buttons can be configured to execute keyboard shortcuts:

```javascript
async function Set_MS_ShortcutKey(index, shortCut) {
  var address = MouseEepromAddr.ShortcutKey + (index * 16);
  
  var buffer = [];
  for (var i = 0; i < shortCut.length; i++) {
    // Convert key name to HID code
    var keyCode = HIDKey[shortCut[i]];
    buffer.push(keyCode);
  }
  
  await Set_Device_Eeprom_Array(address, buffer);
}
```

### 3.3 Fire Key

Configure rapid-fire functionality:

```javascript
// param0: interval (3-255ms)
// param1: times (0-3)
// 0: continue until key release, 1: 1 time, 2: 2 times, 3: 3 times
var interval = 20;
var times = 3;
var param = (interval << 8) + times;
```

## 4. Lighting Effects

### 4.1 DPI Indicator Light

Configure the DPI indicator lighting:

```javascript
dpiEffect: {
  mode: 1,     // 1: Solid, 2: Breathing
  state: on,   // on/off
  brightness: 3, // Brightness level (1-5)
  speed: 3,    // Effect speed (1-5)
}
```

### 4.2 RGB Lighting Effects

Configure RGB lighting on the device:

```javascript
lightEffect: {
  mode: 2,
  /*
  0x00: Off
  0x01: Color Flow
  0x02: Single Color Breathing
  0x03: Single Color Solid
  0x04: Neon
  0x05: Multi-color Breathing
  0x06: Multi-color Solid
  */
  brightness: 3, // Brightness level
  speed: 3,     // Animation speed
  color: "#ff0000", // RGB color (for single color modes)
  state: on,    // on/off
  movingOffState: false, // Turn off lights when moving
}
```

### 4.3 Light Settings

Set specific lighting parameters:

```javascript
async function Set_MS_LightMode(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.Light, value);
  deviceInfo.mouseCfg.lightEffect.mode = value;
}

async function Set_MS_LightBrightness(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.Light + 1, value);
  deviceInfo.mouseCfg.lightEffect.brightness = value;
}

async function Set_MS_LightSpeed(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.Light + 2, value);
  deviceInfo.mouseCfg.lightEffect.speed = value;
}

async function Set_MS_LightColor(color) {
  var rgbValue = UserConvert.Color_To_Buffer(color);
  await Set_Device_Eeprom_Array(MouseEepromAddr.Light + 3, rgbValue);
  deviceInfo.mouseCfg.lightEffect.color = color;
}
```

## 5. Polling Rate

Configure the device's report rate (polling rate):

```javascript
async function Set_MS_ReportRate(value) {
  var data = UserConvert.ReportRate_To_FlashData(value);
  await Set_Device_Eeprom_Value(MouseEepromAddr.ReportRate, data);
  deviceInfo.mouseCfg.reportRate = value;
}
```

Supported polling rates:
- 125 Hz (8ms)
- 250 Hz (4ms)
- 500 Hz (2ms)
- 1000 Hz (1ms)
- 2000 Hz (0.5ms)
- 4000 Hz (0.25ms)
- 8000 Hz (0.125ms)

## 6. Sensor Settings

### 6.1 Lift-Off Distance (LOD)

Adjust the height at which the sensor stops tracking:

```javascript
async function Set_MS_LOD(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.LOD, value);
  deviceInfo.mouseCfg.sensor.lod = value;
}
```

### 6.2 Motion Sync

Enable/disable motion synchronization:

```javascript
async function Set_MS_MotionSync(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.MotionSync, value ? 1 : 0);
  deviceInfo.mouseCfg.sensor.motionSync = value;
}
```

### 6.3 Angle Snapping

Enable/disable angle snapping (straight line correction):

```javascript
async function Set_MS_Angle(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.Angle, value ? 1 : 0);
  deviceInfo.mouseCfg.sensor.angle = value;
}
```

### 6.4 Ripple Control

Enable/disable ripple control:

```javascript
async function Set_MS_Ripple(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.Ripple, value ? 1 : 0);
  deviceInfo.mouseCfg.sensor.ripple = value;
}
```

### 6.5 Performance Mode

Configure high-performance mode:

```javascript
async function Set_MS_PerformanceState(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.PerformanceState, value ? 1 : 0);
  deviceInfo.mouseCfg.sensor.performanceState = value;
}

async function Set_MS_PerformanceTime(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.Performance, value);
  deviceInfo.mouseCfg.sensor.performance = value;
}
```

### 6.6 Sensor Mode

Set the sensor operation mode:

```javascript
async function Set_MS_SensorMode(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.SensorMode, value);
  deviceInfo.mouseCfg.sensor.sensorMode = value;
}
```

## 7. Macro Configuration

### 7.1 Creating Macros

Macros consist of a name and a sequence of actions:

```javascript
async function Set_MS_Macro(index, macro) {
  // Set macro name
  await Set_MS_MacroName(index, macro.name);
  
  // Set macro content
  await Set_MS_MacroContext(index, macro.contexts);
}
```

### 7.2 Macro Context Format

Macros can include key presses, key releases, and delays:

```javascript
contexts: [
  {
    type: 1, // 1: Press, 2: Release, 3: Delay
    value: "A", // Key value or delay time in ms
    keyCode: 0x04 // HID key code
  },
  // ... additional actions
]
```

### 7.3 Cycling Macros

Macros can be configured to repeat:

```javascript
param = (index << 8) + parseInt(macro.cycleTimes);
```

## 8. Power Management

### 8.1 Sleep Timer

Configure the sleep time for power saving:

```javascript
async function Set_MS_LightOffTime(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.SleepTime, value);
  deviceInfo.mouseCfg.sleepTime = value;
}
```

### 8.2 Moving Light-Off

Enable/disable turning off lights when the mouse is moving:

```javascript
async function Set_MS_MovingOffState(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.MovingOffLight, value ? 1 : 0);
  deviceInfo.mouseCfg.lightEffect.movingOffState = value;
}
```

### 8.3 Long-Range Mode

For wireless devices, enable/disable long-range mode:

```javascript
async function Set_Device_LongDistance(value) {
  await Send_Command_With_Value(Command.SetLongRangeMode, value ? 1 : 0);
  
  // Update the configuration
  deviceInfo.mouseCfg.longDistance = (value == true);
}
```

## 9. Button Debounce

Configure the button debounce time to prevent accidental double-clicks:

```javascript
async function Set_MS_DebounceTime(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.DebounceTime, value);
  deviceInfo.mouseCfg.debounceTime = value;
}
```

## 10. Factory Reset

Restore the device to its factory default settings:

```javascript
async function Device_Restore() {
  await Send_Command(Command.ClearSetting);
  
  // Wait for the restoration to complete
  deviceInfo.isRestoring = true;
  
  setTimeout(async function() {
    // Reload the configuration
    await Read_Mouse_Flash();
    deviceInfo.isRestoring = false;
  }, 5000);
}
```

## 11. Device Status Monitoring

### 11.1 Battery Status

Monitor battery level and charging status:

```javascript
battery: {
  level: 20,     // Battery percentage
  charging: false, // Charging status
  voltage: 0x0E90, // Battery voltage
}
```

### 11.2 Online Status

Check if a wireless device is online:

```javascript
async function Get_Device_Online() {
  await Send_Command(Command.DeviceOnLine);
  // Online status is updated in read_HID_Buffer
}
```

## 12. Device Versions

Retrieve firmware versions for the device and dongle:

```javascript
version: {
  dongle: "v1.0", // Dongle firmware version
  device: "--",   // Device firmware version
}
```

## 13. Configuration Persistence

All settings are stored in the device's EEPROM, ensuring they persist between connections:

```javascript
async function Write_Mouse_Flash(buffer) {
  // Write the entire configuration to the device
  var dataSize = 0x100;
  var offset = 0;
  
  while (offset < buffer.length) {
    var size = Math.min(dataSize, buffer.length - offset);
    var data = buffer.slice(offset, offset + size);
    
    await Set_Device_Eeprom_Array(offset, data);
    offset += size;
  }
}
``` 