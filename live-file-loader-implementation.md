# live-file-loader

A simple Node for Max script that loads a file into Ableton Live.

## File: `live-file-loader.js`

```javascript
const maxApi = require("max-api");
const path = require("path");
const fs = require("fs").promises;

maxApi.addHandler("load", async (filepath) => {
    try {
        const normalized = path.resolve(filepath);
        await fs.access(normalized);
        maxApi.outlet("path", normalized);
    } catch (error) {
        maxApi.outlet("error", error.message);
    }
});
```

## Usage in Max

```
[your file path message]
    |
[prepend load]
    |
[node.script live-file-loader.js @autostart 1]
    |
[route path error]
    |         |
[live.path] [print error]
```

That's it.
