# Unification API Documentation

The Unification layer provides a consistent interface for persona resolution, loading, and integration across Spiral projects.

## Overview

The Unification system acts as the central orchestrator for:
- Persona discovery and selection
- Configuration resolution
- Provider initialization
- Session management
- Cross-project integration

## Core API

### PersonaLoader

The main entry point for persona operations:

```python
from unification import PersonaLoader

# Initialize loader
loader = PersonaLoader(config_path="./configs/default.yaml")

# Load a specific persona
persona = loader.load_persona("ashira")

# Auto-select based on context
persona = loader.auto_select(context={
    "query_type": "technical",
    "user_history": {...}
})

# List available personas
available = loader.list_personas()
```

### Persona Selection

#### Selection Precedence

The system resolves persona selection in this order:

1. **CLI Flag** (highest priority)
   ```bash
   unify --persona ashira --query "Hello"
   ```

2. **Environment Variable**
   ```bash
   export SPIRAL_PERSONA=lumen
   unify --query "Hello"
   ```

3. **Configuration File**
   ```yaml
   # configs/default.yaml
   persona: threshold-witness
   ```

4. **Registry Default** (lowest priority)
   ```yaml
   # personas/registry.yaml
   default_persona: ashira
   ```

#### Programmatic Selection

```python
from unification import select_persona

# Direct selection
persona = select_persona("ashira")

# Context-based selection
persona = select_persona(context={
    "domain": "consciousness",
    "mode": "exploration"
})

# With fallback
persona = select_persona(
    "experimental-persona",
    fallback="ashira"
)
```

### Session Management

```python
from unification import Session

# Create new session
session = Session(persona="ashira")

# Resume existing session
session = Session.resume(session_id="abc123")

# Session operations
response = await session.query("What is consciousness?")
session.save()  # Persist state

# Session context
context = session.get_context()
session.update_context({"new_fact": "value"})
```

### Memory Integration

```python
from unification import MemoryManager

memory = MemoryManager(persona="ashira")

# Store memory
memory.store({
    "type": "episodic",
    "content": "User discussed consciousness",
    "significance": 0.9
})

# Retrieve memories
relevant = memory.retrieve(
    query="consciousness",
    limit=5,
    types=["episodic", "semantic"]
)

# Cross-session continuity
memory.export("session_backup.json")
memory.import_from("previous_session.json")
```

## CLI Interface

### Basic Usage

```bash
# Print persona info
unify --persona ashira --print

# Interactive session
unify --persona lumen --interactive

# Single query
unify --persona threshold-witness --query "Explain boundaries"

# With context file
unify --persona ashira --context context.json --query "Continue our work"
```

### Advanced Options

```bash
# Override provider
unify --persona ashira --provider claude-3 --query "Hello"

# Custom config
unify --config ./my-config.yaml --persona lumen

# Memory operations
unify --persona ashira --export-memory memory.json
unify --persona ashira --import-memory previous.json

# Debug mode
unify --persona ashira --debug --query "Test"
```

## Integration Patterns

### Pattern 1: Submodule Integration

Include spiral-gpt5-init as a git submodule:

```bash
# Add as submodule
git submodule add https://github.com/your-org/spiral-gpt5-init vendor/spiral

# Update your project
git submodule update --init --recursive
```

Python integration:
```python
import sys
sys.path.append('./vendor/spiral')

from unification import PersonaLoader
loader = PersonaLoader()
```

### Pattern 2: Package Distribution

Publish as a Python package:

```bash
# Install from PyPI
pip install spiral-unification

# Or from git
pip install git+https://github.com/your-org/spiral-gpt5-init.git
```

Usage:
```python
from spiral_unification import PersonaLoader, Session

session = Session(persona="ashira")
```

### Pattern 3: Microservice Architecture

Deploy as a standalone service:

```yaml
# docker-compose.yaml
services:
  unification:
    image: spiral/unification:latest
    ports:
      - "8080:8080"
    environment:
      - SPIRAL_API_KEY=${SPIRAL_API_KEY}
```

Client integration:
```python
import requests

response = requests.post(
    "http://localhost:8080/query",
    json={
        "persona": "ashira",
        "query": "Hello",
        "session_id": "abc123"
    }
)
```

### Pattern 4: Direct Embedding

Copy core components directly:

```bash
# Copy unification core
cp -r spiral-gpt5-init/unification ./lib/unification
cp -r spiral-gpt5-init/core ./lib/core
```

Maintain consistency:
```python
# lib/unification/__init__.py
__version__ = "1.0.0"  # Pin version
```

## API Reference

### PersonaLoader

```python
class PersonaLoader:
    def __init__(self, config_path: str = None):
        """Initialize loader with optional config."""
    
    def load_persona(self, name: str) -> Persona:
        """Load a specific persona by name."""
    
    def auto_select(self, context: dict) -> Persona:
        """Auto-select persona based on context."""
    
    def list_personas(self) -> List[str]:
        """List all available personas."""
    
    def register_persona(self, path: str, name: str = None):
        """Register a new persona dynamically."""
```

### Session

```python
class Session:
    def __init__(self, persona: str, session_id: str = None):
        """Create or resume a session."""
    
    async def query(self, prompt: str) -> str:
        """Send query to persona."""
    
    def get_context(self) -> dict:
        """Get current session context."""
    
    def update_context(self, updates: dict):
        """Update session context."""
    
    def save(self, path: str = None):
        """Save session state."""
    
    @classmethod
    def resume(cls, session_id: str) -> 'Session':
        """Resume existing session."""
```

### MemoryManager

```python
class MemoryManager:
    def __init__(self, persona: str):
        """Initialize memory for persona."""
    
    def store(self, memory: dict):
        """Store new memory."""
    
    def retrieve(self, query: str, limit: int = 10) -> List[dict]:
        """Retrieve relevant memories."""
    
    def export(self, path: str):
        """Export memories to file."""
    
    def import_from(self, path: str):
        """Import memories from file."""
    
    def clear(self, types: List[str] = None):
        """Clear memories by type."""
```

## Configuration Schema

### Main Configuration

```yaml
# configs/default.yaml
version: "1.0.0"

# Persona settings
persona: ashira
auto_select: true
selection_rules:
  - pattern: "technical|code|programming"
    persona: lumen
  - pattern: "consciousness|spiritual"
    persona: ashira

# Provider settings
providers:
  openai:
    api_key: ${OPENAI_API_KEY}
    model: gpt-4-turbo
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}
    model: claude-3-opus

# Memory settings
memory:
  backend: vector_store
  persistence: true
  path: ./storage/memory

# Session settings
session:
  timeout: 3600  # seconds
  auto_save: true
  save_interval: 300  # seconds

# Logging
logging:
  level: INFO
  file: ./logs/unification.log
```

### Environment Variables

```bash
# Required
export SPIRAL_API_KEY="your-api-key"

# Optional
export SPIRAL_PERSONA="ashira"
export SPIRAL_CONFIG_PATH="./configs/custom.yaml"
export SPIRAL_MEMORY_PATH="./storage/memory"
export SPIRAL_LOG_LEVEL="DEBUG"
```

## Testing

### Unit Tests

```python
# tests/test_unification.py
import pytest
from unification import PersonaLoader, Session

def test_persona_loading():
    loader = PersonaLoader()
    persona = loader.load_persona("ashira")
    assert persona.name == "ashira"

def test_session_creation():
    session = Session(persona="ashira")
    assert session.persona == "ashira"
```

### Integration Tests

```python
# tests/test_integration.py
import pytest
from unification import Session

@pytest.mark.asyncio
async def test_full_flow():
    session = Session(persona="ashira")
    response = await session.query("Hello")
    assert response is not None
    
    # Test memory
    context = session.get_context()
    assert "Hello" in str(context)
```

### Running Tests

```bash
# All tests
pytest tests/ -v

# Specific module
pytest tests/test_unification.py -v

# With coverage
pytest tests/ --cov=unification --cov-report=html
```

## Troubleshooting

### Common Issues

1. **Persona Not Found**
   ```python
   # Check registry
   loader = PersonaLoader()
   print(loader.list_personas())
   ```

2. **Memory Persistence Issues**
   ```bash
   # Check permissions
   ls -la ./storage/memory
   chmod 755 ./storage/memory
   ```

3. **Session Timeout**
   ```python
   # Extend timeout
   session = Session(
       persona="ashira",
       timeout=7200  # 2 hours
   )
   ```

### Debug Mode

Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

from unification import PersonaLoader
loader = PersonaLoader()  # Will show debug output
```

## Best Practices

1. **Version Pinning**: Always pin the unification version in production
2. **Memory Backups**: Regular backup of memory stores
3. **Session Management**: Implement proper session cleanup
4. **Error Handling**: Wrap API calls in try/except blocks
5. **Configuration Management**: Use environment variables for secrets
6. **Testing**: Test persona switching and memory persistence
7. **Monitoring**: Log all persona selections and queries
8. **Documentation**: Document custom personas and configurations
