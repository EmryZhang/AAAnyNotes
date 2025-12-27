import { useState, useRef, useEffect } from "react";
import { message } from "antd";
import { sendChatStream, type ModelConfig } from "../../api/chat";
import { getModelsSync, getDefaultModelSync } from "../../services/modelService";
import type { Message, ChatStreamParams } from "../../types/chat";
import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css"; // 引入你喜欢的代码高亮样式

// ========== 类型定义 ==========
interface ExtendedModelConfig extends ModelConfig {
  supportThinkingMode: boolean;
  originalName: string;
}

interface ExtendedMessage extends Message {
  thinkingContent: string;
}

// ========== 子组件：美化后的动态思考动画 ==========
const ThinkingAnimation = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#667eea", padding: "8px 0" }}>
    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>Thinking</span>
    <div style={{ display: "flex", gap: 3 }}>
      <span className="dot-wave" style={{ animationDelay: "0s" }}></span>
      <span className="dot-wave" style={{ animationDelay: "0.2s" }}></span>
      <span className="dot-wave" style={{ animationDelay: "0.4s" }}></span>
    </div>
    <style>{`
      .dot-wave {
        width: 4px;
        height: 4px;
        background-color: #667eea;
        border-radius: 50%;
        display: inline-block;
        animation: wave 1.2s infinite ease-in-out both;
      }
      @keyframes wave {
        0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
        40% { transform: scale(1.5); opacity: 1; }
      }
    `}</style>
  </div>
);

// ========== 子组件：消息操作按钮组 (纯净版) ==========
const MessageActions = ({ content }: { content: string }) => {
  if (!content) return null;
  return (
    <div style={{
      marginTop: 8,
      paddingTop: 8,
      display: "flex",
      justifyContent: "flex-end", // 靠右对齐
      gap: 8,
      opacity: 0.7
    }}>
      <button
        onClick={() => { navigator.clipboard.writeText(content); message.success("已复制"); }}
        className="tool-btn"
        title="复制内容"
      >
        <span style={{ fontSize: 13 }}>📋</span>
      </button>
      <button
        onClick={() => message.info("重试功能开发中")}
        className="tool-btn"
        title="重新生成"
      >
        <span style={{ fontSize: 13 }}>🔄</span>
      </button>
      <style>{`
        .tool-btn { border: none; background: transparent; color: #999; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s; }
        .tool-btn:hover { background: rgba(0,0,0,0.05); color: #666; }
      `}</style>
    </div>
  );
};

// ========== 子组件：Markdown 渲染器 (修复居中问题 + 稳健渲染) ==========
const CustomMarkdownRenderer = ({ content }: { content: string }) => {
  const [html, setHtml] = useState("");

  useEffect(() => {
    // 1. 配置 marked
    marked.setOptions({
      breaks: true, // 支持回车换行
      gfm: true,    // 支持 GitHub 风格 Markdown
    });

    // 2. 使用新的 renderer API
    const renderer = new marked.Renderer();
    renderer.code = ({ text: code, lang: language }: { text: string; lang?: string }) => {
      const lang = language || 'plaintext';
      const highlighted = hljs.highlight(code, { language: lang }).value;
      return `<pre><code class="hljs ${lang}">${highlighted}</code></pre>`;
    };

    marked.use({ renderer });

    // 3. 解析并清洗
    const rawHtml = marked.parse(content || "");
    const cleanHtml = DOMPurify.sanitize(rawHtml as string);
    setHtml(cleanHtml);
  }, [content]);

  return (
    <div
      className="markdown-body"
      style={{
        fontSize: 14,
        lineHeight: 1.6,
        overflowWrap: "break-word",
        // ============ 核心修复开始 ============
        textAlign: "left",       // 1. 强制文字左对齐
        width: "100%",           // 2. 宽度撑满，防止 flex 居中
        maxWidth: "100%",        // 防止溢出
        // ============ 核心修复结束 ============
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
// ========== 主组件 ==========
export default function AiChat({
  visible: propVisible,
  onVisibleChange,
  modelsReady = false,
}: {
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  modelsReady?: boolean;
}) {
  // State
  const [inputContent, setInputContent] = useState("");
  const [visible, setVisible] = useState(propVisible ?? false);
  const [messages, setMessages] = useState<ExtendedMessage[]>([{
    id: "init", content: "你好！我是你的 AI 知识助手。", sender: "ai", time: "", thinkingContent: ""
  }]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [models, setModels] = useState<ExtendedModelConfig[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(false);
  // 记录每条消息的思考内容是否展开
  const [showThinkingMap, setShowThinkingMap] = useState<Record<string, boolean>>({});

  const controllerRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync Visibility
  useEffect(() => setVisible(propVisible ?? false), [propVisible]);

  // Scroll to bottom
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, visible, showThinkingMap]); // 当思考内容展开时也触发滚动

  // Load Models
  useEffect(() => {
    if (!modelsReady) return;
    try {
      const list = getModelsSync().map(m => {
        const isThinking = m.name.includes('(T)') || m.id.includes('thinking');
        return { ...m, supportThinkingMode: isThinking, originalName: isThinking ? m.name.replace(/\(T\)/g, '').trim() : m.name };
      });
      setModels(list);

      const defId = getDefaultModelSync();
      const defModel = list.find(m => m.id === defId) || list[0];
      if (defModel) {
        setSelectedModel(defModel.id);
        setIsThinkingEnabled(defModel.supportThinkingMode);
      }
    } catch (e) {
      console.error("Model load error", e);
    }
  }, [modelsReady]);

  // Model Selection Logic
  const currentModelConfig = models.find(m => m.id === selectedModel);
  const canThinking = currentModelConfig?.supportThinkingMode ?? false;

  useEffect(() => {
    if (!canThinking && isThinkingEnabled) {
      setIsThinkingEnabled(false);
      message.info("当前模型不支持思考模式，已自动关闭");
    }
  }, [selectedModel]);

  // Handlers
  const handleSend = async () => {
    const text = inputContent.trim();
    if (!text || isStreaming) return;

    const userMsg: ExtendedMessage = {
      id: Date.now().toString(), content: text, sender: "user", time: new Date().toLocaleTimeString(), thinkingContent: ""
    };
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ExtendedMessage = {
      id: aiMsgId, content: "", sender: "ai", time: "", thinkingContent: ""
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputContent("");
    setVisible(true);
    setIsStreaming(true);

    // 默认行为：如果是思考模式，默认展开思考过程以便用户看到动态
    // 如果想要默认折叠，改为 false 即可
    setShowThinkingMap(prev => ({ ...prev, [aiMsgId]: true }));

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      await sendChatStream(
        {
          messages: [...messages, userMsg].map(m => ({ id: m.id, content: m.content, sender: m.sender, time: m.time })),
          model: selectedModel,
          thinkingMode: isThinkingEnabled,
        },
        controller.signal,
        (chunk: string, finished: boolean) => {
          let data = { type: 'content', content: chunk };
          try { data = JSON.parse(chunk); } catch { }

          setMessages(prev => prev.map(m => {
            if (m.id !== aiMsgId) return m;

            // 处理思考内容
            if (data.type === 'thinking' && isThinkingEnabled) {
              return { ...m, thinkingContent: m.thinkingContent + (data.content || "") };
            }
            // 处理正文内容 (type为content 或 无type兼容旧版)
            if (data.type === 'content' || !data.type) {
              return { ...m, content: m.content + (data.content || "") };
            }
            return m;
          }));

          if (finished) setIsStreaming(false);
        },
        (err) => {
          console.error(err);
          setIsStreaming(false);
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: `Error: ${err.message}` } : m));
        },
        () => setIsStreaming(false)
      );
    } catch (err) {
      setIsStreaming(false);
    }
  };

  const handleStop = () => {
    controllerRef.current?.abort();
    setIsStreaming(false);
  };

  const renderThinkingSwitch = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: 20 }}>
      <span style={{ fontSize: 12, color: "white", fontWeight: 500 }}>深度思考</span>
      <button
        onClick={() => setIsThinkingEnabled(!isThinkingEnabled)}
        disabled={!canThinking || isStreaming}
        style={{
          width: 36, height: 20, borderRadius: 10, border: "none",
          backgroundColor: isThinkingEnabled ? "#4cd964" : "#rgba(0,0,0,0.3)",
          background: isThinkingEnabled ? "#52c41a" : "#888",
          position: "relative", cursor: canThinking && !isStreaming ? "pointer" : "not-allowed",
          transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
          padding: 0
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: "50%", background: "white",
          position: "absolute", top: 2, left: isThinkingEnabled ? 18 : 2, transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
        }} />
      </button>
    </div>
  );


  <style>{`
  /* 旋转动画 */
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .thinking-spin {
    animation: spin 2s linear infinite;
    display: inline-block;
  }

  /* 淡入动画 */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* 光标闪烁 */
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  .cursor-blink {
    animation: blink 1s infinite;
    color: #667eea;
    font-weight: bold;
    margin-left: 2px;
  }
`}</style>
  return (
    <>
      {/* 悬浮打开按钮 (固定在右下角) */}
      {!visible && (
        <button
          onClick={() => { setVisible(true); onVisibleChange?.(true); }}
          style={{
            position: "fixed", bottom: 30, right: 30, width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none",
            fontSize: 28, boxShadow: "0 6px 20px rgba(118, 75, 162, 0.4)", cursor: "pointer", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s"
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          🤖
        </button>
      )}

      {/* 聊天主窗口 (居中显示，80vw * 80vh) */}
      {visible && (
        <>
          {/* 遮罩层 (可选，增加聚焦感) */}
          <div
            style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 999 }}
            onClick={() => { setVisible(false); onVisibleChange?.(false); }}
          />

          <div style={{
            position: "fixed",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", // 绝对居中
            width: "80vw",
            height: "80vh",
            backgroundColor: "white",
            borderRadius: 16,
            boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
            animation: "popIn 0.3s ease-out"
          }}>
            <style>{`@keyframes popIn { from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }`}</style>

            {/* Header */}
            <div style={{
              padding: "15px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>✨</span>
                <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: 0.5 }}>AI Assistant</span>
              </div>

              <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                {renderThinkingSwitch()}

                <div style={{ position: "relative" }}>
                  <select
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    disabled={isStreaming}
                    style={{
                      padding: "6px 30px 6px 12px",
                      borderRadius: 20,
                      border: "none",
                      fontSize: 13,
                      appearance: "none",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 500,
                      outline: "none"
                    }}
                  >
                    {models.map(m => <option key={m.id} value={m.id} style={{ color: "#333" }}>{m.originalName}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10 }}>▼</span>
                </div>

                <button
                  onClick={() => { setVisible(false); onVisibleChange?.(false); }}
                  style={{
                    background: "rgba(255,255,255,0.2)", border: "none",
                    width: 32, height: 32, borderRadius: "50%",
                    color: "white", cursor: "pointer", fontSize: 16,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: "24px 40px", // 增加内边距
              overflowY: "auto",
              background: "#f9fafb",
              display: "flex",
              flexDirection: "column",
              gap: 24
            }}>

              {messages.map((msg) => {
                const isAi = msg.sender === "ai";
                const isThinking = isThinkingEnabled && !!msg.thinkingContent;
                // 当前消息是否正在流式传输（用于判断是否显示转圈动画）
                // 判断逻辑：是最后一条消息 + 正在流式传输 + 是 AI 发的
                const isMsgStreaming = isStreaming && msg.id === messages[messages.length - 1].id;
                const showThinking = showThinkingMap[msg.id];

                return (
                  <div key={msg.id} style={{ alignSelf: isAi ? "flex-start" : "flex-end", maxWidth: "85%", minWidth: "200px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: isAi ? "flex-start" : "flex-end" }}>

                      {/* 气泡本体 */}
                      <div style={{
                        padding: "16px 20px",
                        borderRadius: 16,
                        borderTopLeftRadius: isAi ? 4 : 16,
                        borderTopRightRadius: isAi ? 16 : 4,
                        background: isAi ? "white" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: isAi ? "#2d3748" : "white",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        width: isAi ? "60vw" : "auto",
                        textAlign: "left", // 确保左对齐
                        position: "relative"
                      }}>

                        {/* ==================== 新增：顶部思考块 ==================== */}
                        {isAi && isThinking && (
                          <div style={{ marginBottom: 12 }}>
                            {/* 思考块 Header (可点击折叠) */}
                            <div
                              onClick={() => setShowThinkingMap(p => ({ ...p, [msg.id]: !p[msg.id] }))}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: "#f0f2f5", // 浅灰背景，区分正文
                                padding: "8px 12px",
                                borderRadius: 8,
                                cursor: "pointer",
                                userSelect: "none",
                                marginBottom: showThinking ? 8 : 0, // 展开时留出下边距
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "#e6e8eb"}
                              onMouseLeave={e => e.currentTarget.style.background = "#f0f2f5"}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {/* 动画图标：正在思考时旋转，否则静止 */}
                                <span className={isMsgStreaming ? "thinking-spin" : ""} style={{ fontSize: 16, display: "flex" }}>
                                  {isMsgStreaming ? "⏳" : "🧠"}
                                </span>

                                <span style={{ fontSize: 13, fontWeight: 600, color: "#666" }}>
                                  {isMsgStreaming ? "正在深度思考..." : "思考过程"}
                                </span>
                              </div>

                              {/* 折叠箭头 */}
                              <span style={{
                                fontSize: 12,
                                color: "#999",
                                transform: showThinking ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.3s"
                              }}>
                                ▼
                              </span>
                            </div>

                            {/* 思考内容区域 (展开/收起) */}
                            {showThinking && (
                              <div style={{
                                padding: "10px 14px",
                                background: "rgba(0,0,0,0.02)", // 极淡的背景
                                borderLeft: "2px solid #e0e0e0",
                                borderRadius: "0 0 8px 8px", // 仅底部圆角
                                marginLeft: 4, // 缩进一点产生层次感
                                animation: "fadeIn 0.3s ease-in-out"
                              }}>
                                <div style={{ fontSize: 13, color: "#555" }}>
                                  <CustomMarkdownRenderer content={msg.thinkingContent} />
                                </div>
                                {/* 如果正在流式输出思考，在内容末尾加个光标动画 */}
                                {isMsgStreaming && !msg.content && (
                                  <span className="cursor-blink">|</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {/* ==================== 思考块结束 ==================== */}

                        {/* 正文内容区域 */}
                        {isAi ? (
                          <>
                            {/* 如果正在思考且没正文，显示加载状态 */}
                            {isThinking && !msg.content && isMsgStreaming && !showThinking ? (
                              <div style={{ color: "#999", fontSize: 13, fontStyle: "italic", padding: "4px 0" }}>
                                生成回答中...
                              </div>
                            ) : (
                              <div style={{ minHeight: 20 }}>
                                <CustomMarkdownRenderer content={msg.content || (isStreaming ? "" : "...")} />
                              </div>
                            )}

                            {/* 底部操作栏 (去掉了思考按钮) */}
                            <MessageActions content={msg.content} />
                          </>
                        ) : (
                          // 用户消息
                          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{msg.content}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Input Area (Footer) */}
            <div style={{
              padding: "20px 30px",
              background: "white",
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              gap: 16,
              alignItems: "center"
            }}>
              <input
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="输入您的问题..."
                disabled={isStreaming}
                style={{
                  flex: 1,
                  padding: "14px 20px",
                  borderRadius: 24,
                  border: "1px solid #e0e0e0",
                  outline: "none",
                  fontSize: 15,
                  backgroundColor: "#f9fafb",
                  transition: "all 0.2s"
                }}
                onFocus={e => (e.target.style.background = "white", e.target.style.borderColor = "#667eea", e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)")}
                onBlur={e => (e.target.style.background = "#f9fafb", e.target.style.borderColor = "#e0e0e0", e.target.style.boxShadow = "none")}
              />

              <button
                onClick={isStreaming ? handleStop : handleSend}
                disabled={!isStreaming && !inputContent.trim()}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: "none",
                  background: isStreaming
                    ? "#ff4d4f"
                    : (!inputContent.trim() ? "#d9d9d9" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"),
                  color: "white",
                  cursor: (!isStreaming && !inputContent.trim()) ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", // 核心：强制居中
                  fontSize: 20,
                  padding: 0, // 核心：去除 padding 确保图标居中
                  boxShadow: (!isStreaming && !inputContent.trim()) ? "none" : "0 4px 12px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.2s"
                }}
              >
                {isStreaming ? (
                  <span style={{ display: "block", width: 14, height: 14, background: "white", borderRadius: 2 }}></span>
                ) : (
                  // 微调三角形位置使其视觉居中
                  <span style={{ marginLeft: 3 }}>➤</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}