const maxApi = require("max-api");
const { exec, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

function findAbletonWindows() {
    const programData = process.env.PROGRAMDATA || "C:\\ProgramData";
    const abletonDir = path.join(programData, "Ableton");

    try {
        if (!fs.existsSync(abletonDir)) return null;

        // Find all Live installations, sort descending to get newest first
        const liveDirs = fs.readdirSync(abletonDir)
            .filter(d => d.startsWith("Live "))
            .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

        for (const dir of liveDirs) {
            const programDir = path.join(abletonDir, dir, "Program");
            if (!fs.existsSync(programDir)) continue;

            // Find the executable in the Program folder
            const exeFile = fs.readdirSync(programDir)
                .find(f => f.startsWith("Ableton Live") && f.endsWith(".exe"));

            if (exeFile) {
                return path.join(programDir, exeFile);
            }
        }
    } catch (e) {
        return null;
    }
    return null;
}

maxApi.addHandler("load", (filepath) => {
    const normalized = path.resolve(filepath);
    let command;

    if (process.platform === "win32") {
        const abletonPath = findAbletonWindows();
        if (abletonPath) {
            command = `"${abletonPath}" "${normalized}"`;
        } else {
            maxApi.outlet("error", "Ableton Live not found");
            return;
        }
    } else {
        // macOS: use bundle identifier (works for all Live versions)
        command = `open -b com.ableton.live "${normalized}"`;
    }

    exec(command, (error) => {
        if (error) {
            maxApi.outlet("error", error.message);
        } else {
            maxApi.outlet("done", normalized);
        }
    });
});
