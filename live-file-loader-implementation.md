# live-file-loader Implementation Guide

**Project:** live-file-loader  
**Version:** 1.0.0  
**Target:** Max 8.5+, Live 11/12  
**Runtime:** Node for Max  
**Author:** Ben Bracken  
**Date:** January 2025

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Directory Structure](#directory-structure)
3. [Core Implementation](#core-implementation)
4. [Max Abstraction](#max-abstraction)
5. [Example Patches](#example-patches)
6. [Testing Strategy](#testing-strategy)
7. [Documentation](#documentation)
8. [Packaging](#packaging)
9. [Distribution](#distribution)
10. [Maintenance](#maintenance)

---

## Project Setup

### Prerequisites

- Max 8.5 or later (for stable Node for Max)
- Node.js understanding (ES6+)
- Git for version control
- Text editor with JavaScript support

### Initialize Repository

```bash
# Create project directory
mkdir live-file-loader
cd live-file-loader

# Initialize git
git init

# Create .gitignore
cat > .gitignore << EOF
.DS_Store
*.maxprefs
node_modules/
*.log
.vscode/
EOF

# Initialize npm (for dependency management)
npm init -y
```

### package.json Configuration

```json
{
  "name": "live-file-loader",
  "version": "1.0.0",
  "description": "File operations for Ableton Live in Max for Live",
  "main": "code/live-file-loader.js",
  "scripts": {
    "test": "echo \"No tests yet\" && exit 0"
  },
  "keywords": ["max", "maxforlive", "ableton", "live", "files"],
  "author": "Ben Bracken",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/[username]/live-file-loader"
  }
}
```

### package-info.json (Max Package Manager)

```json
{
  "name": "live-file-loader",
  "version": "1.0.0",
  "author": "Ben Bracken",
  "description": "File operations for Ableton Live - load sets, add files, browse directories",
  "tags": ["max for live", "file operations", "ableton", "utilities"],
  "website": "https://github.com/[username]/live-file-loader",
  "max_version_min": "8.5.0",
  "max_version_max": "none"
}
```

---

## Directory Structure

```
live-file-loader/
│
├── code/
│   └── live-file-loader.js          # Main Node.js script
│
├── patchers/
│   └── live-file-loader.maxpat      # Main abstraction
│
├── examples/
│   ├── 01-basic-set-loader.maxpat
│   ├── 02-sample-browser.maxpat
│   ├── 03-batch-stem-loader.maxpat
│   ├── 04-setlist-manager.maxpat
│   └── 05-template-loader.maxpat
│
├── help/
│   └── live-file-loader.maxhelp     # Help patch
│
├── docs/
│   ├── README.md                     # Main documentation
│   ├── API.md                        # API reference
│   ├── CONTRIBUTING.md               # Contribution guidelines
│   └── CHANGELOG.md                  # Version history
│
├── tests/
│   ├── test-files/                   # Test assets
│   └── test-suite.maxpat             # Testing patch
│
├── media/
│   ├── icon.png                      # Package icon
│   └── screenshots/                  # Documentation images
│
├── package.json                      # npm configuration
├── package-info.json                 # Max package metadata
├── LICENSE                           # MIT License
├── .gitignore
└── README.md                         # Quick start
```

---

## Core Implementation

### File: `code/live-file-loader.js`

```javascript
/**
 * live-file-loader
 * File operations for Ableton Live in Max for Live
 * 
 * @author Ben Bracken
 * @version 1.0.0
 * @license MIT
 */

const maxApi = require("max-api");
const fs = require("fs").promises;
const path = require("path");

// ============================================================================
// CONSTANTS
// ============================================================================

const SUPPORTED_AUDIO = ['.wav', '.aif', '.aiff', '.mp3', '.flac', '.ogg', '.m4a'];
const SUPPORTED_MIDI = ['.mid', '.midi'];
const SUPPORTED_LIVE = ['.als', '.alc', '.adg', '.adv', '.alp'];

const VERSION = "1.0.0";

// ============================================================================
// STATE
// ============================================================================

let config = {
    verbose: false,
    maxDepth: 5,  // For recursive directory scanning
    recentFiles: []
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Log message if verbose mode is enabled
 */
function log(...args) {
    if (config.verbose) {
        maxApi.post(...args);
    }
}

/**
 * Normalize and validate a file path
 */
async function validatePath(filepath) {
    const normalized = path.resolve(filepath);
    
    try {
        await fs.access(normalized);
        return normalized;
    } catch (error) {
        throw new Error(`Path does not exist: ${normalized}`);
    }
}

/**
 * Get file extension in lowercase
 */
function getExtension(filepath) {
    return path.extname(filepath).toLowerCase();
}

/**
 * Check if file is a supported audio file
 */
function isAudioFile(filepath) {
    return SUPPORTED_AUDIO.includes(getExtension(filepath));
}

/**
 * Check if file is a supported MIDI file
 */
function isMidiFile(filepath) {
    return SUPPORTED_MIDI.includes(getExtension(filepath));
}

/**
 * Check if file is a Live file
 */
function isLiveFile(filepath) {
    return SUPPORTED_LIVE.includes(getExtension(filepath));
}

/**
 * Add to recent files list
 */
function addToRecent(filepath) {
    config.recentFiles = config.recentFiles.filter(f => f !== filepath);
    config.recentFiles.unshift(filepath);
    if (config.recentFiles.length > 20) {
        config.recentFiles = config.recentFiles.slice(0, 20);
    }
}

// ============================================================================
// COMMAND HANDLERS
// ============================================================================

/**
 * Load an Ableton Live set
 * Usage: load_set <filepath>
 */
maxApi.addHandler("load_set", async (filepath) => {
    try {
        log(`Loading set: ${filepath}`);
        
        const normalized = await validatePath(filepath);
        
        if (!normalized.endsWith('.als')) {
            maxApi.outlet("error", "File is not a Live set (.als)");
            return;
        }
        
        addToRecent(normalized);
        
        maxApi.outlet("load", normalized);
        maxApi.outlet("status", `Loaded: ${path.basename(normalized)}`);
        
    } catch (error) {
        maxApi.outlet("error", error.message);
    }
});

/**
 * Add audio or MIDI file to a track
 * Usage: add_file <filepath> <track_index>
 */
maxApi.addHandler("add_file", async (filepath, trackIndex = 0) => {
    try {
        log(`Adding file: ${filepath} to track ${trackIndex}`);
        
        const normalized = await validatePath(filepath);
        const ext = getExtension(normalized);
        
        let fileType = null;
        if (isAudioFile(normalized)) {
            fileType = "audio";
        } else if (isMidiFile(normalized)) {
            fileType = "midi";
        } else {
            maxApi.outlet("error", `Unsupported file type: ${ext}`);
            return;
        }
        
        // Validate track index is a number
        const track = parseInt(trackIndex, 10);
        if (isNaN(track) || track < 0) {
            maxApi.outlet("error", "Invalid track index");
            return;
        }
        
        addToRecent(normalized);
        
        maxApi.outlet("add", {
            path: normalized,
            track: track,
            type: fileType
        });
        maxApi.outlet("status", `Added ${fileType} to track ${track}`);
        
    } catch (error) {
        maxApi.outlet("error", error.message);
    }
});

/**
 * List files in a directory
 * Usage: list_dir <dirpath> [extensions]
 */
maxApi.addHandler("list_dir", async (dirpath, extensions = "") => {
    try {
        log(`Listing directory: ${dirpath}`);
        
        const normalized = await validatePath(dirpath);
        const stats = await fs.stat(normalized);
        
        if (!stats.isDirectory()) {
            maxApi.outlet("error", "Path is not a directory");
            return;
        }
        
        const files = await fs.readdir(normalized);
        
        let filtered = files;
        
        // Filter by extensions if provided
        if (extensions && extensions.length > 0) {
            const extArray = extensions.split(',').map(e => {
                const trimmed = e.trim().toLowerCase();
                return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
            });
            
            filtered = files.filter(f => 
                extArray.some(ext => f.toLowerCase().endsWith(ext))
            );
        }
        
        // Create full paths and sort
        const results = filtered
            .map(f => path.join(normalized, f))
            .sort();
        
        maxApi.outlet("list", results);
        maxApi.outlet("status", `Found ${results.length} files`);
        
    } catch (error) {
        maxApi.outlet("error", error.message);
    }
});

/**
 * List files recursively
 * Usage: list_dir_recursive <dirpath> [extensions] [max_depth]
 */
maxApi.addHandler("list_dir_recursive", async (dirpath, extensions = "", maxDepth = 3) => {
    try {
        log(`Recursively listing: ${dirpath}`);
        
        const normalized = await validatePath(dirpath);
        const depth = parseInt(maxDepth, 10) || 3;
        
        const results = [];
        
        async function scanDir(dir, currentDepth) {
            if (currentDepth > depth) return;
            
            const files = await fs.readdir(dir);
            
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stats = await fs.stat(fullPath);
                
                if (stats.isDirectory()) {
                    await scanDir(fullPath, currentDepth + 1);
                } else {
                    results.push(fullPath);
                }
            }
        }
        
        await scanDir(normalized, 0);
        
        // Filter by extensions if provided
        let filtered = results;
        if (extensions && extensions.length > 0) {
            const extArray = extensions.split(',').map(e => {
                const trimmed = e.trim().toLowerCase();
                return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
            });
            
            filtered = results.filter(f => 
                extArray.some(ext => f.toLowerCase().endsWith(ext))
            );
        }
        
        filtered.sort();
        
        maxApi.outlet("list", filtered);
        maxApi.outlet("status", `Found ${filtered.length} files (recursive)`);
        
    } catch (error) {
        maxApi.outlet("error", error.message);
    }
});

/**
 * Get file information
 * Usage: file_info <filepath>
 */
maxApi.addHandler("file_info", async (filepath) => {
    try {
        const normalized = await validatePath(filepath);
        const stats = await fs.stat(normalized);
        
        const info = {
            path: normalized,
            name: path.basename(normalized),
            ext: path.extname(normalized),
            size: stats.size,
            sizeKB: Math.round(stats.size / 1024),
            sizeMB: Math.round(stats.size / 1024 / 1024 * 100) / 100,
            modified: stats.mtime.toISOString(),
            created: stats.birthtime.toISOString(),
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile()
        };
        
        maxApi.outlet("info", info);
        
    } catch (error) {
        maxApi.outlet("error", error.message);
    }
});

/**
 * Resolve relative path to absolute
 * Usage: resolve_path <relative_path> [base_path]
 */
maxApi.addHandler("resolve_path", (relativePath, basePath = "") => {
    try {
        const resolved = basePath 
            ? path.resolve(basePath, relativePath)
            : path.resolve(relativePath);
        
        maxApi.outlet("resolved", resolved);
        
    } catch (error) {
        maxApi.outlet("error", error.message);
    }
});

/**
 * Check if path exists
 * Usage: path_exists <filepath>
 */
maxApi.addHandler("path_exists", async (filepath) => {
    try {
        const normalized = path.resolve(filepath);
        await fs.access(normalized);
        maxApi.outlet("exists", 1);
    } catch {
        maxApi.outlet("exists", 0);
    }
});

/**
 * Get recent files list
 * Usage: get_recent [limit]
 */
maxApi.addHandler("get_recent", (limit = 20) => {
    const count = parseInt(limit, 10) || 20;
    const recent = config.recentFiles.slice(0, count);
    maxApi.outlet("recent", recent);
});

/**
 * Clear recent files
 * Usage: clear_recent
 */
maxApi.addHandler("clear_recent", () => {
    config.recentFiles = [];
    maxApi.outlet("status", "Recent files cleared");
});

/**
 * Set verbose mode
 * Usage: verbose <0|1>
 */
maxApi.addHandler("verbose", (enabled) => {
    config.verbose = enabled === 1 || enabled === true;
    maxApi.outlet("status", `Verbose mode: ${config.verbose ? "on" : "off"}`);
});

/**
 * Get version info
 * Usage: version
 */
maxApi.addHandler("version", () => {
    maxApi.outlet("version", VERSION);
    maxApi.outlet("status", `live-file-loader v${VERSION}`);
});

/**
 * Get supported file types
 * Usage: supported_types
 */
maxApi.addHandler("supported_types", () => {
    maxApi.outlet("supported", {
        audio: SUPPORTED_AUDIO,
        midi: SUPPORTED_MIDI,
        live: SUPPORTED_LIVE
    });
});

// ============================================================================
// INITIALIZATION
// ============================================================================

maxApi.post(`live-file-loader v${VERSION} initialized`);
maxApi.outlet("status", "ready");
```

---

## Max Abstraction

### File: `patchers/live-file-loader.maxpat`

**Purpose:** Wrapper abstraction that provides a clean interface to the Node.js script.

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

**Inlets:**
1. Command inlet (any message)

**Outlets:**
1. `load` - Path to load (connect to live.path)
2. `add` - File info to add (dict with path, track, type)
3. `list` - List of file paths
4. `info` - File information dict
5. `resolved` - Resolved path
6. `exists` - 0 or 1
7. `recent` - Recent files list
8. `error` - Error messages
9. `status` - Status messages
10. `version` - Version string
11. `supported` - Supported file types dict

**Abstraction Implementation Notes:**
- Set `@autostart 1` on node.script to initialize on load
- Use `[route]` to separate different output types
- Include `[prepend]` objects before node.script for clean message formatting
- Add `[loadbang]` → `version` to verify initialization

---

## Example Patches

### 1. Basic Set Loader (`01-basic-set-loader.maxpat`)

**Features:**
- Simple file browser using `[dialog]`
- Load button
- Status display
- Recent files list

**Components:**
```
[dialog] → [prepend load_set] → [live-file-loader]
                                        ↓
                                  [live.path]
                                        ↓
                                  [print status]
```

### 2. Sample Browser (`02-sample-browser.maxpat`)

**Features:**
- Directory selection
- File list with umenu
- Extension filtering
- Preview capability
- Drag-to-track functionality

**Components:**
```
[dialog @mode 2] → [prepend list_dir] → [live-file-loader]
                                              ↓ list
                                          [umenu]
                                              ↓
                                    [sfplay~] (preview)
```

### 3. Batch Stem Loader (`03-batch-stem-loader.maxpat`)

**Features:**
- Select directory of stems
- Automatically distribute to tracks
- Track offset parameter
- Progress indicator

**Components:**
```
[dialog @mode 2] → [list_dir_recursive .wav] → [live-file-loader]
                                                      ↓ list
                                                [zl iter]
                                                      ↓
                                    [counter] → [pack s i]
                                                      ↓
                                    [prepend add_file] → [live-file-loader]
```

### 4. Setlist Manager (`04-setlist-manager.maxpat`)

**Features:**
- Store list of set paths
- MIDI-triggerable loading
- Current set indicator
- Auto-save setlist

**Components:**
```
[coll setlist] → [prepend load_set] → [live-file-loader]
      ↑                                       ↓
[midiin] → [sel]                      [live.path]
```

### 5. Template Loader (`05-template-loader.maxpat`)

**Features:**
- Pre-configured template sets
- Category browser
- Description display
- Template metadata

**Components:**
```
[umenu Templates] → [dict templates] → [prepend load_set]
                                              ↓
                                     [live-file-loader]
```

---

## Testing Strategy

### Manual Test Suite (`tests/test-suite.maxpat`)

**Test Cases:**

1. **Path Validation**
   - Valid absolute path
   - Valid relative path
   - Non-existent path
   - Invalid characters

2. **File Loading**
   - Load .als file
   - Attempt to load non-.als
   - Load from recent files
   - Load with spaces in name

3. **File Addition**
   - Add audio to track 0
   - Add MIDI to track 5
   - Add to invalid track (-1)
   - Add unsupported format

4. **Directory Listing**
   - List with no filter
   - List with single extension
   - List with multiple extensions
   - List empty directory
   - Recursive vs non-recursive

5. **File Info**
   - Get info on existing file
   - Get info on directory
   - Get info on non-existent path

6. **Path Operations**
   - Resolve relative path
   - Check exists (true)
   - Check exists (false)
   - Cross-platform paths

7. **Recent Files**
   - Add to recent
   - Get recent list
   - Clear recent
   - Recent list max size

### Test Files Structure
```
tests/
├── test-files/
│   ├── valid-set.als
│   ├── audio-samples/
│   │   ├── sample1.wav
│   │   ├── sample2.aif
│   │   └── sample3.mp3
│   ├── midi-files/
│   │   └── pattern.mid
│   └── empty-folder/
└── test-suite.maxpat
```

### Automated Testing (Future)
- Node.js test framework (Jest/Mocha)
- CI/CD with GitHub Actions
- Cross-platform automated tests

---

## Documentation

### README.md

```markdown
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
2. File → Show Package Manager
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

See [API.md](docs/API.md) for complete reference.

## Examples

See `examples/` folder for:
- Basic set loading
- Sample browser
- Batch operations
- Setlist management
- Template loading

## License

MIT - See LICENSE file

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md)
```

### API.md

Document every handler with:
- Purpose
- Parameters
- Return values
- Examples
- Edge cases

### CONTRIBUTING.md

Include:
- Code style guide
- Pull request process
- Issue templates
- Development setup
- Testing requirements

### CHANGELOG.md

Maintain semantic versioning:
```markdown
# Changelog

## [1.0.0] - 2025-01-XX

### Added
- Initial release
- load_set command
- add_file command
- Directory listing
- File info retrieval
- Recent files tracking
```

---

## Packaging

### Icon (`media/icon.png`)

- 256x256 PNG
- Transparent background
- Simple, recognizable design
- Represents file/folder concept

### Help Patch (`help/live-file-loader.maxhelp`)

Structure:
- Title and version
- Quick description
- Basic usage example
- All commands demonstrated
- Links to examples
- Troubleshooting section

### Package Validation

Before release:
1. Test on fresh Max install
2. Verify all paths are relative
3. Check package-info.json metadata
4. Validate help patch opens correctly
5. Test all example patches

---

## Distribution

### GitHub Repository

**Initial Setup:**
```bash
git add .
git commit -m "Initial commit - v1.0.0"
git tag v1.0.0
git remote add origin [repo-url]
git push -u origin main
git push --tags
```

**Release Process:**
1. Update version in all files
2. Update CHANGELOG.md
3. Commit changes
4. Create git tag
5. Push to GitHub
6. Create GitHub Release with:
   - Release notes
   - Downloadable .zip
   - Installation instructions

### Max Package Manager

**Submission:**
1. Create account on packages.cycling74.com
2. Submit package for review
3. Wait for approval (usually 1-2 weeks)
4. Package appears in Package Manager

**Updates:**
- Increment version
- Update package-info.json
- Re-submit through website

### Community Promotion

- Post in Cycling '74 forums
- Share in Max for Live groups
- Create demo video for YouTube
- Write blog post/tutorial
- Share on social media

---

## Maintenance

### Bug Tracking

Use GitHub Issues with labels:
- `bug` - Something broken
- `enhancement` - New feature request
- `documentation` - Docs improvement
- `question` - User support
- `help wanted` - Community contribution welcome

### Version Planning

**Patch (1.0.x):**
- Bug fixes
- Documentation updates
- Minor improvements

**Minor (1.x.0):**
- New features
- Non-breaking changes
- Additional examples

**Major (x.0.0):**
- Breaking API changes
- Major architecture changes
- Removed features

### Community Management

- Respond to issues within 48 hours
- Review PRs within 1 week
- Monthly releases for active development
- Quarterly releases for maintenance

### Future Roadmap Ideas

**v1.1.0:**
- File watching/monitoring
- Clipboard support
- Favorites/bookmarks

**v1.2.0:**
- Live set parsing (read .als metadata)
- Batch rename operations
- Cloud storage integration

**v2.0.0:**
- Plugin/VST management
- Complete Live browser replacement
- Advanced search capabilities

---

## Implementation Checklist

### Phase 1: Core Development (Week 1)
- [ ] Set up repository structure
- [ ] Implement core Node.js script
- [ ] Create main abstraction
- [ ] Build basic set loader example
- [ ] Write initial README

### Phase 2: Features (Week 2)
- [ ] Implement all command handlers
- [ ] Add error handling
- [ ] Create remaining example patches
- [ ] Build help patch
- [ ] Cross-platform path testing

### Phase 3: Documentation (Week 3)
- [ ] Complete API documentation
- [ ] Write contributing guidelines
- [ ] Create video tutorial
- [ ] Screenshot all examples
- [ ] Proofread all docs

### Phase 4: Testing (Week 3-4)
- [ ] Manual test suite
- [ ] Test on Mac
- [ ] Test on Windows
- [ ] Test in Live 11
- [ ] Test in Live 12
- [ ] Beta user testing

### Phase 5: Release (Week 4)
- [ ] Create package icon
- [ ] Validate package structure
- [ ] Create GitHub release
- [ ] Submit to Package Manager
- [ ] Announce in forums
- [ ] Social media promotion

---

## Support Resources

### During Development
- Max SDK documentation
- Node for Max examples
- Live Object Model (LOM) reference
- Cycling '74 forums

### Post-Release
- GitHub Issues for bug reports
- Discussions for feature requests
- Email for critical issues
- Community Discord/Slack (if created)

---

## Success Criteria

**Technical:**
- ✅ Zero crashes in normal operation
- ✅ < 50ms response time for file operations
- ✅ Works on Mac and Windows
- ✅ Compatible with Live 11 & 12

**Adoption:**
- ✅ 100+ downloads in first month
- ✅ Featured on Package Manager
- ✅ Positive forum feedback
- ✅ 3+ community contributions

**Quality:**
- ✅ < 5 critical bugs in first release
- ✅ 90%+ user satisfaction
- ✅ Clear, comprehensive documentation
- ✅ Active maintenance commitment

---

## Contact & Credits

**Author:** Ben Bracken  
**License:** MIT  
**Repository:** [GitHub URL]  
**Issues:** [Issues URL]  

**Inspired by:** 11live.tools by 11olsen

**Thanks to:**
- Cycling '74 for Max/MSP
- Ableton for Live
- The Max for Live community

---

*Last Updated: January 2025*
