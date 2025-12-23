# -*- coding: utf-8 -*-
"""
Official Kimi (Moonshot) model usage examples.
Following official documentation: https://platform.moonshot.cn/docs/guide/utilize-the-streaming-output-feature-of-kimi-api
"""

# Example 1: Basic usage following official Moonshot documentation
from services.chat.chat_service import ChatService
from common.models import ChatStreamRequest, Message

# Create chat request with Kimi model (following official example)
messages = [
    Message(
        id="msg-1",
        content="你好，我叫李雷，1+1等于多少？",
        sender="user",
        time="2024-01-01T12:00:00Z"
    )
]

request = ChatStreamRequest(
    messages=messages,
    model="kimi",  # or "kimi-k2-turbo-preview"
    temperature=0.6,  # Following official example
    maxTokens=2000
)

# Stream responses (following official streaming pattern)
print("Kimi response:", end=" ")
for chunk in ChatService.stream_chat(request):
    if chunk.content:
        print(chunk.content, end="")  # No newline for continuous text
    if chunk.finished:
        print("\n[Stream completed]")


# Example 2: Direct Kimi model usage
from models.glm_model import create_model

# Create Kimi model instance
kimi_model = create_model("kimi")

# Use official Moonshot API format
for chunk in kimi_model.stream_chat(messages):
    if chunk.content:
        print(chunk.content, end="")  # Continuous streaming output


# Example 3: Environment setup (following official docs)
# Add to your .env file:
# MOONSHOT_API_KEY=your_kimi_api_key_here


# Example 4: Official Moonshot SDK equivalent (for reference)
"""
The official way to use Moonshot API:

from openai import OpenAI

client = OpenAI(
    api_key="MOONSHOT_API_KEY",  # Replace with your API key
    base_url="https://api.moonshot.cn/v1"
)

stream = client.chat.completions.create(
    model="kimi-k2-turbo-preview",
    messages=[
        {
            "role": "system",
            "content": "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。"
        },
        {
            "role": "user",
            "content": "你好，我叫李雷，1+1等于多少？"
        }
    ],
    temperature=0.6,
    stream=True  # Enable streaming
)

# Process streaming response
for chunk in stream:
    delta = chunk.choices[0].delta
    if delta.content:
        print(delta.content, end="")  # Continuous output without newlines
"""


# Example 5: System message handling
# The Kimi model automatically adds system message when not present
# System message: "你是 Kimi，由 Moonshot AI 提供的人工智能助手..."

# Example 6: Available models and configuration
from services.chat.chat_service import ChatService

# Check available models
models = ChatService.get_available_models()
print("Available models:")
for model_name, has_config in models.items():
    status = "✅" if has_config else "❌"
    print(f"  {model_name}: {status}")

# Example 7: Model configuration details
from config.app_settings import KimiConfig

config = KimiConfig()
print(f"\nKimi Configuration:")
print(f"  Model: {config.model}")
print(f"  Base URL: {config.base_url}")
print(f"  Environment Variable: MOONSHOT_API_KEY")
print(f"  Default Temperature: 0.6")
print(f"  Timeout: {config.timeout}s")


# Example 8: Error handling
try:
    # This will fail without proper API key
    for chunk in ChatService.stream_chat(request):
        print(chunk.content, end="")
        if chunk.finished:
            break
except Exception as e:
    print(f"Error: {e}")
    # Handle gracefully with fallback response
