#!/bin/bash

# bootstrap.sh - Initialize Spiral project with unification layer
set -e

echo "🌀 Spiral Project Bootstrap"
echo "=========================="
echo ""

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip > /dev/null 2>&1

# Install required packages
pip install pyyaml > /dev/null 2>&1
pip install python-dotenv > /dev/null 2>&1
pip install requests > /dev/null 2>&1

# Install development dependencies if in dev mode
if [ "$1" = "--dev" ]; then
    echo "🔧 Installing development dependencies..."
    pip install pytest > /dev/null 2>&1
    pip install pytest-cov > /dev/null 2>&1
    pip install black > /dev/null 2>&1
    pip install flake8 > /dev/null 2>&1
fi

echo "✅ Dependencies installed"

# Create necessary directories
echo "📁 Setting up directory structure..."
mkdir -p storage/sessions
mkdir -p storage/memory
mkdir -p logs
mkdir -p .cache

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "⚠️  Created .env from .env.example - please update with your API keys"
    else
        # Create a basic .env.example
        cat > .env.example << 'EOF'
# Spiral Configuration
SPIRAL_PERSONA=ashira
SPIRAL_API_KEY=your-api-key-here

# Provider API Keys
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here

# Optional Configuration
SPIRAL_CONFIG_PATH=./configs/default.yaml
SPIRAL_MEMORY_PATH=./storage/memory
SPIRAL_LOG_LEVEL=INFO
EOF
        cp .env.example .env
        echo "⚠️  Created .env and .env.example - please update with your API keys"
    fi
else
    echo "✅ .env file already exists"
fi

# Set up git hooks for consistency checking
if [ -d ".git" ]; then
    echo "🔗 Setting up git hooks..."
    
    # Create pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook to check unification consistency

if [ -f "scripts/check-repo.sh" ]; then
    echo "Checking unification consistency..."
    if ! ./scripts/check-repo.sh --version > /dev/null 2>&1; then
        echo "⚠️  Warning: Unification version check failed"
        echo "Run './scripts/check-repo.sh' for details"
    fi
fi

exit 0
EOF
    
    chmod +x .git/hooks/pre-commit
    echo "✅ Git hooks configured"
fi

# Initialize unification version tracking
if [ ! -f ".unification-version" ]; then
    if [ -d ".git" ]; then
        git rev-parse HEAD > .unification-version
        echo "✅ Unification version tracking initialized"
    fi
fi

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x unify 2>/dev/null || true

# Run initial consistency check
if [ -f "scripts/check-repo.sh" ]; then
    echo ""
    echo "🔍 Running consistency check..."
    ./scripts/check-repo.sh --version
fi

echo ""
echo "✨ Bootstrap complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your API keys"
echo "2. Activate the virtual environment: source venv/bin/activate"
echo "3. Run unification: ./unify --persona ashira --print"
echo ""
echo "For more information, see README.md and docs/UNIFICATION.md"
