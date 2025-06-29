import { validateEmail, validatePassword } from "./validation";

export const createLoginComposable = (store, router, message) => {
  const form = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const errors = {
    email: "",
    password: "",
  };

  let googleLoading = false;
  let emailErrorTimeout = null;
  let passwordErrorTimeout = null;

  const isFormValid = () => {
    return form.email && form.password && !errors.email && !errors.password;
  };

  const clearEmailError = () => {
    if (emailErrorTimeout) {
      clearTimeout(emailErrorTimeout);
      emailErrorTimeout = null;
    }
    errors.email = "";
  };

  const clearPasswordError = () => {
    if (passwordErrorTimeout) {
      clearTimeout(passwordErrorTimeout);
      passwordErrorTimeout = null;
    }
    errors.password = "";
  };

  const handleEmailValidation = () => {
    clearEmailError();
    const validationError = validateEmail(form.email);

    if (validationError) {
      errors.email = validationError;
      // Clear error after 3 seconds
      emailErrorTimeout = setTimeout(() => {
        errors.email = "";
        emailErrorTimeout = null;
      }, 3000);
    }
  };

  const handlePasswordValidation = () => {
    clearPasswordError();
    const validationError = validatePassword(form.password);

    if (validationError) {
      errors.password = validationError;
      // Clear error after 3 seconds
      passwordErrorTimeout = setTimeout(() => {
        errors.password = "";
        passwordErrorTimeout = null;
      }, 3000);
    }
  };

  const handleLogin = async () => {
    // Validate both fields before submission
    handleEmailValidation();
    handlePasswordValidation();

    if (!isFormValid()) return;

    try {
      // Check for dummy login credentials (development only)
      if (form.email === "test@test.com" && form.password === "test@test.com") {
        // Simulate dummy user login without Firebase
        await store.dispatch("auth/dummyLogin", {
          email: form.email,
          uid: "dummy-user-id",
          displayName: "Test User",
        });

        message.success("Login successful! (Development Mode)");
        router.push("/initialize");
        return;
      }

      // Regular Firebase authentication
      await store.dispatch("auth/login", {
        email: form.email,
        password: form.password,
      });

      message.success("Login successful!");

      // Always redirect to initialize page after login
      router.push("/initialize");
    } catch (error) {
      message.error(error.message || "Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    googleLoading = true;

    try {
      await store.dispatch("auth/loginWithGoogle");
      message.success("Login successful!");

      // Always redirect to initialize page after login
      router.push("/initialize");
    } catch (error) {
      message.error(error.message || "Google login failed");
    } finally {
      googleLoading = false;
    }
  };

  const initializeRememberMe = () => {
    // Simple placeholder function to prevent errors
    // Remember me functionality has been simplified
  };

  return {
    form,
    errors,
    googleLoading: () => googleLoading,
    isFormValid,
    handleEmailValidation,
    handlePasswordValidation,
    clearEmailError,
    clearPasswordError,
    handleLogin,
    handleGoogleLogin,
    initializeRememberMe,
  };
};
