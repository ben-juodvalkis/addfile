const maxApi = require("max-api");
const { exec } = require("child_process");
const path = require("path");

maxApi.addHandler("load", (filepath) => {
    const normalized = path.resolve(filepath);

    // Platform-specific command to open file with default application
    const command = process.platform === "win32"
        ? `start "" "${normalized}"`
        : `open "${normalized}"`;

    exec(command, (error) => {
        if (error) {
            maxApi.outlet("error", error.message);
        } else {
            maxApi.outlet("done", normalized);
        }
    });
});
