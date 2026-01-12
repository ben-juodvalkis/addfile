# Tests

This folder contains test files and the test suite patch.

## Required Files (Create in Max)

### test-suite.maxpat

Manual test suite covering:

1. **Path Validation**
   - Valid absolute path
   - Valid relative path
   - Non-existent path

2. **File Loading**
   - Load .als file
   - Attempt to load non-.als
   - Load with spaces in filename

3. **File Addition**
   - Add audio to track 0
   - Add MIDI to track 5
   - Add to invalid track (-1)
   - Add unsupported format

4. **Directory Listing**
   - List with no filter
   - List with single extension
   - List with multiple extensions
   - Recursive vs non-recursive

5. **File Info**
   - Get info on existing file
   - Get info on directory

6. **Path Operations**
   - Resolve relative path
   - Check exists (true/false)

7. **Recent Files**
   - Add to recent
   - Get recent list
   - Clear recent

## Test Files

The `test-files/` folder should contain:
- `valid-set.als` - A valid Live set for testing
- `audio-samples/` - Sample audio files
- `midi-files/` - Sample MIDI files
- `empty-folder/` - Empty directory for edge case testing
