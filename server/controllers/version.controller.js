export const version = async (_, res) => {
    res.json({
        latestVersion: "1.0.0",
        apkUrl: "https://github.com/techstandakmr/ai-chat-assistant-app/releases/download/v1.0.0/ai-chat-assistant.apk",
        forceUpdate: true
    });
}