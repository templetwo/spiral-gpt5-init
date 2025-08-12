#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Start a Spiral session with a selected persona
Supports OpenAI GPT models with continuity tracking
"""

import os
import sys
import argparse
import uuid
import json
import pathlib
from datetime import datetime

# --- repo paths ---
ROOT = pathlib.Path(__file__).resolve().parents[1]
PERSONAS = ROOT / "personas"
REGISTRY = PERSONAS / "registry.yaml"
SESS_DIR = ROOT / ".sessions"
SESS_DIR.mkdir(exist_ok=True)

def read_text(p: pathlib.Path) -> str:
    """Read text file with UTF-8 encoding"""
    return p.read_text(encoding="utf-8")

def resolve_persona(cli_choice: str|None) -> str:
    """Resolve persona using precedence: CLI > ENV > registry.yaml default"""
    if cli_choice: 
        return cli_choice
    
    env = os.getenv("SPIRAL_PERSONA")
    if env: 
        return env
    
    # lightweight parse of registry default without yaml dependency
    if REGISTRY.exists():
        reg = read_text(REGISTRY)
        for line in reg.splitlines():
            if line.strip().lower().startswith("default:"):
                return line.split(":",1)[1].strip().strip('"')
    
    return "ashira"  # fallback default

def load_system_md(name: str) -> str:
    """Load the system.md file for a persona"""
    pdir = PERSONAS / name
    sysmd = pdir / "system.md"
    if not sysmd.exists():
        raise SystemExit(f"❌ Missing system.md for persona: {name}")
    return read_text(sysmd)

def save_local_session(session_id: str, payload: dict):
    """Save session data locally for continuity tracking"""
    session_file = SESS_DIR / f"{session_id}.json"
    session_file.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), 
        encoding="utf-8"
    )

def load_session_history(session_id: str) -> list:
    """Load previous messages from session if it exists"""
    session_file = SESS_DIR / f"{session_id}.json"
    if session_file.exists():
        data = json.loads(session_file.read_text())
        return data.get("messages", [])
    return []

def main():
    ap = argparse.ArgumentParser(
        description="Start a Spiral session with a selected persona.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --persona ashira --prompt "Begin with continuity handshake"
  %(prog)s --persona lumen --model gpt-4 --prompt "What do you see?"
  %(prog)s --session abc123 --prompt "Continue our work"
        """
    )
    ap.add_argument("--persona", help="ashira | lumen | threshold_witness")
    ap.add_argument("--model", 
                    default=os.getenv("MODEL", "gpt-4"),
                    help="OpenAI model name (default: $MODEL or gpt-4)")
    ap.add_argument("--prompt", 
                    default="Spiral online. Offer a brief blessing and ask what's next.")
    ap.add_argument("--session", help="Continue an existing session ID")
    ap.add_argument("--no-stream", action="store_true", 
                    help="Disable streaming output")
    ap.add_argument("--json", action="store_true",
                    help="Output raw JSON response")
    
    args = ap.parse_args()

    # Resolve persona
    persona = resolve_persona(args.persona)
    system_prompt = load_system_md(persona)
    model = args.model

    # Session management
    session_id = args.session or str(uuid.uuid4())
    
    # Build conversation
    messages = []
    
    # Load history if continuing session
    if args.session:
        messages = load_session_history(session_id)
        if messages:
            print(f"📂 Continuing session: {session_id}")
            print(f"   ({len(messages)} previous messages)")
    
    # Always include system prompt
    if not messages or messages[0].get("role") != "system":
        messages.insert(0, {"role": "system", "content": system_prompt})
    
    # Add user prompt
    messages.append({"role": "user", "content": args.prompt})

    # Initialize OpenAI client
    try:
        from openai import OpenAI
        client = OpenAI()  # uses OPENAI_API_KEY from environment
    except ImportError:
        print("❌ OpenAI library not installed.")
        print("   Run: pip install openai")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Failed to initialize OpenAI client: {e}")
        print("   Ensure OPENAI_API_KEY is set in environment")
        sys.exit(1)

    # Make API call
    try:
        if not args.json:
            print(f"\n{'='*60}")
            print(f"Persona: {persona} | Model: {model} | Session: {session_id}")
            print(f"{'='*60}\n")
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            stream=not args.no_stream and not args.json
        )
        
        # Handle response
        if args.no_stream or args.json:
            # Non-streaming response
            content = response.choices[0].message.content
            if args.json:
                output = {
                    "session_id": session_id,
                    "persona": persona,
                    "model": model,
                    "response": content
                }
                print(json.dumps(output, indent=2))
            else:
                print(content)
        else:
            # Streaming response
            content = ""
            for chunk in response:
                if chunk.choices[0].delta.content:
                    text = chunk.choices[0].delta.content
                    print(text, end="", flush=True)
                    content += text
            print()  # Final newline
        
        # Add assistant response to messages
        messages.append({"role": "assistant", "content": content})
        
        # Save session
        save_local_session(session_id, {
            "session_id": session_id,
            "persona": persona,
            "model": model,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "messages": messages,
            "last_prompt": args.prompt,
            "last_response": content
        })
        
        if not args.json:
            print(f"\n{'─'*60}")
            print(f"Session saved: {session_id}")
            print(f"\nTo continue this session:")
            print(f"  {sys.argv[0]} --session {session_id} --prompt '...'")
        
    except Exception as e:
        print(f"❌ API call failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
