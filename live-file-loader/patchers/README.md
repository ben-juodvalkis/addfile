# Patchers

This folder contains Max abstractions.

## Required Files (Create in Max)

### live-file-loader.maxpat

Main abstraction that wraps the Node.js script.

**Structure:**
```
[inlet] (commands)
    |
[node.script live-file-loader.js @autostart 1]
    |
[route load add list info resolved exists recent error status version supported]
    |    |    |    |       |       |      |      |     |       |        |
  out1 out2 out3 out4    out5    out6   out7   out8  out9   out10    out11
```

**Implementation Notes:**
- Set `@autostart 1` on node.script to initialize on load
- Use `[route]` to separate different output types
- Add `[loadbang]` -> `version` to verify initialization
- Path to script: `../code/live-file-loader.js`
