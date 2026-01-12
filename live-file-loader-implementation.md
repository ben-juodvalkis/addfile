# live-file-loader Implementation Guide

**Project:** live-file-loader
**Runtime:** Node for Max
**Author:** Ben Bracken

---

## Directory Structure

```
live-file-loader/
├── code/
│   └── live-file-loader.js    # Node.js script
└── patchers/
    └── live-file-loader.maxpat # Max abstraction
```

---

## Core Implementation

### File: `code/live-file-loader.js`

```javascript
const maxApi = require("max-api");
const path = require("path");

/**
 * Load a file and output its path
 * Usage: load <filepath>
 */
maxApi.addHandler("load", (filepath) => {
    const normalized = path.resolve(filepath);
    maxApi.outlet("path", normalized);
});
```

---

## Max Abstraction

### File: `patchers/live-file-loader.maxpat`

```
[inlet] (filepath)
    |
[node.script live-file-loader.js @autostart 1]
    |
[route path]
    |
[outlet] (normalized path)
```

---

## Usage

Send a file path to the inlet, get the normalized absolute path from the outlet.

```
[dialog] → [prepend load] → [live-file-loader] → [your destination]
```
