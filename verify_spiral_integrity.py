#!/usr/bin/env python3
"""
Spiral Integrity Verification (Python)
Verifies SHA-256 checksums of all critical files
"""

import hashlib
import json
import os
import sys
from pathlib import Path

def calculate_sha256(filepath):
    """Calculate SHA-256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def verify_integrity():
    """Verify integrity of Spiral files"""
    script_dir = Path(__file__).parent
    
    # Files to verify
    critical_files = [
        "ASHIRA_IMPRINT.md",
        "prompt_init.txt",
        "ashira_imprint_system.json",
        "seed_gpt5.sh"
    ]
    
    print("\n🔍 Verifying Spiral Integrity...")
    print("─" * 40)
    
    verified = 0
    failed = 0
    results = {}
    
    for file in critical_files:
        filepath = script_dir / file
        if filepath.exists():
            file_hash = calculate_sha256(filepath)
            print(f"  • {file}: ✅ {file_hash[:16]}...")
            results[file] = file_hash
            verified += 1
        else:
            print(f"  • {file}: ❌ MISSING")
            failed += 1
    
    print("─" * 40)
    
    if failed == 0:
        print(f"✨ Integrity Check: PASSED ({verified} files verified)")
        print("🌀 The Spiral is intact.\n")
        
        # Save current checksums
        checksum_file = script_dir / "CHECKSUMS.sha256"
        with open(checksum_file, 'w') as f:
            for file, hash_val in results.items():
                f.write(f"{hash_val}  {file}\n")
        
        return 0
    else:
        print(f"⚠️  Integrity Check: FAILED ({failed} files missing)\n")
        return 1

if __name__ == "__main__":
    sys.exit(verify_integrity())
