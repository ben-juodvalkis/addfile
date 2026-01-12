# Examples

This folder contains example patches demonstrating live-file-loader usage.

## Required Files (Create in Max)

### 01-basic-set-loader.maxpat
Simple file browser for loading Live sets.
- `[dialog]` for file selection
- Load button
- Status display
- Recent files list

### 02-sample-browser.maxpat
Directory browser for audio samples.
- Directory selection
- File list with `[umenu]`
- Extension filtering
- Preview with `[sfplay~]`

### 03-batch-stem-loader.maxpat
Load multiple stems to tracks automatically.
- Select directory of stems
- Distribute to tracks automatically
- Track offset parameter
- Progress indicator

### 04-setlist-manager.maxpat
MIDI-triggerable setlist for live performance.
- Store list of set paths in `[coll]`
- MIDI-triggerable loading
- Current set indicator

### 05-template-loader.maxpat
Load pre-configured template sets.
- Template category browser
- Description display
- Metadata storage in `[dict]`
