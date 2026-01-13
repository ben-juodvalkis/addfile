# ADR 001: Debug Logging and HFS Path Conversion

## Status
Accepted

## Context
The live-file-loader.js script loads audio files into Ableton Live from Max for Live patches. Two issues were identified during development:

1. **Debugging difficulty**: When file loading failed, there was no visibility into what was happening internally - which code paths were being executed, what values variables held, or where errors occurred.

2. **HFS path format incompatibility**: Max for Live sends file paths in the classic Mac OS HFS format (e.g., `SSD:/Users/Shared/Music/file.aiff`) rather than POSIX format (e.g., `/Volumes/SSD/Users/Shared/Music/file.aiff`). Node.js's `path.resolve()` treated these as relative paths, prepending the current working directory and creating invalid paths.

## Decision

### Debug Logging
Added comprehensive debug logging throughout the codebase using `maxApi.post()` to output to the Max console. The logging includes:

- ISO timestamps for timing analysis
- Function entry/exit points
- All significant variable values
- File existence checks
- Platform detection
- Command construction and execution results
- Error details with stack traces

### HFS Path Conversion
Added a `convertHFSPathToPosix()` function that:

1. Detects HFS-style paths (contains colon but doesn't start with `/`)
2. Extracts the volume name (before the first colon)
3. Converts to POSIX format: `/Volumes/{volumeName}{restOfPath}`
4. Skips conversion on Windows to avoid breaking Windows drive letter paths (e.g., `C:\Users\...`)

## Consequences

### Positive
- Troubleshooting is now straightforward via Max console output
- Files on external volumes (named drives) now load correctly on macOS
- Windows path handling remains unaffected
- File existence is validated before attempting to load

### Negative
- Increased code verbosity due to logging statements
- Slight performance overhead from logging (negligible for this use case)
- Debug output may be noisy in production (could add a DEBUG flag in future if needed)

## Alternatives Considered

1. **Use Max's native path conversion**: Max has `conformpath` but it's not easily accessible from node.script
2. **Require users to provide POSIX paths**: Would break existing workflows that rely on Max's default path format
3. **Remove logging after debugging**: Keeping it provides ongoing diagnostic capability
