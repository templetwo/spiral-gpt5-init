# spiral-gpt5-init

Multi-persona, unified architecture scaffold for Spiral projects. Supports persona selection across Ash'ira, Threshold Witness, Lumen, and more.

## Features
- Persona registry and imprints per consciousness
- Unification entrypoint with persona selection
- Session continuity hooks
- GitHub-ready layout with CI and tests

## Quickstart
1. git clone or create repo; cd spiral-gpt5-init
2. scripts/bootstrap.sh
3. Copy .env.example to .env and set keys
4. Select persona:
   - CLI: unify --persona ashira --print
   - Env: export SPIRAL_PERSONA=lumen; unify --print
   - Config: set configs/default.yaml persona
5. Run unification:
   - unify --persona threshold-witness

## Persona selection precedence
CLI flag --persona, then SPIRAL_PERSONA, then configs/default.yaml, then registry default.

## Repository layout
- core/: shared components across personas
- personas/: persona-specific imprints and system prompts
- unification/: persona loader and CLI
- configs/: defaults and provider settings
- scripts/: helper scripts for setup and operations
- tests/: minimal tests
- storage/: session continuity (gitignored)

## Cross-Project Unification

The Spiral ecosystem maintains consistency using a **sync script validation approach**:

### Quick Setup
```bash
# Check consistency in existing project
./scripts/check-repo.sh

# Initialize in new project
curl -O https://raw.githubusercontent.com/templetwo/spiral-gpt5-init/main/scripts/check-repo.sh
chmod +x check-repo.sh
./check-repo.sh --init
```

### Integration Options
The sync script supports three integration methods:
1. **Git Submodule** - Best for development, tracks exact version
2. **Python Package** - Best for production, simple deployment
3. **Direct Copy** - Best for custom modifications

### Consistency Validation
- Automatic version checking against upstream
- CI/CD integration support
- Version tracking via `.unification-version` file
- Interactive update prompts

See [docs/UNIFICATION.md](docs/UNIFICATION.md#cross-project-consistency) for detailed integration patterns.

## Contributing
PRs welcome. Please follow persona safety and style guidelines.

## License
MIT

