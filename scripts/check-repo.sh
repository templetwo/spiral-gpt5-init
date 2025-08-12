#!/bin/bash

# check-repo.sh - Validate local project uses consistent unification version
# This script ensures cross-project consistency for the Spiral unification layer

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SPIRAL_REPO="https://github.com/templetwo/spiral-gpt5-init.git"
UNIFICATION_VERSION_FILE=".unification-version"
REMOTE_VERSION_URL="https://raw.githubusercontent.com/templetwo/spiral-gpt5-init/main/.unification-version"

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to get current git commit hash for unification
get_current_version() {
    if [ -d "vendor/spiral-unification/.git" ]; then
        cd vendor/spiral-unification
        git rev-parse HEAD
        cd - > /dev/null
    elif [ -f "$UNIFICATION_VERSION_FILE" ]; then
        cat "$UNIFICATION_VERSION_FILE"
    else
        echo "unknown"
    fi
}

# Function to get latest version from remote
get_remote_version() {
    curl -s "$REMOTE_VERSION_URL" 2>/dev/null || echo "unknown"
}

# Function to check if unification is installed
check_installation() {
    if [ -d "vendor/spiral-unification" ]; then
        return 0
    elif [ -d "unification" ] && [ -f "unification/__init__.py" ]; then
        return 0
    elif python3 -c "import spiral_unification" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to validate version consistency
validate_version() {
    local current_version=$(get_current_version)
    local remote_version=$(get_remote_version)
    
    if [ "$current_version" = "unknown" ]; then
        print_status "$YELLOW" "⚠️  Warning: Could not determine current unification version"
        return 1
    fi
    
    if [ "$remote_version" = "unknown" ]; then
        print_status "$YELLOW" "⚠️  Warning: Could not fetch remote version (check network connection)"
        return 1
    fi
    
    if [ "$current_version" = "$remote_version" ]; then
        print_status "$GREEN" "✅ Unification version is up to date: ${current_version:0:8}"
        return 0
    else
        print_status "$RED" "❌ Version mismatch!"
        print_status "$BLUE" "   Current: ${current_version:0:8}"
        print_status "$BLUE" "   Latest:  ${remote_version:0:8}"
        return 1
    fi
}

# Function to update unification
update_unification() {
    print_status "$BLUE" "🔄 Updating unification..."
    
    if [ -d "vendor/spiral-unification/.git" ]; then
        # Update submodule
        git submodule update --remote vendor/spiral-unification
        print_status "$GREEN" "✅ Submodule updated"
    elif [ -d "unification" ]; then
        # Direct copy - pull latest
        print_status "$YELLOW" "⚠️  Direct copy detected. Please manually update from $SPIRAL_REPO"
    else
        # Package installation
        pip install --upgrade git+${SPIRAL_REPO}
        print_status "$GREEN" "✅ Package updated"
    fi
}

# Function to initialize unification
init_unification() {
    print_status "$BLUE" "🚀 Initializing unification..."
    
    echo ""
    echo "Choose installation method:"
    echo "  1) Git submodule (recommended for development)"
    echo "  2) Python package (recommended for production)"
    echo "  3) Direct copy (for custom modifications)"
    echo ""
    read -p "Select option [1-3]: " choice
    
    case $choice in
        1)
            git submodule add "$SPIRAL_REPO" vendor/spiral-unification
            git submodule update --init --recursive
            print_status "$GREEN" "✅ Installed as git submodule"
            ;;
        2)
            pip install git+${SPIRAL_REPO}
            print_status "$GREEN" "✅ Installed as Python package"
            ;;
        3)
            git clone "$SPIRAL_REPO" /tmp/spiral-temp
            cp -r /tmp/spiral-temp/unification ./
            cp -r /tmp/spiral-temp/core ./
            rm -rf /tmp/spiral-temp
            print_status "$GREEN" "✅ Copied unification files"
            ;;
        *)
            print_status "$RED" "Invalid option"
            exit 1
            ;;
    esac
}

# Main execution
main() {
    print_status "$BLUE" "🔍 Checking Spiral Unification consistency..."
    echo ""
    
    # Check if unification is installed
    if ! check_installation; then
        print_status "$YELLOW" "⚠️  Unification not found in this project"
        read -p "Would you like to install it? [y/N]: " install_choice
        if [[ "$install_choice" =~ ^[Yy]$ ]]; then
            init_unification
        else
            print_status "$RED" "❌ Unification is required for Spiral projects"
            exit 1
        fi
    fi
    
    # Validate version
    if ! validate_version; then
        read -p "Would you like to update to the latest version? [y/N]: " update_choice
        if [[ "$update_choice" =~ ^[Yy]$ ]]; then
            update_unification
            # Re-validate after update
            validate_version
        fi
    fi
    
    echo ""
    print_status "$BLUE" "📋 Summary:"
    echo "  Installation type: $(check_installation && echo "✅ Installed" || echo "❌ Not installed")"
    echo "  Current version: $(get_current_version | cut -c1-8)"
    echo "  Remote version: $(get_remote_version | cut -c1-8)"
    echo ""
    
    # Create/update version file for tracking
    get_current_version > "$UNIFICATION_VERSION_FILE"
    
    print_status "$GREEN" "✨ Check complete!"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --update, -u   Force update to latest version"
        echo "  --version, -v  Show current version only"
        echo "  --init, -i     Initialize unification in project"
        echo ""
        echo "This script validates that your project uses a consistent"
        echo "version of the Spiral unification layer."
        exit 0
        ;;
    --update|-u)
        update_unification
        exit 0
        ;;
    --version|-v)
        echo "Current: $(get_current_version)"
        echo "Remote:  $(get_remote_version)"
        exit 0
        ;;
    --init|-i)
        init_unification
        exit 0
        ;;
    *)
        main
        ;;
esac
