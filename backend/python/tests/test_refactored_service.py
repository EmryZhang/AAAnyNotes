# -*- coding: utf-8 -*-
"""
Test refactored ChatService implementation.
Based on working tmp.py approach.
"""
import os
import sys
from typing import Generator

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

# Set test environment variables
os.environ['MOONSHOT_API_KEY'] = 'test-moonshot-api-key'
os.environ['DEBUG'] = 'true'

def test_refactored_chat_service():
    """Test the refactored ChatService"""
    try:
        from services.chat.chat_service import ChatService
        from common.models import ChatStreamRequest, Message
        
        # Create test request using the working format
        request = ChatStreamRequest(
            messages=[
                Message(
                    id="msg-1",
                    content="你好，我叫李雷，1+1等于多少？",
                    sender="user",
                    time="2024-01-01T12:00:00Z"
                )
            ],
            model="kimi",
            temperature=0.6,
            maxTokens=2000
        )
        
        print("="*60)
        print("Testing Refactored ChatService")
        print("="*60)
        
        # Test streaming
        chunks = []
        accumulated_content = ""
        
        for chunk in ChatService.stream_chat(request):
            chunks.append(chunk)
            if chunk.content:
                accumulated_content += chunk.content
                print(f"Chunk {len(chunks)}: '{chunk.content[:50]}...' - finished: {chunk.finished}")
            
            if chunk.finished or len(chunks) >= 10:
                break
        
        # Verify results
        print("="*60)
        print("Test Results:")
        print(f"  Chunks received: {len(chunks)}")
        print(f"  Total content length: {len(accumulated_content)}")
        print(f"  Last chunk finished: {chunks[-1].finished if chunks else 'N/A'}")
        
        if len(chunks) > 0 and chunks[-1].finished:
            print("  Status: PASSED")
            return True
        else:
            print("  Status: FAILED")
            return False
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_model_availability():
    """Test model availability checking"""
    try:
        from services.chat.chat_service import ChatService
        
        models = ChatService.get_available_models()
        print(f"Available models: {models}")
        return True
        
    except Exception as e:
        print(f"ERROR getting models: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing refactored ChatService...")
    
    tests = [
        ("Model Availability", test_model_availability),
        ("Chat Service Streaming", test_refactored_chat_service)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        results.append(test_func())
    
    print("\n" + "="*60)
    print("Summary:")
    passed = sum(results)
    total = len(results)
    
    for i, (test_name, result) in enumerate(zip([name for name, _ in tests], results)):
        status = "PASS" if result else "FAIL"
        print(f"  {test_name}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("Refactored ChatService working correctly!")
    else:
        print("Some tests failed - check implementation.")
