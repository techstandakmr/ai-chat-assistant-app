export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    if (!email) {
        return {
            isValid: false,
            error: "Email is required.",
        };
    }

    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            error: "Please enter a valid email address.",
        };
    }

    return {
        isValid: true,
        error: null,
    };
}

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

export function validateOTP(otp) {
    const otpRegex = /^\d{6}$/;

    if (!otp) {
        return {
            isValid: false,
            error: "OTP is required.",
        };
    }

    if (!otpRegex.test(otp)) {
        return {
            isValid: false,
            error: "OTP must be a 6-digit number.",
        };
    }

    return {
        isValid: true,
        error: null,
    };
}

export function validateName(name) {
    const nameRegex = /^[A-Za-z ]{3,}$/;

    if (!name) {
        return {
            isValid: false,
            error: "Name is required.",
        };
    }

    if (!nameRegex.test(name)) {
        return {
            isValid: false,
            error: "Name must contain only letters and be at least 3 characters.",
        };
    }

    return {
        isValid: true,
        error: null,
    };
}

export function validateTitle(title) {
  const trimmed = title.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "Title is required.",
    };
  }

  // At least one letter or number
  if (!/[A-Za-z0-9]/.test(trimmed)) {
    return {
      isValid: false,
      error: "Title must contain at least one letter or number.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}
