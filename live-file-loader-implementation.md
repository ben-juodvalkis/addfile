# live-file-loader Implementation Guide

**Project:** live-file-loader
**Author:** Ben Bracken

Replaces the deprecated `add file` functionality from 11live.tools.

---

## What It Does

Accepts a file path and loads that file (Live set, device, etc.) into Ableton Live via shell command.

---

## Implementation

### File: `live-file-loader.js` (Node for Max)

```javascript
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
```

### File: `live-file-loader.maxpat`

```
[inlet]  (file path)
    |
[prepend load]
    |
[node.script live-file-loader.js @autostart 1]
    |
[route done error]
    |         |
[outlet]  [outlet]
```

**How it works:**
1. Receive file path
2. Node executes `open "<filepath>"` (macOS associates .als/.adv files with Live)
3. Live opens and loads the file

---

## Usage

```
[dialog] → [live-file-loader]
```

Or send a path directly:
```
[message /path/to/my-set.als] → [live-file-loader]
```
