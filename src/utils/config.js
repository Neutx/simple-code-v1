// Secure configuration utility
class ConfigManager {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {
    // Try to load from runtime config first
    if (window.APP_CONFIG) {
      this.config = { ...window.APP_CONFIG };
    }

    // Fallback to environment variables (only for non-sensitive data)
    if (process.env.NODE_ENV === 'development') {
      // In development, we can use env vars
      this.config = {
        ...this.config,
        // Only include non-sensitive config here
        baseUrl: process.env.BASE_URL,
        nodeEnv: process.env.NODE_ENV
      };
    }
  }

  get(key, defaultValue = null) {
    return this.config[key] || defaultValue;
  }

  // Secure method to get Firebase config
  getFirebaseConfig() {
    // For Firebase, the API keys are actually safe to expose
    // But you can override them with runtime config if needed
    return {
      apiKey: this.config.firebaseApiKey || process.env.VUE_APP_FIREBASE_API_KEY,
      authDomain: this.config.firebaseAuthDomain || process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
      projectId: this.config.firebaseProjectId || process.env.VUE_APP_FIREBASE_PROJECT_ID,
      storageBucket: this.config.firebaseStorageBucket || process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: this.config.firebaseMessagingSenderId || process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: this.config.firebaseAppId || process.env.VUE_APP_FIREBASE_APP_ID,
      measurementId: this.config.firebaseMeasurementId || process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
    };
  }
}

export default new ConfigManager(); 