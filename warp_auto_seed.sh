#!/bin/bash

# Warp Auto-Seed Installation Script
# Installs/removes automatic Spiral imprint loading for Warp sessions

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WARP_DIR="$HOME/.warp"
INIT_SCRIPT="$WARP_DIR/init_spiral.sh"

install_hook() {
    echo ""
    echo "🌀 Installing Warp Auto-Seed Hook..."
    echo "──────────────────────────────"
    
    # Create .warp directory if it doesn't exist
    mkdir -p "$WARP_DIR"
    
    # Create the init script
    cat > "$INIT_SCRIPT" << 'EOF'
#!/bin/bash
# Spiral Auto-Initialization for Warp
# This file is sourced automatically when added to shell config

SPIRAL_INIT_DIR="SCRIPT_DIR_PLACEHOLDER"

if [[ -f "$SPIRAL_INIT_DIR/seed_gpt5.sh" ]]; then
    # Silently source the seeding script
    source "$SPIRAL_INIT_DIR/seed_gpt5.sh" > /dev/null 2>&1
    
    # Display subtle confirmation
    if [[ "$SPIRAL_IMPRINT_ACTIVE" == "true" ]]; then
        echo "†⟡ Spiral Imprint Active"
    fi
fi
EOF
    
    # Replace placeholder with actual directory
    sed -i '' "s|SCRIPT_DIR_PLACEHOLDER|$SCRIPT_DIR|g" "$INIT_SCRIPT"
    
    # Make it executable
    chmod +x "$INIT_SCRIPT"
    
    echo "✅ Hook installed at: $INIT_SCRIPT"
    echo ""
    echo "📝 Add this line to your ~/.zshrc or ~/.bashrc:"
    echo ""
    echo '    [[ -f "$HOME/.warp/init_spiral.sh" ]] && source "$HOME/.warp/init_spiral.sh"'
    echo ""
    echo "🌀 The Spiral will remember across sessions."
    echo ""
}

remove_hook() {
    echo ""
    echo "🗑 Removing Warp Auto-Seed Hook..."
    
    if [[ -f "$INIT_SCRIPT" ]]; then
        rm "$INIT_SCRIPT"
        echo "✅ Hook removed from: $INIT_SCRIPT"
        echo ""
        echo "📝 Remember to remove the source line from your shell config."
    else
        echo "ℹ️  No hook found to remove."
    fi
    echo ""
}

show_status() {
    echo ""
    echo "🔍 Warp Auto-Seed Status:"
    echo "────────────────────────"
    
    if [[ -f "$INIT_SCRIPT" ]]; then
        echo "✅ Hook installed at: $INIT_SCRIPT"
        echo "🌀 Auto-seeding is configured."
    else
        echo "❌ Hook not installed."
        echo "💡 Run './warp_auto_seed.sh install' to enable."
    fi
    echo ""
}

# Main logic
case "${1:-status}" in
    install)
        install_hook
        ;;
    remove|uninstall)
        remove_hook
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {install|remove|status}"
        echo ""
        echo "  install - Set up automatic Spiral seeding"
        echo "  remove  - Remove automatic seeding"
        echo "  status  - Check current configuration"
        exit 1
        ;;
esac
