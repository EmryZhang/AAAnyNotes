# -*- coding: utf-8 -*-
import os
import sys
from typing import Generator
from dotenv import load_dotenv

load_dotenv()

def test_kimi_official_streaming(msg: str) -> bool:
    """Test Kimi streaming using official Moonshot SDK via KimiModel"""
    try:
        # 直接从你的 kimi_model.py 导入
        from models.kimi_model import KimiModel
        
        # 创建模型实例（自动加载配置）
        model = KimiModel()
        
        # 准备消息（使用字典即可，更简洁）
        messages = [
            {"sender": "user", "content": msg}
        ]
        
        # 收集流式输出
        chunks = []
        accumulated_content = ""
        
        print(f"\n{'='*60}")
        print(f"测试消息: {msg}")
        print(f"{'='*60}\n")
        
        # 直接调用 KimiModel 的流式接口
        for i, chunk in enumerate(model.stream_chat(
            messages=messages,
            temperature=0.6,
            maxTokens=2000
        )):
            chunks.append(chunk)
            
            # 实时打印每个 chunk
            if chunk.content:
                accumulated_content += chunk.content
                print(f"Chunk {i+1:3d}: {repr(chunk.content[:50])}")
            
            # 安全保护：防止异常情况下 chunk 过多
            if i > 1000:
                print("⚠️  警告：chunk 数量超过限制，强制终止")
                break
            
            # 当收到 finished=True 时结束
            if chunk.finished:
                print(f"\n📦 收到终止信号 (finished=True)")
                break
        
        # ===== 验证测试结果 =====
        print(f"\n{'='*60}")
        print("验证测试结果...")
        
        # 1. 验证 chunk 数量
        assert len(chunks) > 0, "❌ 失败：没有收到任何 chunk"
        print(f"✅ 收到 {len(chunks)} 个 chunks")
        
        # 2. 验证 chunk 结构
        for idx, chunk in enumerate(chunks):
            assert hasattr(chunk, 'content'), f"❌ 失败：Chunk {idx} 缺少 'content' 属性"
            assert hasattr(chunk, 'finished'), f"❌ 失败：Chunk {idx} 缺少 'finished' 属性"
            assert isinstance(chunk.content, str), f"❌ 失败：Chunk {idx} content 不是字符串"
            assert isinstance(chunk.finished, bool), f"❌ 失败：Chunk {idx} finished 不是布尔值"
        
        # 3. 验证最后一个 chunk
        last_chunk = chunks[-1]
        assert last_chunk.finished is True, "❌ 失败：最后一个 chunk 的 finished 应为 True"
        print("✅ 最后一个 chunk 正确标记为 finished=True")
        
        # 4. 验证内容不为空
        assert len(accumulated_content.strip()) > 0, "❌ 失败：累计内容为空"
        print(f"✅ 累计收到 {len(accumulated_content)} 字符")
        
        # 5. 打印完整回答预览
        print(f"\n📄 完整回答预览:")
        print(f"{'-'*60}")
        print(accumulated_content[:200] + "..." if len(accumulated_content) > 200 else accumulated_content)
        print(f"{'-'*60}")
        
        print(f"\n🎉 测试通过！")
        return True
        
    except Exception as e:
        print(f"\n❌ 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    # 测试用例
    test_cases = [
        "你好，我叫李雷，1+1等于多少？",
        "讲一个简短的笑话",
        "用Python写一个快速排序函数"
    ]
    
    # 确保 API Key 已设置
    if not os.getenv("MOONSHOT_API_KEY"):
        print("❌ 错误：请先设置 MOONSHOT_API_KEY 环境变量")
        sys.exit(1)
    
    # 运行所有测试
    results = []
    for msg in test_cases:
        results.append(test_kimi_official_streaming(msg))
        print("\n" + "="*60 + "\n")
    
    # 总结
    passed = sum(results)
    total = len(results)
    print(f"测试完成: {passed}/{total} 通过")
    
    if passed == total:
        print("🎉 所有测试通过！")
        sys.exit(0)
    else:
        print("❌ 部分测试失败")
        sys.exit(1)