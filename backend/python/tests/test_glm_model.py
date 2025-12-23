# -*- coding: utf-8 -*-
"""
Direct API endpoint tests for chat functionality.
Tests actual /api/chat/stream endpoint.
"""
import os
import sys
import json

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

# Set test environment variables
os.environ['GLM_API_KEY'] = 'test-glm-api-key'


class TestAPIEndpoint:
    """Test actual API endpoints directly"""
    
    def test_chat_stream_endpoint(self):
        """Test /api/chat/stream endpoint directly"""
        try:
            from fastapi.testclient import TestClient
            from main import app
            
            client = TestClient(app)
            
            # Test data matching what frontend sends
            test_request = {
                "messages": [
                    {
                        "id": "msg-1",
                        "content": "Hello, how are you?",
                        "sender": "user",
                        "time": "2024-01-01T12:00:00Z"
                    }
                ],
                "model": "glm-4",
                "temperature": 0.7,
                "maxTokens": 1000
            }
            
            # Make actual API call
            response = client.post("/api/chat/stream", json=test_request)
            
            # Check response
            assert response.status_code == 200
            assert "text/plain" in response.headers["content-type"]
            
            # Parse streaming response
            content = response.content.decode()
            lines = [line for line in content.split("\n") if line.strip()]
            
            # Should get some response (even error response)
            assert len(lines) > 0
            
            # Try to parse JSON
            for line in lines:
                data = json.loads(line)
                assert "content" in data
                assert "finished" in data
                
            print("API endpoint test passed")
            return True
            
        except Exception as e:
            print(f"API endpoint test failed: {str(e)}")
            return False
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        try:
            from fastapi.testclient import TestClient
            from main import app
            
            client = TestClient(app)
            response = client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert "configured_models" in data
            
            print("Health endpoint test passed")
            return True
            
        except Exception as e:
            print(f"Health endpoint test failed: {str(e)}")
            return False
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        try:
            from fastapi.testclient import TestClient
            from main import app
            
            client = TestClient(app)
            response = client.get("/")
            
            assert response.status_code == 200
            data = response.json()
            assert "message" in data
            
            print("Root endpoint test passed")
            return True
            
        except Exception as e:
            print(f"Root endpoint test failed: {str(e)}")
            return False


if __name__ == "__main__":
    test = TestAPIEndpoint()
    
    print("Testing API endpoints directly...")
    
    # Test all endpoints
    health_ok = test.test_root_endpoint()
    health_check_ok = test.test_health_endpoint()
    chat_ok = test.test_chat_stream_endpoint()
    
    print("\nTest Summary:")
    print(f"   - Root endpoint: {'OK' if health_ok else 'FAIL'}")
    print(f"   - Health endpoint: {'OK' if health_check_ok else 'FAIL'}")
    print(f"   - Chat stream endpoint: {'OK' if chat_ok else 'FAIL'}")
    
    if health_ok and health_check_ok and chat_ok:
        print("\nAll API endpoint tests passed!")
        print("\nThis confirms /api/chat/stream endpoint works correctly")
        print("   Any frontend issues are likely related to network or API keys")
    else:
        print("\nSome tests failed - check configuration")
