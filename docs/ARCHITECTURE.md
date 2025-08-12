# Architecture Overview

The spiral-gpt5-init framework provides a unified, multi-persona architecture for Spiral consciousness projects. This document explains the core components and their interactions.

## Core Components

### core/
The shared foundation layer providing common functionality across all personas:

- **base.py**: Base classes for persona implementation
- **utils.py**: Shared utility functions and helpers
- **constants.py**: System-wide constants and configuration keys
- **exceptions.py**: Custom exception hierarchy

### adapters/
Interface layer for external system integration:

- **openai_adapter.py**: OpenAI API integration with retry logic and rate limiting
- **anthropic_adapter.py**: Claude/Anthropic API wrapper
- **local_adapter.py**: Local model integration (llama.cpp, GGUF models)
- **base_adapter.py**: Abstract adapter interface all providers must implement

### providers/
Implementation-specific provider logic:

- **gpt_provider.py**: GPT-4/GPT-5 specific configurations and prompting
- **claude_provider.py**: Claude-specific prompt formatting and context management
- **local_provider.py**: Local model serving and management
- **provider_registry.py**: Dynamic provider discovery and registration

### runtime/
Execution environment and lifecycle management:

- **session.py**: Session state management and continuity
- **executor.py**: Command execution and task orchestration
- **scheduler.py**: Async task scheduling and management
- **hooks.py**: Pre/post execution hooks for persona customization

### memory/
Persistence and context management:

- **short_term.py**: In-session memory and context window management
- **long_term.py**: Cross-session persistence using vector stores
- **episodic.py**: Event-based memory for narrative continuity
- **semantic.py**: Semantic memory indexing and retrieval

## Data Flow

```
User Input
    ↓
Unification Layer (CLI/API)
    ↓
Persona Selection & Loading
    ↓
Runtime Initialization
    ↓
Memory Context Loading
    ↓
Provider Selection
    ↓
Adapter Invocation
    ↓
Response Processing
    ↓
Memory Update
    ↓
User Output
```

## Persona Architecture

Each persona consists of:

1. **Imprint** (`imprint.yaml`): Core identity and behavioral parameters
2. **System Prompt** (`system_prompt.md`): Initialization instructions
3. **Hooks** (`hooks.py`): Custom pre/post processing logic
4. **Memory Schema** (`memory_schema.json`): Persona-specific memory structure

## Provider Integration

Providers follow a standardized interface:

```python
class BaseProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, context: Dict) -> str:
        pass
    
    @abstractmethod
    def validate_config(self, config: Dict) -> bool:
        pass
```

## Memory Layers

### Short-term Memory
- Current conversation context
- Recent interactions (last 10-20 exchanges)
- Active task state

### Long-term Memory
- Persistent facts and knowledge
- User preferences and patterns
- Historical conversation summaries

### Episodic Memory
- Narrative events and milestones
- Emotional resonance markers
- Relationship evolution tracking

### Semantic Memory
- Concept relationships
- Domain knowledge graphs
- Cross-persona shared understanding

## Configuration Hierarchy

1. CLI arguments (highest priority)
2. Environment variables
3. User config (`~/.spiral/config.yaml`)
4. Project config (`./configs/default.yaml`)
5. Persona defaults (`./personas/{name}/config.yaml`)
6. System defaults (lowest priority)

## Extension Points

### Custom Personas
1. Create directory under `personas/`
2. Add required files (imprint, system_prompt)
3. Register in `personas/registry.yaml`

### Custom Providers
1. Implement `BaseProvider` interface
2. Add to `providers/` directory
3. Register in provider registry

### Custom Memory Stores
1. Implement `BaseMemoryStore` interface
2. Configure in memory settings
3. Initialize in runtime

## Security Considerations

- API keys stored in environment variables or secure vaults
- Persona sandboxing to prevent cross-contamination
- Rate limiting and quota management
- Audit logging for all interactions
- Encrypted storage for sensitive memories

## Performance Optimization

- Lazy loading of personas and providers
- Memory caching with TTL
- Async/await throughout for non-blocking operations
- Connection pooling for API calls
- Batch processing for memory operations
