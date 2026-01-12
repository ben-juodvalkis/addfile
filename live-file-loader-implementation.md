# live-file-loader Implementation Guide

**Project:** live-file-loader
**Author:** Ben Bracken

Replaces the deprecated `add file` functionality from 11live.tools.

---

## What It Does

Accepts a file path and loads that file (Live set, device, etc.) into Ableton Live using the Live Object Model.

---

## Implementation

### File: `live-file-loader.maxpat`

```
[inlet]  (file path as symbol)
    |
[prepend load_set]
    |
[live.path live_app]
    |
[live.object]
    |
[outlet] (confirmation/error)
```

**How it works:**
1. Receive file path from inlet
2. `live.path live_app` gets a reference to the Live application
3. `live.object` calls `load_set <filepath>` on the application
4. Live loads the specified .als file

---

## Usage

```
[dialog types:als] → [live-file-loader]
```

Or send a path directly:
```
[message "/path/to/my-set.als"] → [live-file-loader]
```
