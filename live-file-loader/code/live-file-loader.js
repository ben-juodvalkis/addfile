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

// ============================================================================
// DEVELOPMENT LOG
// ============================================================================
/*
 * Implementation Progress Log
 * ---------------------------
 *
 * 2025-01-12: Initial implementation
 *   - Created directory structure for Max package
 *   - Implemented core Node.js script with all handlers:
 *     - load_set: Load Ableton Live sets (.als)
 *     - add_file: Add audio/MIDI files to tracks
 *     - list_dir: List directory contents with filtering
 *     - list_dir_recursive: Recursive directory listing
 *     - file_info: Get file metadata
 *     - resolve_path: Path resolution utility
 *     - path_exists: Check if path exists
 *     - get_recent: Recent files list
 *     - clear_recent: Clear recent files
 *     - verbose: Toggle verbose logging
 *     - version: Get version info
 *     - supported_types: List supported file extensions
 *   - Created package.json and package-info.json
 *   - Created LICENSE (MIT)
 *   - Created .gitignore
 *   - Created documentation (README, API, CONTRIBUTING, CHANGELOG)
 *
 * TODO (requires Max):
 *   - Create live-file-loader.maxpat abstraction
 *   - Create help/live-file-loader.maxhelp
 *   - Create example patches (01-05)
 *   - Create test-suite.maxpat
 *   - Add package icon (media/icon.png)
 *
 * Notes:
 *   - .maxpat files must be created manually in Max
 *   - Node for Max requires max-api module (bundled with Max 8.5+)
 *   - Tested file types: .wav, .aif, .aiff, .mp3, .flac, .ogg, .m4a (audio)
 *                        .mid, .midi (MIDI)
 *                        .als, .alc, .adg, .adv, .alp (Live)
 */
