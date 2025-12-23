from zai import ZhipuAiClient

# 初始化客户端
client = ZhipuAiClient(api_key='')

# 创建流式工具调用请求
response = client.chat.completions.create(
    model="glm-4.6",  # 使用支持工具调用的模型
    messages=[
        {"role": "user", "content": "北京天气怎么样"},
    ],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "获取指定地点当前的天气情况",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string", "description": "城市，例如：北京、上海"},
                        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                    },
                    "required": ["location"]
                }
            }
        }
    ],
    stream=True,        # 启用流式输出
    tool_stream=True    # 启用工具调用流式输出
)

# 初始化变量用于收集流式数据
reasoning_content = ""      # 推理过程内容
content = ""               # 回答内容
final_tool_calls = {}      # 工具调用信息
reasoning_started = False  # 推理过程开始标志
content_started = False    # 内容输出开始标志

# 处理流式响应
for chunk in response:
    if not chunk.choices:
        continue

    delta = chunk.choices[0].delta

    # 处理流式推理过程输出
    if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
        if not reasoning_started and delta.reasoning_content.strip():
            print("\n🧠 思考过程：")
            reasoning_started = True
        reasoning_content += delta.reasoning_content
        print(delta.reasoning_content, end="", flush=True)

    # 处理流式回答内容输出
    if hasattr(delta, 'content') and delta.content:
        if not content_started and delta.content.strip():
            print("\n\n💬 回答内容：")
            content_started = True
        content += delta.content
        print(delta.content, end="", flush=True)

    # 处理流式工具调用信息
    if delta.tool_calls:
        for tool_call in delta.tool_calls:
            index = tool_call.index
            if index not in final_tool_calls:
                # 新的工具调用
                final_tool_calls[index] = tool_call
                final_tool_calls[index].function.arguments = tool_call.function.arguments
            else:
                # 追加工具调用参数（流式构建）
                final_tool_calls[index].function.arguments += tool_call.function.arguments

# 输出最终的工具调用信息
if final_tool_calls:
    print("\n📋 命中 Function Calls :")
    for index, tool_call in final_tool_calls.items():
        print(f"  {index}: 函数名: {tool_call.function.name}, 参数: {tool_call.function.arguments}")