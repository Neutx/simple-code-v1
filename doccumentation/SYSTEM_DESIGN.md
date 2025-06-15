# Simple Code - System Design Documentation (Beginner-Friendly Version)

## 1. System Overview

Simple Code is a web-based application built with Vue.js that allows users to connect to and configure various input devices, particularly focusing on gaming mice. The application provides a user-friendly interface to customize device settings such as DPI (Dots Per Inch - which determines mouse sensitivity), key functions, lighting effects, and more.

## 2. Architecture

The application follows a client-side architecture with the following components:

- **Frontend**: Vue.js (v2.6.14) application with Element UI - this is the user interface you see in your browser
- **Communication Layer**: WebHID API (Web Human Interface Device Application Programming Interface) - a browser technology that allows web pages to interact directly with USB devices
- **Backend**: Firebase for potential cloud features (not heavily utilized in current version)

## 3. Device Connectivity

### 3.1 Connection Process

1. The application uses the WebHID API to request and connect to compatible devices
   - WebHID is a browser feature that lets websites communicate with USB devices like mice, keyboards, and gamepads
   - This is a relatively new technology only available in Chrome and some other Chromium-based browsers

2. Device connection happens in two main phases:
   - `Request_Device()`: Asks your browser for permission to access the device
   - `Device_Connect()`: After permission is granted, establishes a connection and retrieves settings

```javascript
async function handleConnectClick() {
  var filters = [];
  // Optionally filter by VID/PID (Vendor ID/Product ID - unique identifiers for USB devices)
  
  if(await HIDHandle.Request_Device(filters)) {
    var info = await HIDHandle.Get_Device_Info();
    if((info.cid != 0) && (info.mid != 0)) {
      // Configure device settings
      await HIDHandle.Device_Connect();
      this.$bus.$emit("deviceConnect", true);
    }
  }
}
```

### 3.2 Supported Devices

The application can work with any HID-compatible device that follows the specified protocol. HID (Human Interface Device) is a standard that defines how input devices like mice and keyboards communicate with computers.

By default, the application is designed to work with any device but can be filtered by Vendor ID (VID) and Product ID (PID) if needed:

```javascript
// Example filter for specific device
var filter = {
  vendorId: Number.parseInt("0x3554"),  // A unique ID assigned to the device manufacturer
  productId: Number.parseInt("0xF516"), // A unique ID assigned to the specific product
}
```

### 3.3 Device Pairing

For wireless devices, the application supports a pairing process:

1. Request access to the device dongle (the USB receiver for wireless devices)
2. Put the dongle into pairing mode via `Set_Device_EnterPairMode()`
3. Monitor pairing status using a timer

## 4. Communication Protocol

### 4.1 HID Command Structure

The system uses a command-based protocol with specific command IDs. Think of these like coded messages that the application sends to the device to perform different functions:

```javascript
var Command = {
  EncryptionData: 1,           // Command for secure communication
  PCDriverStatus: 2,           // Tells the device if the computer software is active
  DeviceOnLine: 3,             // Checks if a wireless device is connected
  BatteryLevel: 4,             // Requests battery information from the device
  DongleEnterPair: 5,          // Tells the dongle to start pairing with a device
  // ... (additional commands)
}
```

### 4.2 Data Flow

1. Commands are sent using `Send_Command()` or `Send_Command_With_Value()`
2. Data is packaged and sent via `Send_HID_Buffer()`
3. Responses are received through the `read_HID_Buffer()` callback

This is similar to a conversation where the application sends a request to the device, and the device responds with the requested information.

## 5. Device Configuration

### 5.1 EEPROM Structure

Device settings are stored in specific EEPROM addresses. EEPROM (Electrically Erasable Programmable Read-Only Memory) is a type of non-volatile memory in the device that retains data even when powered off.

Think of EEPROM like a filing cabinet with numbered drawers - each setting is stored in a specific location:

```javascript
var MouseEepromAddr = {
  ReportRate: 0x00,    // Address for polling rate setting (how frequently the mouse reports its position)
  maxDpiStage: 0x02,   // Address for maximum DPI stages setting
  CurrentDPI: 0x04,    // Address for current DPI setting
  LOD: 0x0A,           // Address for Lift-Off Distance setting (how high you can lift the mouse before it stops tracking)
  // ... (additional addresses)
}
```

### 5.2 Key Configuration

Mouse buttons can be configured with various functions:

```javascript
var MouseKeyFunction = {
  Disable: 0x00,       // Disables the button
  MouseKey: 0x01,      // Standard mouse button function
  LeftKey: 0x0100,     // Left click function
  DPISwitch: 0x02,     // Changes DPI setting when pressed
  // ... (additional functions)
}
```

## 6. User Interface Components

The UI is divided into several components, each handling a specific aspect of device configuration:

- **Home.vue**: Initial connection screen - where you connect your device
- **Mouse.vue**: Main interface after connection - shows all settings sections
- **DpiSetting.vue**: DPI configuration - adjusts mouse sensitivity
- **MouseKey.vue**: Button function configuration - customizes what each button does
- **LightEffect.vue**: Lighting effects configuration - controls RGB lighting
- **MacroSetting.vue**: Macro programming - creates complex key sequences
- **SensorSetting.vue**: Sensor configuration - adjusts tracking performance
- **ReportRate.vue**: Polling rate configuration - how often the mouse reports its position
- **OtherSetting.vue**: Miscellaneous settings - additional options

## 7. Firmware Support

### 7.1 Device Information

The application retrieves and stores device information:

```javascript
var deviceInfo = {
  deviceOpen: false,   // Whether the device connection is open
  connectState: DeviceConectState.Disconnected,  // Current connection status
  online: false,       // Whether a wireless device is active
  addr: [],           // Device address information
  info: {
    cid: 1,           // Company ID - identifies the manufacturer
    mid: 1,           // Model ID - identifies the specific model
    type: 1           // Device type: 0:dongle_1K, 1:dongle_4K, 2:wired_1K, 3:wired_4K
                      // The number represents polling rate capability: 1K = 1000Hz, 4K = 4000Hz
  },
  // ... (additional properties)
}
```

### 7.2 Firmware Version

Firmware is the software that runs on the device itself. The application reads firmware versions of both the device and dongle:

```javascript
async function Get_Device_Version() {
  // Gets the firmware version from the mouse
}

async function Get_Dongle_Version() {
  // Gets the firmware version from the wireless dongle
}
```

## 8. Bridge Communication

The WebHID API serves as the bridge (connection) between the application and the device:

1. The browser requests access to the HID device
2. Once granted, the application establishes a direct communication channel
3. Data is exchanged using report IDs (ReportId = 0x08)

This bridge is what allows a web page (which normally can't access hardware) to communicate with your mouse or other device.

## 9. Adding Support for New Firmware

### 9.1 Firmware Integration Process

To add support for a new firmware (new device software):

1. Identify the new firmware's command structure and EEPROM layout
2. Update the `Command` and `MouseEepromAddr` objects if needed
3. Add any specialized handling functions in the `HIDHandle.js` file
4. Extend the UI to support any unique features of the new firmware

### 9.2 Device Type Configuration

The system already has a flexible device type system:

```javascript
type: 1 // Device type: 0:dongle_1K, 1:dongle_4K, 2:wired_1K, 3:wired_4K
```

This can be extended for new firmware types. The numbers differentiate between:
- Wireless dongles (USB receivers) vs. wired devices
- Different polling rate capabilities (1K = 1000Hz, 4K = 4000Hz)

## 10. System Limitations

### 10.1 Browser Compatibility

- WebHID API is not supported in all browsers (primarily works in Chromium-based browsers like Chrome and Edge)
- iOS doesn't support WebHID, limiting mobile device compatibility

### 10.2 Device Compatibility

- Only devices that follow the specific HID protocol can be fully supported
- Some device-specific features may not be accessible without firmware customization

### 10.3 Security Constraints

- WebHID access must be explicitly granted by the user for each session
- Some features may be limited by browser security policies

## 11. Data Conversion

The system includes utilities for various data conversions:

- String to hexadecimal (converting text to numbers computers use)
- RGB color conversions (translating color codes for lighting effects)
- Report rate conversions (translating between different polling rate formats)
- UTF-8 string handling (processing text with special characters)

## 12. Event Handling

The application uses a custom event bus for communication between components. Think of this like an internal messaging system that different parts of the application use to talk to each other:

```javascript
// App.vue
this.$bus.$on("deviceConnect", value => {
  this.connect = value;  // Listens for "deviceConnect" message and updates connection status
});

// Broadcasting an event
this.$bus.$emit("deviceConnect", true);  // Sends a message that the device is connected
```

## 13. Future Development

Potential areas for enhancement:

1. Adding support for additional device types
2. Expanding the macro programming capabilities
3. Cloud-based profile storage and sharing
4. Adding more advanced sensor tuning options
5. Multi-device support

## Glossary of Technical Terms

- **API**: Application Programming Interface - a set of rules that allows different software to communicate
- **DPI**: Dots Per Inch - determines mouse sensitivity (higher DPI = faster cursor movement)
- **EEPROM**: Electrically Erasable Programmable Read-Only Memory - storage in devices that retains data when powered off
- **Firmware**: Software that's embedded in a hardware device
- **HID**: Human Interface Device - a class of computer devices that interact directly with humans
- **Polling Rate**: How frequently the device sends position updates to the computer (measured in Hz)
- **VID/PID**: Vendor ID/Product ID - unique identifiers for USB devices
- **WebHID**: A browser API that allows websites to communicate with HID devices
- **RGB**: Red, Green, Blue - the color system used for lighting effects
- **Macro**: A programmed sequence of inputs (like key presses) that can be triggered with a single button
- **Dongle**: A small device (usually USB) that enables wireless connectivity 