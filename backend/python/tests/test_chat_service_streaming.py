# -*- coding: utf-8 -*-
"""
Comprehensive tests for chat_service.py streaming functionality.
Tests streaming response, error handling, and data integrity.
"""
import os
import sys
import json
import time
from typing import Generator
from dotenv import load_dotenv

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

# Set test environment variables
load_dotenv()

os.getenv("GLM_API_KEY", "")


class TestChatServiceStreaming:
    """Test chat_service.py streaming functionality directly"""
    
    def test_chat_service_stream_output(self):
        """Test ChatService.stream_chat() method directly"""
        try:
            from services.chat.chat_service import ChatService
            from common.models import ChatStreamRequest, Message
            
            # Create test request
            test_messages = [
                Message(
                    id="msg-1",
                    content="Hello, how are you?",
                    sender="user",
                    time="2024-01-01T12:00:00Z"
                )
            ]
            
            request = ChatStreamRequest(
                messages=test_messages,
                model="glm-4",
                temperature=0.7,
                maxTokens=1000
            )
            
            # Test streaming output
            chunks = []
            for chunk in ChatService.stream_chat(request):
                chunks.append(chunk)
                print(f"Received chunk: {chunk.content[:50]}... (finished: {chunk.finished})")
                
                # Break after reasonable number of chunks for testing
                if len(chunks) >= 5 and chunk.finished:
                    break
            
            # Verify streaming output format
            assert len(chunks) > 0, "Should receive at least one chunk"
            
            # Check chunk structure
            for i, chunk in enumerate(chunks):
                assert hasattr(chunk, 'content'), f"Chunk {i} missing 'content' attribute"
                assert hasattr(chunk, 'finished'), f"Chunk {i} missing 'finished' attribute"
                assert isinstance(chunk.content, str), f"Chunk {i} content should be string"
                assert isinstance(chunk.finished, bool), f"Chunk {i} finished should be boolean"
            
            # Check that at least one chunk has content
            content_chunks = [c for c in chunks if c.content.strip()]
            assert len(content_chunks) > 0, "Should have at least one chunk with content"
            
            # Check that last chunk is marked as finished
            assert chunks[-1].finished, "Last chunk should be marked as finished"
            
            print(f"PASS Streaming test passed: received {len(chunks)} chunks")
            return True
            
        except Exception as e:
            print(f"FAIL Streaming test failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def test_stream_with_invalid_model(self):
        """Test streaming with invalid model name - should handle gracefully"""
        try:
            from services.chat.chat_service import ChatService
            from common.models import ChatStreamRequest, Message
            
            test_messages = [
                Message(
                    id="msg-1",
                    content="Test message",
                    sender="user",
                    time="2024-01-01T12:00:00Z"
                )
            ]
            
            request = ChatStreamRequest(
                messages=test_messages,
                model="invalid-model-name",
                temperature=0.7,
                maxTokens=1000
            )
            
            # Should still return chunks but with error message
            chunks = []
            for chunk in ChatService.stream_chat(request):
                chunks.append(chunk)
                # Limit chunks for error case
                if len(chunks) >= 3:
                    break
            
            assert len(chunks) > 0, "Should receive fallback chunks even with invalid model"
            print(f"PASS Invalid model test passed: received {len(chunks)} fallback chunks")
            return True
            
        except Exception as e:
            print(f"FAIL Invalid model test failed: {str(e)}")
            return False
    
    def test_stream_with_empty_messages(self):
        """Test streaming with empty message list"""
        try:
            from services.chat.chat_service import ChatService
            from common.models import ChatStreamRequest
            
            request = ChatStreamRequest(
                messages=[],
                model="glm-4"
            )
            
            chunks = []
            for chunk in ChatService.stream_chat(request):
                chunks.append(chunk)
                # Limit chunks
                if len(chunks) >= 3:
                    break
            
            assert len(chunks) > 0, "Should handle empty messages gracefully"
            print(f"PASS Empty messages test passed: received {len(chunks)} chunks")
            return True
            
        except Exception as e:
            print(f"FAIL Empty messages test failed: {str(e)}")
            return False


if __name__ == "__main__":
    test = TestChatServiceStreaming()
    
    print("Testing ChatService streaming functionality...")
    print("=" * 60)
    
    # Run all streaming tests
    tests = [
        ("Basic Streaming", test.test_chat_service_stream_output),
        ("Invalid Model Handling", test.test_stream_with_invalid_model),
        ("Empty Messages", test.test_stream_with_empty_messages)
    ]
    
    results = {}
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        results[test_name] = test_func()
    
    print("\n" + "=" * 60)
    print("Test Summary:")
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "PASS" if result else "FAIL"
        print(f"  {test_name}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\nPASS All ChatService streaming tests passed!")
        print("The streaming functionality is working correctly.")
    else:
        print("\nFAIL Some tests failed - check implementation.")
