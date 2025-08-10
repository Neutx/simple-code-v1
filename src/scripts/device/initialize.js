import HIDHandle from "@/assets/js/HIDHandle";

export const createInitializeComposable = (store, router, message) => {
  let initializing = false;
  let connecting = false;
  let pairing = false;
  let showError = false;
  let hasNavigated = false;

  // Log connected device name (Kreo Ikarus/Anzu/Chimera) without using cid/mid
  const logConnectedDeviceName = async () => {
    try {
      // Prefer a HIDHandle helper if it exists and returns a name
      if (
        HIDHandle &&
        typeof HIDHandle.requestDeviceInfo === 'function'
      ) {
        const info = await HIDHandle.requestDeviceInfo();
        if (info && (info.name || info.productName)) {
          const rawName = info.name || info.productName;
          const lower = String(rawName).toLowerCase();
          let model = 'Unknown';
          if (lower.includes('ikarus')) model = 'Kreo Ikarus';
          else if (lower.includes('anzu')) model = 'Kreo Anzu';
          else if (lower.includes('chimera')) model = 'Kreo Chimera';
          console.log('🖱️ Connected mouse:', { name: rawName, model });
          store.commit('device/SET_DEVICE_MODEL', model);
          return;
        }
      }

      // Fallback: derive product name from granted, opened HID device
      if (navigator && navigator.hid && typeof navigator.hid.getDevices === 'function') {
        const devices = await navigator.hid.getDevices();
        // Pick the device that is currently opened
        const opened = devices.find(d => d.opened);
        if (opened) {
          const rawName = opened.productName || opened.productId?.toString(16) || 'Unknown';
          const lower = String(rawName).toLowerCase();
          let model = 'Unknown';
          if (lower.includes('ikarus')) model = 'Kreo Ikarus';
          else if (lower.includes('anzu')) model = 'Kreo Anzu';
          else if (lower.includes('chimera')) model = 'Kreo Chimera';
          console.log('🖱️ Connected mouse:', { name: rawName, model });
          store.commit('device/SET_DEVICE_MODEL', model);
          return;
        }
      }

      console.log('🖱️ Connected mouse: Unknown (no product name available)');
      store.commit('device/SET_DEVICE_MODEL', 'Unknown');
    } catch (err) {
      console.error('Failed to log connected device name:', err);
    }
  };

  const navigateToDashboard = () => {
    if (!hasNavigated) {
      hasNavigated = true;
      router.push("/dashboard/home").catch(err => {
        // This error is expected if a navigation guard redirects, so we can safely ignore it.
        if (err.name !== 'NavigationRedirected') {
          console.error('Router push error:', err);
        }
      });
    }
  };

  const goBack = () => {
    router.go(-1);
  };

  const hideError = () => {
    showError = false;
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      showError = false;
    }, 5000);
  };

  const showConnectionError = () => {
    showError = true;
    hideError();
  };

  const handleConnect = async () => {
    if (connecting || hasNavigated) return;

    connecting = true;
    store.commit('device/SET_CONNECTING', true);
    console.log("🔄 Starting device connection process...");

    try {
      // Check if user is logged in with dev mode credentials
      const currentUser = store.getters["auth/currentUser"];
      if (
        currentUser &&
        currentUser.email === "test@test.com" &&
        currentUser.uid === "dummy-user-id"
      ) {
        console.log("🧪 Dev mode detected - bypassing device connection");

        // Simulate successful connection for dev mode
        store.commit("device/SET_CONNECTED", true);

        if (message) {
          message.success("Connected successfully! (Development Mode)");
        }

        navigateToDashboard();

        return true;
      }
      // Check if WebHID is supported
      if (!navigator.hid) {
        console.error("❌ WebHID not supported");
        showConnectionError();
        return;
      }

      console.log("✅ WebHID supported, requesting device...");

      // Step 1: Device Discovery (as per .cursorrules)
      const filters = []; // Show all HID devices

      if (await HIDHandle.Request_Device(filters)) {
        console.log("📱 Device selected, getting device info...");

        // Step 2: Device Validation
        const info = await HIDHandle.Get_Device_Info();
        console.log("🔍 Device info retrieved:", info);

        if (info.cid !== 0 && info.mid !== 0) {
          console.log("✅ Valid device found, configuring sensor...");

          // Essential: Configure sensor before connection (as per .cursorrules)
          HIDHandle.deviceInfo.mouseCfg.sensor.cfg = {
            range: [
              { min: 50, max: 26000, step: 50, DPIex: 0 },
              { min: 26100, max: 52000, step: 100, DPIex: 17 },
            ],
          };
          HIDHandle.deviceInfo.mouseCfg.keysCount = 6;

          console.log("🔧 Sensor configured, establishing connection...");

          // Step 3: Real-Time Communication Setup
          await HIDHandle.Device_Connect();

          console.log("🎉 Device connection established!");
          console.log("📊 Final device state:", HIDHandle.deviceInfo);

          // Log connected device model/name without using cid/mid
          await logConnectedDeviceName();

          // Emit device connection event for UI updates
          if (typeof window !== "undefined" && window.Vue) {
            const bus = new window.Vue();
            bus.$emit("deviceConnect", true);
          }

          // Update store state
          store.commit("device/SET_CONNECTED", true);
          store.commit("device/SET_DEVICE_INFO", HIDHandle.deviceInfo);

          if (message) {
            message.success("Device connected successfully!");
          }

          navigateToDashboard();

          return true;
        } else {
          console.error("❌ Invalid device - cid or mid is 0");
          showConnectionError();
          return false;
        }
      } else {
        console.error("❌ No device selected");
        showConnectionError();
        return false;
      }
    } catch (error) {
      console.error("❌ Connection error:", error);
      showConnectionError();
      return false;
    } finally {
      connecting = false;
      store.commit('device/SET_CONNECTING', false);
    }
  };

  const handlePair = async () => {
    if (pairing || hasNavigated) return;

    pairing = true;
    console.log("🔄 Starting device pairing process...");

    try {
      // Check if WebHID is supported
      if (!navigator.hid) {
        console.error("❌ WebHID not supported");
        showConnectionError();
        return;
      }

      console.log("✅ WebHID supported, requesting device for pairing...");

      // Use empty filters to show all devices
      const filters = [];

      if (await HIDHandle.Request_Device(filters)) {
        console.log("📱 Device selected for pairing, getting device info...");

        const info = await HIDHandle.Get_Device_Info();
        console.log("🔍 Device info for pairing:", info);

        if (info.cid !== 0 && info.mid !== 0) {
          console.log("✅ Valid device found, starting pairing mode...");

          // Configure sensor first
          HIDHandle.deviceInfo.mouseCfg.sensor.cfg = {
            range: [
              { min: 50, max: 26000, step: 50, DPIex: 0 },
              { min: 26100, max: 52000, step: 100, DPIex: 17 },
            ],
          };
          HIDHandle.deviceInfo.mouseCfg.keysCount = 6;

          // Enter pairing mode
          await HIDHandle.Set_Device_EnterPairMode();

          console.log("🔗 Device entered pairing mode");

          if (message) {
            message.success("Device paired successfully!");
          }

          navigateToDashboard();

          return true;
        } else {
          console.error("❌ Invalid device for pairing - cid or mid is 0");
          showConnectionError();
          return false;
        }
      } else {
        console.error("❌ No device selected for pairing");
        return false;
      }
    } catch (error) {
      console.error("❌ Pairing error:", error);
      if (error.name !== "NotAllowedError") {
        showConnectionError();
      }
      return false;
    } finally {
      pairing = false;
    }
  };

  const handleInitialize = async () => {
    // Fallback method for backward compatibility
    return handleConnect();
  };

  return {
    initializing: () => initializing,
    connecting: () => connecting,
    pairing: () => pairing,
    showError: () => showError,
    goBack,
    handleConnect,
    handlePair,
    handleInitialize,
  };
};
