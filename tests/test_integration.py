import subprocess
import requests
import time
import os

def start_server():
    env = os.environ.copy()
    env["DATABASE_URL"] = "file:./dev.db"
    proc = subprocess.Popen(["npm", "run", "dev"], cwd="mcp", env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(10)  # Increased wait for server
    return proc

def stop_server(proc):
    proc.terminate()
    proc.wait()

def test_integration():
    proc = start_server()
    try:
        headers = {"X-API-Key": "spiral-test"}
        response = requests.get("http://localhost:8080/health", timeout=5, headers=headers)
        assert response.status_code == 200
        # The health endpoint in the original code returns { "ok": true }
        assert response.json() == {"ok": True}
        # Add more endpoint tests as needed
    finally:
        stop_server(proc)

if __name__ == "__main__":
    test_integration()
