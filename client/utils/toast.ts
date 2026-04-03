import Toast from "react-native-toast-message";

export const showSuccess = (message: string) => {
    Toast.show({
        type: "success",
        text2: message,
        position: "bottom",
    });
};

export const showError = (message: string) => {
    Toast.show({
        type: "error",
        text2: message,
        position: "bottom",
    });
};

export const showInfo = (message: string) => {
    Toast.show({
        type: "info",
        text2: message,
        position: "bottom",
    });
};