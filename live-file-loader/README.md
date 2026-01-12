# live-file-loader

File operations for Ableton Live in Max for Live

## Features

- Load Live sets programmatically
- Add audio/MIDI files to tracks
- Browse directories with filtering
- Path validation and resolution
- Recent files tracking

## Installation

### Package Manager (Recommended)
1. Open Max
2. File > Show Package Manager
3. Search "live-file-loader"
4. Click Install

### Manual
1. Download latest release
2. Copy to `~/Documents/Max 8/Packages/`
3. Restart Max

## Quick Start

1. Add `[live-file-loader]` to your M4L device
2. Send: `load_set /path/to/set.als`
3. Connect first outlet to `[live.path]`

## API

See [docs/API.md](docs/API.md) for complete reference.

## Examples

See `examples/` folder for:
- Basic set loading
- Sample browser
- Batch operations
- Setlist management
- Template loading

## Requirements

- Max 8.5 or later
- Ableton Live 11 or 12

## License

MIT - See LICENSE file

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

## Author

Ben Bracken

## Acknowledgments

Inspired by 11live.tools by 11olsen
