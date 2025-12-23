import os
import openai
from typing import Optional

from test_util import load_env
load_env()
api_key = os.getenv("MOONSHOT_API_KEY")

# 校验API Key
if not api_key:
    raise ValueError("错误：未找到MOONSHOT_API_KEY，请配置环境变量！")
print(f"✅ API Key加载成功（前8位）：{api_key[:8]}****")

# 初始化OpenAI兼容客户端（指向Moonshot API）
client = openai.Client(
    base_url="https://api.moonshot.cn/v1",
    api_key=api_key,
)

def test_kimi_thinking_mode(
    user_prompt: str = "请详细解释1+1=2的数学原理，包括皮亚诺公理的推导过程",
    model: str = "kimi-k2-thinking",  # 官方支持思考模式的核心模型
    temperature: float = 0.3,  # 低随机性，强化思考严谨性
    max_tokens: int = 32768
) -> None:
    print("\n========== 开始调用Kimi思考模式 ==========")
    print(f"📝 提问：{user_prompt}")
    print(f"🔧 模型：{model} | 温度：{temperature}")
    print("------------------------------------------")

    # 构造请求参数（核心：enable_reasoning=True 开启思考模式）
    try:
        stream = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "你是Kimi，开启深度思考模式，回答问题时先输出思考过程（reasoning），再输出最终答案。",
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )
    except Exception as e:
        print(f"❌ API调用失败：{str(e)}")
        return

    # 状态变量：标记思考过程/回答的状态
    is_thinking = False  # 是否正在输出思考过程
    thinking_content: str = ""  # 累计思考内容
    final_content: str = ""     # 累计最终回答

    # 流式处理响应
    for chunk in stream:
        if not chunk.choices:
            continue  # 跳过空chunk

        choice = chunk.choices[0]
        delta = choice.delta

        # 1. 处理思考过程（reasoning_content）
        reasoning_content: Optional[str] = getattr(delta, "reasoning_content", None)
        if reasoning_content and reasoning_content.strip():
            if not is_thinking:
                is_thinking = True
                print("\n🔍 [思考过程开始] ======================")
            thinking_content += reasoning_content
            print(reasoning_content, end="", flush=True)  # flush=True实时打印

        # 2. 处理最终回答（content）
        content: Optional[str] = getattr(delta, "content", None)
        if content and content.strip():
            if is_thinking:
                is_thinking = False
                print("\n\n✅ [思考过程结束] ======================")
                print("\n📖 [最终回答开始] ======================")
            final_content += content
            print(content, end="", flush=True)

        # 3. 处理流结束（finish_reason非空）
        if choice.finish_reason:
            print(f"\n\n📌 流结束原因：{choice.finish_reason}")
            break

    # 兜底：如果没有思考过程
    if not thinking_content:
        print("\n⚠️  未捕获到思考过程（reasoning_content），可能原因：")
        print("   1. 模型不支持思考模式（请确认模型为kimi-k2/kimi-pro）；")
        print("   2. 问题过于简单，无需深度思考；")
        print("   3. API参数enable_reasoning未开启；")

    # 打印汇总
    print("\n\n========== 调用汇总 ==========")
    print(f"思考过程总长度：{len(thinking_content)} 字符")
    print(f"最终回答总长度：{len(final_content)} 字符")
    print("==============================")

# 执行测试
if __name__ == "__main__":
    # 测试用例1：数学推导（强依赖思考模式）
    user_input = input("请输入需要Kimi深度思考的问题（如数学推导、逻辑分析等）：\n")
    test_kimi_thinking_mode(
        user_prompt=user_input,
        model="kimi-k2-thinking",
        temperature=0.3
    )

    # 可选：测试用例2（简单问题，可能无思考过程）
    # test_kimi_thinking_mode(
    #     user_prompt="你好，介绍一下自己",
    #     model="kimi-k2",
    #     temperature=0.3
    # )