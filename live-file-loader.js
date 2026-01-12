const maxApi = require("max-api");
const { exec } = require("child_process");
const path = require("path");

maxApi.addHandler("load", (filepath) => {
    const normalized = path.resolve(filepath);

    // macOS: open file with Ableton Live
    exec(`open "${normalized}"`, (error) => {
        if (error) {
            maxApi.outlet("error", error.message);
        } else {
            maxApi.outlet("done", normalized);
        }
    });
});
