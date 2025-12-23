# -*- coding: utf-8 -*-
"""
OpenAI-compatible Kimi model usage examples and documentation.
Demonstrates how to use Kimi model with the same interface as OpenAI.
"""

# Example 1: Basic usage with ChatService
from services.chat.chat_service import ChatService
from common.models import ChatStreamRequest, Message

# Create chat request with Kimi model
messages = [
    Message(
        id="msg-1",
        content="Hello, how are you?",
        sender="user",
        time="2024-01-01T12:00:00Z"
    )
]

request = ChatStreamRequest(
    messages=messages,
    model="kimi",  # or "moonshot-v1-8k"
    temperature=0.7,
    maxTokens=2000
)

# Stream responses
for chunk in ChatService.stream_chat(request):
    print(chunk.content, end="")
    if chunk.finished:
        print("\nStream completed!")


# Example 2: Direct Kimi model usage
from models.glm_model import create_model

# Create Kimi model instance
kimi_model = create_model("kimi")

# Use the same OpenAI-compatible interface
for chunk in kimi_model.stream_chat(messages):
    print(chunk.content, end="")


# Example 3: Environment setup
# Add to your .env file:
# KIMI_API_KEY=your_kimi_api_key_here


# Example 4: API Configuration (like OpenAI)
"""
The Kimi model uses the exact same API format as OpenAI:

from openai import OpenAI  # This is how it would work with the actual SDK

client = OpenAI(
    api_key="your_kimi_api_key",
    base_url="https://api.moonshot.cn/v1/"
)

response = client.chat.completions.create(
    model="moonshot-v1-8k",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
"""


# Example 5: Available models
from services.chat.chat_service import ChatService

# Check available models
models = ChatService.get_available_models()
print("Available models:")
for model_name, has_config in models.items():
    status = "✅" if has_config else "❌"
    print(f"  {model_name}: {status}")
