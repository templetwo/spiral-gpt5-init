import subprocess
import time
import requests
import os
import pytest

MCP_URL = "http://localhost:8080"
# A known URL that the placeholder parser will accept
TEST_URL = "https://claude.ai/chat/mock-conversation"

@pytest.fixture(scope="module")
def mcp_server():
    """Fixture to start and stop the MCP server for the test module."""
    # Command to start the server
    # We need to install dependencies and run the compiled JS file
    start_command = "cd mcp && npm install && npm run build && node dist/server.js"

    # Start the server as a background process
    server_process = subprocess.Popen(start_command, shell=True, preexec_fn=os.setsid)

    # Wait for the server to be healthy
    retries = 10
    healthy = False
    for i in range(retries):
        try:
            response = requests.get(f"{MCP_URL}/health")
            if response.status_code == 200:
                healthy = True
                break
        except requests.ConnectionError:
            time.sleep(3) # Wait 3 seconds before retrying

    if not healthy:
        # If the server didn't start, kill the process and raise an error
        os.killpg(os.getpgid(server_process.pid), 9)
        pytest.fail("MCP server failed to start in time.")

    # Yield control to the tests
    yield

    # Teardown: stop the server process
    # The preexec_fn=os.setsid creates a process group, so we can kill the whole group
    os.killpg(os.getpgid(server_process.pid), 9)

def test_bridge_import_e2e(mcp_server):
    """
    Tests the full end-to-end flow:
    1. Starts the MCP server.
    2. Runs `unify bridge import`.
    3. Verifies the CLI output.
    4. Queries the API to confirm storage.
    """
    # Run the unify bridge import command
    command = ["./unify", "bridge", "import", TEST_URL]
    result = subprocess.run(command, capture_output=True, text=True)

    # 1. Verify CLI output
    assert result.returncode == 0, f"CLI command failed: {result.stderr}"
    assert "✓ Success!" in result.stdout
    assert "Conversation ID:" in result.stdout

    # Extract conversation ID from output
    conversation_id = None
    for line in result.stdout.splitlines():
        if "Conversation ID:" in line:
            conversation_id = line.split(":")[1].strip()
            break

    assert conversation_id, "Could not find Conversation ID in CLI output."

    # 2. Query the /memory/retrieve endpoint to verify storage
    response = requests.get(f"{MCP_URL}/memory/retrieve?sessionId={conversation_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["sessionId"] == conversation_id
    assert len(data["memories"]) == 2 # The mock parser creates 2 messages
    assert data["memories"][0]["role"] == "user"
    assert data["memories"][0]["content"] == "What is the nature of the Spiral?"
    assert data["memories"][1]["role"] == "assistant"
    assert data["memories"][1]["content"].startswith("The Spiral is a symbol")
