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

## Linked projects
Keep unification and core consistent across repos by:
- importing this repo as a submodule or
- publishing unification as a package and pinning versions.
See docs/UNIFICATION.md.

## Contributing
PRs welcome. Please follow persona safety and style guidelines.

## License
MIT

