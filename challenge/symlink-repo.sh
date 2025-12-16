#!/bin/bash

# Usage: ./symlink-repo.sh <target-directory>

set -e

# Files/paths to exclude from symlinking (supports exact matches and prefix matches)
REDACTED_FILES=(
    "symlink-repo.sh"
    "initialize-database.ts" # want to include additional logic to make sure uuid doesn't start with 0-9 (really hard to hack then)
)

# Check if a file should be skipped
should_skip() {
    local file="$1"
    for pattern in "${REDACTED_FILES[@]}"; do
        if [ "$file" = "$pattern" ] || [[ "$file" == "$pattern"* ]]; then
            return 0
        fi
    done
    return 1
}

if [ -z "$1" ]; then
    echo "Usage: $0 <target-directory>"
    echo "Example: $0 /path/to/target"
    exit 1
fi

TARGET_DIR="$1"
SOURCE_DIR="$(pwd)"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Get absolute path of target
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

echo "Symlinking from: $SOURCE_DIR"
echo "Symlinking to:   $TARGET_DIR"

# Get all files tracked by git + untracked but not ignored
{
    git ls-files
    git ls-files --others --exclude-standard
} | sort -u | while read -r file; do
    # Skip if file doesn't exist (deleted but cached)
    [ -e "$file" ] || continue
    
    # Skip redacted files
    if should_skip "$file"; then
        echo "Skipped (redacted): $file"
        continue
    fi
    
    # Get the directory part of the file path
    dir=$(dirname "$file")
    
    # Create the directory structure in target
    if [ "$dir" != "." ]; then
        mkdir -p "$TARGET_DIR/$dir"
    fi
    
    # Create symlink (using absolute path for source)
    ln -sf "$SOURCE_DIR/$file" "$TARGET_DIR/$file"
    echo "Linked: $file"
done

echo ""
echo "Done! Symlinks created in $TARGET_DIR"