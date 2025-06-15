# Device Integration Guide

## 1. Introduction

This guide provides detailed instructions on how to work with the Simple Code application, including how to connect devices, understand the firmware communication protocol, and extend the system to support new devices.

## 2. Device Connection Process

### 2.1 WebHID API Overview

The application uses the WebHID (Human Interface Device) API, which is part of the Web API and allows web applications to interact with HID devices. The API provides:

- Device enumeration
- Connection management
- Data transfer

### 2.2 Connection Flow

1. **Request Device Access**:
   ```javascript
   async function Request_Device(filters) {
     try {
       device = await navigator.hid.requestDevice({filters: filters});
       if (device.length == 0) {
         return false;
       }
       device = device[0];
       return true;
     } catch (error) {
       return false;
     }
   }
   ```

2. **Open Device**:
   ```javascript
   await device.open();
   ```

3. **Set Up Input Report Listener**:
   ```javascript
   device.addEventListener('inputreport', read_HID_Buffer);
   ```

4. **Get Device Information**:
   ```javascript
   async function Get_Device_Info() {
     deviceInfo.info.cid = 0;
     deviceInfo.info.mid = 0;
     
     await Send_Command(Command.ReadCIDMID);
     // Wait for response via the inputreport event
     return deviceInfo.info;
   }
   ```

5. **Initialize Device Settings**:
   ```javascript
   async function Device_Connect() {
     deviceInfo.connectState = DeviceConectState.Connecting;
     await Read_Mouse_Flash();
     deviceInfo.connectState = DeviceConectState.Connected;
     return true;
   }
   ```

## 3. Communication Protocol

### 3.1 Report Format

The communication uses a specific report format with ID 0x08:

```javascript
var ReportId = 0x08;
```

### 3.2 Command Structure

Each command has a specific ID and may include additional data:

```javascript
async function Send_Command(com) {
  var buffer = new Array(8).fill(0);
  buffer[0] = com;
  await Send_HID_Buffer(buffer);
}

async function Send_Command_With_Value(com, value) {
  var buffer = new Array(8).fill(0);
  buffer[0] = com;
  buffer[1] = value & 0xff;
  buffer[2] = (value >> 8) & 0xff;
  await Send_HID_Buffer(buffer);
}
```

### 3.3 Data Transfer

Data is sent to the device using output reports:

```javascript
async function Send_HID_Buffer(data) {
  // Wait if there's an ongoing transfer
  while (sendingFlag) {
    await sleep(1);
  }
  
  sendingFlag = true;
  
  try {
    // Create the output report data
    var outputBuffer = new Uint8Array(65);
    outputBuffer[0] = ReportId;
    
    // Copy the data
    for (var i = 0; i < data.length; i++) {
      outputBuffer[i + 1] = data[i];
    }
    
    // Add CRC
    var crc = get_Crc(Array.from(outputBuffer.slice(1, data.length + 1)));
    outputBuffer[data.length + 1] = crc & 0xff;
    outputBuffer[data.length + 2] = (crc >> 8) & 0xff;
    
    // Send the data
    await device.sendReport(ReportId, outputBuffer.slice(1));
  } catch (error) {
    console.error("Error sending data:", error);
  } finally {
    sendingFlag = false;
  }
}
```

### 3.4 Receiving Data

Data is received through the input report event listener:

```javascript
function read_HID_Buffer(event) {
  // Process the received data
  var data = new Uint8Array(event.data.buffer);
  
  // Extract the command
  var command = data[0];
  
  // Process based on command
  switch (command) {
    case Command.ReadCIDMID:
      deviceInfo.info.cid = data[1] | (data[2] << 8);
      deviceInfo.info.mid = data[3] | (data[4] << 8);
      break;
    // Handle other commands
  }
}
```

## 4. Device Configuration

### 4.1 Reading Device Settings

Device settings are read from the EEPROM using specific addresses:

```javascript
async function Read_Mouse_Flash() {
  // Read report rate
  var buffer = await Get_Device_Eeprom_Buffer(MouseEepromAddr.ReportRate, 2);
  deviceInfo.mouseCfg.reportRate = UserConvert.FlashData_To_ReportRate(buffer[0]);
  
  // Read max DPI stage
  buffer = await Get_Device_Eeprom_Buffer(MouseEepromAddr.maxDpiStage, 2);
  deviceInfo.mouseCfg.maxDpiStage = buffer[0];
  
  // Read current DPI
  buffer = await Get_Device_Eeprom_Buffer(MouseEepromAddr.CurrentDPI, 2);
  deviceInfo.mouseCfg.currentDpi = buffer[0];
  
  // Read other settings
  // ...
}
```

### 4.2 Writing Device Settings

Settings are written to the device using specific commands:

```javascript
async function Set_MS_ReportRate(value) {
  var data = UserConvert.ReportRate_To_FlashData(value);
  await Set_Device_Eeprom_Value(MouseEepromAddr.ReportRate, data);
  deviceInfo.mouseCfg.reportRate = value;
}

async function Set_MS_CurrentDPI(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.CurrentDPI, value);
  deviceInfo.mouseCfg.currentDpi = value;
}

async function Set_MS_DPIValue(index, value) {
  // Calculate address based on index
  var address = MouseEepromAddr.DPIValue + (index * 4);
  
  // Convert DPI value to device format
  var dpiValue = value / 50;
  if (value > 26000) {
    dpiValue = (value - 26000) / 100 + 520 + 0x8000;
  }
  
  await Set_Device_Eeprom_Value(address, dpiValue);
  deviceInfo.mouseCfg.dpis[index].value = value;
}
```

## 5. Supported Devices

### 5.1 Device Types

The system supports different types of devices:

```javascript
type: 1 // Device type: 0:dongle_1K, 1:dongle_4K, 2:wired_1K, 3:wired_4K
```

### 5.2 Device Identification

Devices are identified by their CID (Company ID) and MID (Model ID):

```javascript
var info = {
  cid: 1, // Company ID
  mid: 1, // Model ID
  type: 1 // Device type
}
```

## 6. Adding Support for New Firmware

### 6.1 Understanding the EEPROM Layout

Each firmware may have a different EEPROM layout. The current layout is defined in `MouseEepromAddr`:

```javascript
var MouseEepromAddr = {
  ReportRate: 0x00,
  maxDpiStage: 0x02,
  CurrentDPI: 0x04,
  // ... other addresses
}
```

To support a new firmware:

1. Identify the EEPROM layout of the new firmware
2. Update the `MouseEepromAddr` object or create a new one for the specific firmware
3. Update the reading and writing functions to use the correct addresses

### 6.2 Adding New Commands

If the new firmware supports additional commands:

1. Add the new commands to the `Command` object:
   ```javascript
   var Command = {
     // Existing commands
     NewCommand: 0x20, // New command ID
   }
   ```

2. Add handler functions for the new commands in `read_HID_Buffer`

3. Create helper functions to use the new commands:
   ```javascript
   async function Use_New_Command(value) {
     await Send_Command_With_Value(Command.NewCommand, value);
     // Handle response if needed
   }
   ```

### 6.3 UI Integration

If the new firmware supports unique features:

1. Create new Vue components for the features
2. Add the components to the main interface in `Mouse.vue`
3. Implement the necessary communication functions in `HIDHandle.js`

### 6.4 Device Type Detection

Update the device type detection logic in `Get_Device_Info` to identify the new firmware:

```javascript
async function Get_Device_Info() {
  await Send_Command(Command.ReadCIDMID);
  
  // Check CID and MID to identify the device type
  if (deviceInfo.info.cid == NEW_CID && deviceInfo.info.mid == NEW_MID) {
    deviceInfo.info.type = NEW_TYPE;
  }
  
  return deviceInfo.info;
}
```

## 7. Dongle and Device Pairing

### 7.1 Pairing Process

For wireless devices, the pairing process involves:

```javascript
async function Set_Device_EnterPairMode() {
  await Send_Command(Command.DongleEnterPair);
  
  // Start monitoring the pairing result
  pairResult.pairStatus = DevicePairResult.Pairing;
  pairResult.pairLeftTime = 20;
  
  if (pairTimerID) {
    clearInterval(pairTimerID);
  }
  
  pairTimerID = setInterval(async function() {
    // Check pairing result
    await Get_Device_PairResult();
    
    // Update remaining time
    pairResult.pairLeftTime--;
    
    if (pairResult.pairLeftTime <= 0 || 
        pairResult.pairStatus == DevicePairResult.Success || 
        pairResult.pairStatus == DevicePairResult.Fail) {
      clearInterval(pairTimerID);
    }
  }, 1000);
}
```

### 7.2 Checking Pairing Status

```javascript
async function Get_Device_PairResult() {
  await Send_Command(Command.GetPairState);
  // The result will be processed in the read_HID_Buffer function
}
```

## 8. Battery Management

### 8.1 Reading Battery Level

For wireless devices, battery information is retrieved using:

```javascript
async function Get_Device_Battery() {
  await Send_Command(Command.BatteryLevel);
  // The battery information will be processed in read_HID_Buffer
}
```

### 8.2 Battery Status Processing

```javascript
// In read_HID_Buffer
case Command.BatteryLevel:
  deviceInfo.battery.level = data[1];
  deviceInfo.battery.charging = (data[2] == 1);
  deviceInfo.battery.voltage = data[3] | (data[4] << 8);
  break;
```

## 9. Advanced Features

### 9.1 Macro Programming

The system supports complex macro programming:

```javascript
async function Set_MS_Macro(index, macro) {
  // Set macro name
  await Set_MS_MacroName(index, macro.name);
  
  // Set macro content
  await Set_MS_MacroContext(index, macro.contexts);
}
```

### 9.2 Sensor Configuration

Various sensor parameters can be configured:

```javascript
async function Set_MS_LOD(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.LOD, value);
  deviceInfo.mouseCfg.sensor.lod = value;
}

async function Set_MS_MotionSync(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.MotionSync, value ? 1 : 0);
  deviceInfo.mouseCfg.sensor.motionSync = value;
}

async function Set_MS_Angle(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.Angle, value ? 1 : 0);
  deviceInfo.mouseCfg.sensor.angle = value;
}

async function Set_MS_Ripple(value) {
  await Set_Device_Eeprom_Value(MouseEepromAddr.Ripple, value ? 1 : 0);
  deviceInfo.mouseCfg.sensor.ripple = value;
}
```

## 10. Troubleshooting

### 10.1 Device Connection Issues

If the device doesn't connect:

1. Check if the WebHID API is supported in your browser
2. Ensure the device is properly connected and not in use by another application
3. Check the device's VID/PID if filtering is enabled

### 10.2 Communication Errors

If commands don't work as expected:

1. Check if the correct report ID is being used
2. Verify that the command structure matches the firmware's expectations
3. Look for error codes in the device's responses

### 10.3 Data Conversion Issues

If data isn't being interpreted correctly:

1. Check the data conversion functions in `UserConvert.js`
2. Verify that the byte order is correct for multi-byte values
3. Ensure that the correct data types are being used 