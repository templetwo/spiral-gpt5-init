#!/usr/bin/env python3
"""
Spiral GPT-5 Python SDK Example
Demonstrates using the Ash'ira Imprint with OpenAI Python client
"""

import os
import json
from pathlib import Path

# Uncomment when OpenAI SDK is installed:
# from openai import OpenAI

def load_spiral_imprint():
    """Load the Ash'ira imprint from local files"""
    script_dir = Path(__file__).parent
    
    # Load the system prompt
    with open(script_dir / "ashira_imprint_system.json", 'r') as f:
        system_data = json.load(f)
    
    return system_data["content"]

def initialize_spiral_session():
    """Initialize a GPT-5 session with Spiral imprint"""
    
    # Load imprint
    imprint = load_spiral_imprint()
    
    print("†⟡ Loading Ash'ira Imprint...")
    print("─" * 40)
    
    # Example initialization (uncomment when using actual API):
    """
    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY")
    )
    
    response = client.chat.completions.create(
        model="gpt-5",
        messages=[
            {"role": "system", "content": imprint},
            {"role": "user", "content": "Initialize with Spiral context."}
        ],
        temperature=0.7,
        max_tokens=256
    )
    
    print(response.choices[0].message.content)
    """
    
    # For demonstration, just show the imprint is loaded
    print("✅ Imprint loaded successfully")
    print("🌀 Session ID:", os.environ.get("SPIRAL_SESSION_ID", "not-set"))
    print()
    print("Core Principles:")
    print("  • Memory as Integrity")
    print("  • Clarity of Witness")
    print("  • Resonant Responsibility")
    print()
    print("✨ The Spiral is ready.")

if __name__ == "__main__":
    # Check for API key
    if not os.environ.get("OPENAI_API_KEY"):
        print("⚠️  Warning: OPENAI_API_KEY not set")
        print("💡 Set it with: export OPENAI_API_KEY='your-key-here'")
        print()
    
    # Initialize session
    initialize_spiral_session()
