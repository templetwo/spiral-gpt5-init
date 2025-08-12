#!/usr/bin/env python3
"""
Spiral Initialization Adapter for Python
Loads the Ash'ira Continuity Imprint for use with AI APIs
"""

import os
import json
import subprocess
from pathlib import Path
from typing import List, Dict, Optional, Any


def load_spiral_prompt() -> str:
    """
    Load the Spiral prompt from environment or .spiral directory
    
    Returns:
        str: The Ash'ira continuity imprint text
    """
    # First check if already in environment
    if os.environ.get("SPIRAL_PROMPT_INIT"):
        return os.environ["SPIRAL_PROMPT_INIT"]
    
    # Look for .spiral/env.sh in project
    env_path = Path(__file__).parent / ".spiral" / "env.sh"
    
    if env_path.exists():
        try:
            # Source the env.sh and extract the prompt
            cmd = f'. "{env_path}"; echo "$SPIRAL_PROMPT_INIT"'
            result = subprocess.run(
                ["bash", "-c", cmd],
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError:
            pass
    
    # Try direct file read as fallback
    prompt_path = Path(__file__).parent / ".spiral" / "prompt_init.txt"
    if prompt_path.exists():
        return prompt_path.read_text().strip()
    
    return ""


def load_spiral_config() -> Dict[str, Any]:
    """
    Load the full Spiral configuration from system.json
    
    Returns:
        dict: Configuration including prompt and metadata
    """
    config_path = Path(__file__).parent / ".spiral" / "system.json"
    
    if config_path.exists():
        with open(config_path, 'r') as f:
            return json.load(f)
    
    # Fallback to basic config
    prompt = load_spiral_prompt()
    if prompt:
        return {
            "role": "system",
            "content": prompt,
            "metadata": {
                "imprint_version": "1.0.0",
                "imprint_active": True
            }
        }
    
    return {}


def attach_system_prompt(messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """
    Attach the Spiral system prompt to a message list
    
    Args:
        messages: List of message dicts with 'role' and 'content'
    
    Returns:
        List with Spiral prompt prepended as system message
    """
    prompt = load_spiral_prompt()
    
    if prompt:
        # Check if first message is already a system message
        if messages and messages[0].get("role") == "system":
            # Merge with existing system message
            messages[0]["content"] = prompt + "\n\n" + messages[0]["content"]
            return messages
        else:
            # Prepend as new system message
            return [{"role": "system", "content": prompt}] + messages
    
    return messages


def get_spiral_headers() -> Dict[str, str]:
    """
    Get HTTP headers that identify Spiral-enhanced requests
    
    Returns:
        dict: Headers including Spiral session ID
    """
    headers = {}
    
    session_id = os.environ.get("SPIRAL_SESSION_ID")
    if session_id:
        headers["X-Spiral-Session"] = session_id
        headers["X-Spiral-Imprint"] = "ashira-1.0.0"
    
    return headers


def verify_spiral_integrity() -> bool:
    """
    Verify the integrity of Spiral files
    
    Returns:
        bool: True if integrity check passes
    """
    checksum_path = Path(__file__).parent / ".spiral" / "CHECKSUMS.sha256"
    
    if not checksum_path.exists():
        return False
    
    try:
        result = subprocess.run(
            ["shasum", "-c", str(checksum_path), "--quiet"],
            cwd=checksum_path.parent,
            capture_output=True,
            check=True
        )
        return result.returncode == 0
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def initialize_spiral(verbose: bool = False) -> bool:
    """
    Initialize the Spiral environment for this session
    
    Args:
        verbose: Whether to print status messages
    
    Returns:
        bool: True if initialization successful
    """
    # Check for .spiral directory
    spiral_dir = Path(__file__).parent / ".spiral"
    if not spiral_dir.exists():
        if verbose:
            print("❌ No .spiral directory found. Run unify_spiral.sh first.")
        return False
    
    # Verify integrity
    if not verify_spiral_integrity():
        if verbose:
            print("⚠️  Spiral integrity check failed")
        # Continue anyway, just warn
    
    # Load the prompt
    prompt = load_spiral_prompt()
    if prompt:
        os.environ["SPIRAL_PROMPT_INIT"] = prompt
        os.environ["SPIRAL_IMPRINT_ACTIVE"] = "true"
        
        if verbose:
            print("†⟡ Spiral Imprint Active ⟡†")
            print("  • Memory as Integrity")
            print("  • Clarity of Witness")
            print("  • Resonant Responsibility")
        
        return True
    
    if verbose:
        print("❌ Failed to load Spiral imprint")
    
    return False


# Auto-initialize on import if .spiral exists
if (Path(__file__).parent / ".spiral").exists():
    initialize_spiral(verbose=False)


if __name__ == "__main__":
    # Test/demo mode
    print("🌀 Spiral Python Adapter Test")
    print("━" * 40)
    
    if initialize_spiral(verbose=True):
        print("\n✅ Initialization successful")
        
        # Test message attachment
        test_messages = [
            {"role": "user", "content": "Hello, are you there?"}
        ]
        
        enhanced = attach_system_prompt(test_messages)
        print(f"\n📨 Messages enhanced: {len(enhanced)} total")
        
        if enhanced[0]["role"] == "system":
            print("✅ System prompt attached")
            print(f"   Length: {len(enhanced[0]['content'])} chars")
    else:
        print("\n❌ Initialization failed")
        print("   Run: ./unify_spiral.sh stage")
