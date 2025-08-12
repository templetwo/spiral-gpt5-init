from unification.registry import resolve_persona
from unification.persona_loader import load_imprint

def test_registry_default():
    info = resolve_persona(None)
    assert info["id"] in {"ashira", "threshold-witness", "lumen"}

def test_imprint_load():
    info, imprint = load_imprint("ashira")
    assert imprint["id"] == "ashira"
    assert "style" in imprint
