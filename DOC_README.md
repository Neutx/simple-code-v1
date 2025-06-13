# Simple Code Documentation

This repository contains comprehensive documentation for the Simple Code application, a web-based tool for configuring and customizing input devices, particularly gaming mice.

## Documentation Structure

The documentation is divided into four main sections:

1. **System Design Documentation** (`SYSTEM_DESIGN.md`)
   - Overview of the entire system architecture
   - Explanation of core components
   - Communication patterns and data flow
   - User interface design

2. **Device Integration Guide** (`DEVICE_INTEGRATION_GUIDE.md`)
   - Detailed technical guide for device communication
   - WebHID API usage
   - Protocol specifications
   - Adding support for new devices

3. **Device Configuration Guide** (`DEVICE_CONFIGURATION_GUIDE.md`)
   - Comprehensive overview of configurable settings
   - DPI configuration options
   - Button function customization
   - Lighting effects
   - Sensor settings
   - Macro programming

4. **Limitations and Extensions** (`LIMITATIONS_AND_EXTENSIONS.md`)
   - Browser compatibility constraints
   - Protocol limitations
   - Performance considerations
   - Extending the system for new firmware
   - Development workflow for adding features

## Key Topics

### Device Connection Process

The application connects to devices using the WebHID API:

1. Request device access from the browser
2. Establish connection to the device
3. Read device information (CID, MID)
4. Configure device settings

### Communication Protocol

The application uses a custom HID protocol with specific commands:

- Command identifiers for various operations
- Data format for sending and receiving information
- EEPROM addressing for storing settings

### Device Configuration

Customizable settings include:

- DPI values and stages
- Button functions (including macros and shortcuts)
- Lighting effects and colors
- Sensor parameters (LOD, angle snapping, etc.)
- Power management options

### Adding Support for New Firmware

To support new firmware:

1. Analyze the firmware's protocol
2. Map commands to the application's structure
3. Update EEPROM addressing if needed
4. Implement device-specific features
5. Add UI components for new functionality

## Target Audience

This documentation is intended for:

- Developers extending the Simple Code application
- Technical users integrating new devices
- Advanced users who want to understand the system

## Supported Devices

The application is designed to work with any HID-compatible device that follows the specified protocol, with special focus on gaming mice. Device types include:

- Wired devices (1K and 4K polling rates)
- Wireless devices with dongles (1K and 4K polling rates)

## Limitations

Key limitations to be aware of:

- WebHID API is only supported in Chromium-based browsers
- Mobile devices are not supported
- Protocol is specific to certain device types
- One device can be connected at a time

## Getting Started

To use the documentation:

1. Start with the System Design Documentation for a high-level overview
2. Refer to the Device Integration Guide for technical details
3. Use the Device Configuration Guide for understanding settings
4. Review Limitations and Extensions for constraints and development guidelines 