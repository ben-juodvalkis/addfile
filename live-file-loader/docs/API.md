# live-file-loader API Reference

## Overview

live-file-loader provides file operations for Ableton Live through a Node for Max script. All commands are sent as messages to the `[live-file-loader]` abstraction.

## Outlets

The abstraction has 11 outlets:

| Outlet | Name | Description |
|--------|------|-------------|
| 1 | `load` | Path to load (connect to live.path) |
| 2 | `add` | File info dict (path, track, type) |
| 3 | `list` | Array of file paths |
| 4 | `info` | File information dict |
| 5 | `resolved` | Resolved absolute path |
| 6 | `exists` | 0 or 1 |
| 7 | `recent` | Recent files array |
| 8 | `error` | Error messages |
| 9 | `status` | Status messages |
| 10 | `version` | Version string |
| 11 | `supported` | Supported file types dict |

---

## Commands

### load_set

Load an Ableton Live set.

**Usage:** `load_set <filepath>`

**Parameters:**
- `filepath` (string) - Path to .als file

**Output:**
- `load` outlet: Absolute path to the set
- `status` outlet: Confirmation message

**Example:**
```
load_set /Users/me/Music/Sets/MySong.als
```

**Errors:**
- File does not exist
- File is not a .als file

---

### add_file

Add an audio or MIDI file to a track.

**Usage:** `add_file <filepath> [track_index]`

**Parameters:**
- `filepath` (string) - Path to audio or MIDI file
- `track_index` (integer, default: 0) - Target track index

**Output:**
- `add` outlet: Dictionary with `path`, `track`, `type`
- `status` outlet: Confirmation message

**Example:**
```
add_file /Users/me/Samples/kick.wav 0
add_file /Users/me/MIDI/melody.mid 3
```

**Supported Audio:** .wav, .aif, .aiff, .mp3, .flac, .ogg, .m4a

**Supported MIDI:** .mid, .midi

**Errors:**
- File does not exist
- Unsupported file type
- Invalid track index

---

### list_dir

List files in a directory.

**Usage:** `list_dir <dirpath> [extensions]`

**Parameters:**
- `dirpath` (string) - Path to directory
- `extensions` (string, optional) - Comma-separated extensions to filter

**Output:**
- `list` outlet: Array of full file paths
- `status` outlet: Count of files found

**Examples:**
```
list_dir /Users/me/Samples
list_dir /Users/me/Samples wav,aif
list_dir /Users/me/MIDI .mid,.midi
```

**Errors:**
- Path does not exist
- Path is not a directory

---

### list_dir_recursive

List files recursively with depth limit.

**Usage:** `list_dir_recursive <dirpath> [extensions] [max_depth]`

**Parameters:**
- `dirpath` (string) - Path to directory
- `extensions` (string, optional) - Comma-separated extensions
- `max_depth` (integer, default: 3) - Maximum recursion depth

**Output:**
- `list` outlet: Array of full file paths
- `status` outlet: Count of files found

**Example:**
```
list_dir_recursive /Users/me/Samples wav 5
```

---

### file_info

Get detailed information about a file.

**Usage:** `file_info <filepath>`

**Parameters:**
- `filepath` (string) - Path to file

**Output:**
- `info` outlet: Dictionary containing:
  - `path` - Absolute path
  - `name` - Filename
  - `ext` - File extension
  - `size` - Size in bytes
  - `sizeKB` - Size in kilobytes
  - `sizeMB` - Size in megabytes
  - `modified` - Last modified date (ISO)
  - `created` - Creation date (ISO)
  - `isDirectory` - Boolean
  - `isFile` - Boolean

**Example:**
```
file_info /Users/me/Samples/kick.wav
```

---

### resolve_path

Resolve a relative path to absolute.

**Usage:** `resolve_path <relative_path> [base_path]`

**Parameters:**
- `relative_path` (string) - Relative path to resolve
- `base_path` (string, optional) - Base directory

**Output:**
- `resolved` outlet: Absolute path

**Example:**
```
resolve_path ../Samples/kick.wav /Users/me/Projects
```

---

### path_exists

Check if a path exists.

**Usage:** `path_exists <filepath>`

**Parameters:**
- `filepath` (string) - Path to check

**Output:**
- `exists` outlet: 1 if exists, 0 if not

**Example:**
```
path_exists /Users/me/Samples/kick.wav
```

---

### get_recent

Get list of recently accessed files.

**Usage:** `get_recent [limit]`

**Parameters:**
- `limit` (integer, default: 20) - Maximum number of files

**Output:**
- `recent` outlet: Array of file paths

**Example:**
```
get_recent 10
```

---

### clear_recent

Clear the recent files list.

**Usage:** `clear_recent`

**Output:**
- `status` outlet: Confirmation message

---

### verbose

Enable or disable verbose logging.

**Usage:** `verbose <0|1>`

**Parameters:**
- `0` - Disable verbose mode
- `1` - Enable verbose mode

**Output:**
- `status` outlet: Current verbose state

---

### version

Get version information.

**Usage:** `version`

**Output:**
- `version` outlet: Version string
- `status` outlet: Full version message

---

### supported_types

Get lists of supported file types.

**Usage:** `supported_types`

**Output:**
- `supported` outlet: Dictionary with:
  - `audio` - Array of audio extensions
  - `midi` - Array of MIDI extensions
  - `live` - Array of Live file extensions

---

## Error Handling

All errors are sent to the `error` outlet. Common errors:

- `Path does not exist: <path>` - File/directory not found
- `File is not a Live set (.als)` - Wrong file type for load_set
- `Unsupported file type: <ext>` - File extension not supported
- `Invalid track index` - Track number is negative or NaN
- `Path is not a directory` - Expected directory, got file

## Best Practices

1. Always connect the `error` outlet to handle failures
2. Use `path_exists` before operations on user-provided paths
3. Use `verbose 1` during development for debugging
4. Filter file lists by extension for better performance
5. Set reasonable `max_depth` for recursive listings
