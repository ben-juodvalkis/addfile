# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-12

### Added
- Initial release
- `load_set` command for loading Live sets
- `add_file` command for adding audio/MIDI to tracks
- `list_dir` command for directory listing
- `list_dir_recursive` command for recursive listing
- `file_info` command for file metadata
- `resolve_path` command for path resolution
- `path_exists` command for existence checking
- `get_recent` command for recent files list
- `clear_recent` command to clear history
- `verbose` command for debug logging
- `version` command for version info
- `supported_types` command for file type info
- Support for audio formats: .wav, .aif, .aiff, .mp3, .flac, .ogg, .m4a
- Support for MIDI formats: .mid, .midi
- Support for Live formats: .als, .alc, .adg, .adv, .alp
- Recent files tracking (max 20)
- Comprehensive error handling
- Full API documentation

### Notes
- Requires Max 8.5+ for stable Node for Max support
- Compatible with Ableton Live 11 and 12
- Works on macOS and Windows
