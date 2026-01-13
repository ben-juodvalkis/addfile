# live-file-loader

A Max for Live device that loads audio files directly into Ableton Live. Works on both macOS and Windows.

## Installation

1. Copy `live-file-loader.js` and `live-file-loader.maxpat` to your Max for Live project
2. The device will automatically start when loaded

## Usage

Send a file path to the inlet to load it into Ableton Live:

```
/path/to/your/file.aiff
```

### Outputs

- **First outlet**: Outputs `done` followed by the normalized file path on success
- **Second outlet**: Outputs `error` followed by the error message on failure

### Debug Mode

Debug logging is disabled by default. To enable verbose logging to the Max console:

1. Send `debug` to the device inlet to toggle debug mode on
2. Send `debug` again to toggle it off

## Path Formats

The loader handles various path formats:

| Platform | Format | Example |
|----------|--------|---------|
| macOS | POSIX | `/Users/Shared/Music/file.aiff` |
| macOS | HFS (volume) | `SSD:/Users/Shared/Music/file.aiff` |
| Windows | Standard | `C:\Users\Music\file.wav` |

HFS-style paths (common when using external drives) are automatically converted to POSIX format.

## How It Works

- **macOS**: Uses `open -b com.ableton.live` to open files with Ableton Live via bundle identifier
- **Windows**: Locates the Ableton Live executable in `%PROGRAMDATA%\Ableton\` and launches it with the file

## Requirements

- Max 8 or later (with Node for Max)
- Ableton Live (any version)

## License

MIT
