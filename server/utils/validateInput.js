// Validate Email
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  if (!email) return { isValid: false, error: "Email is required." };

  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  return { isValid: true, error: null };
}

// Validate Password
export function validatePassword(password) {
    if (!password) {
        return {
            isValid: false,
            error: "Password is required."
        };
    }

    if (password.length < 8) {
        return {
            isValid: false,
            error: "Must be at least 8 characters",
        };
    }

    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            error: "Must include at least one uppercase letter"
        };
    }

    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            error: "Must include at least one lowercase letter"
        };
    }

    if (!/[0-9]/.test(password)) {
        return {
            isValid: false,
            error: "Must include at least one number"
        };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return {
            isValid: false,
            error: "Must include at least one special character"
        };
    }
    return {
        isValid: true,
        error: null,
    };
}