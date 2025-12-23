import { useState, useRef, useEffect } from "react";
import { message } from "antd";
import { sendChatStream } from "../../api/chat";
import { getModelsSync, getDefaultModelSync } from "../../services/modelService";
import type { Message, ChatStreamParams } from "../../types/chat";
import type { ModelConfig } from "../../api/chat";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

// ========== 思考动画组件（原有） ==========
const ThinkingAnimation = () => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#667eea" }}>
      <span className="thinking-text" style={{ fontSize: 14, fontWeight: 500 }}>Thinking</span>
      <span className="dots" style={{ display: "flex", gap: 2 }}>
        <span style={{ animation: "dot-flash 1s infinite 0.2s" }}>.</span>
        <span style={{ animation: "dot-flash 1s infinite 0.4s" }}>.</span>
        <span style={{ animation: "dot-flash 1s infinite 0.6s" }}>.</span>
      </span>
      <style>
        {`
          @keyframes dot-flash {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
          .thinking-text {
            position: relative;
            overflow: hidden;
            white-space: nowrap;
            animation: typing 2s steps(6) infinite alternate;
          }
          @keyframes typing {
            0% { width: 0; }
            100% { width: 50px; }
          }
        `}
      </style>
    </div>
  );
};

// ========== 自定义Markdown渲染（原有） ==========
const CustomMarkdownRenderer = ({ content }: { content: string }) => {
  const processedContent = content
    .split('\n').filter(line => line.trim() !== '').join('\n');
  return (
    <div style={{
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      lineHeight: 1,
      lineBreak: "strict"
    }}>
      <ReactMarkdown
        remarkPlugins={[]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).trim();
            const isInlineCode = inline || !className?.includes('language-') || codeContent.length < 50;

            if (isInlineCode) {
              return (
                <code
                  style={{
                    backgroundColor: "#f0f0f0",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: 13,
                    color: "#ac59feff",
                    whiteSpace: "pre-wrap",
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div style={{ marginTop: 8, marginBottom: 8, borderRadius: 8, overflow: "hidden" }}>
                <SyntaxHighlighter
                  language={match ? match[1] : "python"}
                  style={dracula}
                  PreTag="div"
                  customStyle={{
                    fontSize: 13,
                    lineHeight: 1,
                    padding: 16,
                    borderRadius: 8,
                    overflowX: "auto",
                    backgroundColor: "#282a36",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                  children={String(children).replace(/\\n/g, "\n").replace(/\n$/, "")}
                  {...props}
                />
              </div>
            );
          },
          p: ({ children }) => <p style={{ margin: "4px 0", lineHeight: 1 }}>{children}</p>,
          ul: ({ children }) => <ul style={{ margin: "4px 0", paddingLeft: 24, lineHeight: 1 }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ margin: "4px 0", paddingLeft: 24, lineHeight: 1 }}>{children}</ol>,
          li: ({ children }) => <li style={{ margin: "2px 0", lineHeight: 1 }}>{children}</li>,
          h1: ({ children }) => <h1 style={{ fontSize: 18, margin: "8px 0", fontWeight: "bold" }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: 16, margin: "8px 0", fontWeight: "bold" }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: 15, margin: "8px 0", fontWeight: "bold" }}>{children}</h3>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#1890ff", textDecoration: "underline" }}>
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote style={{
              margin: "8px 0",
              padding: "8px 12px",
              borderLeft: "3px solid #1890ff",
              backgroundColor: "#f5f5f5",
              borderRadius: "0 4px 4px 0",
              lineHeight: 1,
            }}>
              {children}
            </blockquote>
          ),
          hr: () => <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "12px 0" }} />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

// ========== 扩展ModelConfig：标记是否支持思考模式 ==========
interface ExtendedModelConfig extends ModelConfig {
  supportThinkingMode: boolean; // 是否支持思考模式（名称带(T)）
  originalName: string; // 原始名称（去除(T)）
}

// ========== 扩展Message类型：新增思考内容字段 ==========
interface ExtendedMessage extends Message {
  thinkingContent: string; // 独立存储思考内容
}

// ========== 辅助函数：解析模型是否支持思考模式 ==========
const parseModelSupportThinking = (model: ModelConfig): ExtendedModelConfig => {
  const name = model.name || model.id;
  const supportThinkingMode = name.includes('(T)');
  // 去除名称中的(T)，优化显示
  const originalName = supportThinkingMode ? name.replace(/\s*\(T\)\s*$/, '') : name;

  return {
    ...model,
    supportThinkingMode,
    originalName
  };
};

export default function AiChat({
  visible: propVisible,
  onVisibleChange,
  modelsReady = false,
}: {
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  modelsReady?: boolean;
}) {
  // ========== 状态管理（核心修改：新增思考模式相关状态） ==========
  const [inputContent, setInputContent] = useState("");
  const [visible, setVisible] = useState(propVisible ?? false);
  // 扩展Message，新增thinkingContent字段存储思考内容
  const [messages, setMessages] = useState<ExtendedMessage[]>([
    {
      id: "init-ai-msg",
      content: "Hello! I am your AI assistant for knowledge garden.",
      sender: "ai",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      thinkingContent: "", // 初始思考内容为空
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  // 扩展模型配置，标记是否支持思考模式
  const [models, setModels] = useState<ExtendedModelConfig[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [modelsLoading, setModelsLoading] = useState(true);
  // 核心：思考模式开关状态
  const [isThinkingModeEnabled, setIsThinkingModeEnabled] = useState(false);
  // 当前选中模型是否支持思考模式
  const [isThinkingModeAvailable, setIsThinkingModeAvailable] = useState(false);
  // 核心：每个消息独立控制「是否显示思考内容」（永久生效）
  const [showThinkingText, setShowThinkingText] = useState<Record<string, boolean>>({});
  const [currentAiMsgId, setCurrentAiMsgId] = useState<string>("");

  // ========== 引用管理（原有） ==========
  const controllerRef = useRef<AbortController | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // ========== 副作用处理（核心修改：模型解析+思考模式联动） ==========
  useEffect(() => {
    setVisible(propVisible ?? false);
  }, [propVisible]);

  useEffect(() => {
    if (modelsReady) {
      const loadModels = () => {
        try {
          setModelsLoading(true);
          const availableModels = getModelsSync();
          const defaultModel = getDefaultModelSync();

          // 解析模型，标记是否支持思考模式
          const parsedModels = availableModels.map(parseModelSupportThinking);
          setModels(parsedModels);

          // 设置默认模型
          if (defaultModel) {
            setSelectedModel(defaultModel);
            // 初始化默认模型的思考模式支持状态
            const defaultModelConfig = parsedModels.find(m => m.id === defaultModel);
            setIsThinkingModeAvailable(defaultModelConfig?.supportThinkingMode ?? false);
            // 非支持模型强制关闭思考模式
            if (!defaultModelConfig?.supportThinkingMode) {
              setIsThinkingModeEnabled(false);
            }
          } else if (parsedModels.length > 0) {
            setSelectedModel(parsedModels[0].id);
            setIsThinkingModeAvailable(parsedModels[0].supportThinkingMode);
            if (!parsedModels[0].supportThinkingMode) {
              setIsThinkingModeEnabled(false);
            }
          }
        } catch (error) {
          console.error("Failed to load models:", error);
          message.error("Failed to load AI models, please try again later");
        } finally {
          setModelsLoading(false);
        }
      };
      loadModels();
    }
  }, [modelsReady]);

  // 核心：切换模型时更新思考模式支持状态
  useEffect(() => {
    if (selectedModel && models.length > 0) {
      const selectedModelConfig = models.find(m => m.id === selectedModel);
      const supportThinking = selectedModelConfig?.supportThinkingMode ?? false;
      setIsThinkingModeAvailable(supportThinking);

      // 非支持模型强制关闭思考模式
      if (!supportThinking && isThinkingModeEnabled) {
        setIsThinkingModeEnabled(false);
        message.info("当前模型不支持思考模式，已自动关闭");
      }
    }
  }, [selectedModel, models]);

  useEffect(() => {
    if (visible && chatRef.current) {
      const scrollable = chatRef.current.querySelector(".chat-content") as HTMLDivElement;
      if (scrollable) {
        scrollable.scrollTo({
          top: scrollable.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [visible, messages]);

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, []);

  // ========== 核心方法（修改：添加思考模式参数+控制思考内容处理） ==========
  const toggleChat = () => {
    const newVisible = !visible;
    setVisible(newVisible);
    onVisibleChange?.(newVisible);
  };

  // 解析后端封装的JSON数据（兼容方案）
  const parseChunkData = (content: string) => {
    try {
      return JSON.parse(content);
    } catch (e) {
      // 兼容旧数据（无封装）
      return { content, type: "content", finished: false };
    }
  };

  const handleSend = async () => {
    const trimmedContent = inputContent.trim();
    if (!trimmedContent || isStreaming) return;

    // 1. 添加用户消息
    const userMsg: ExtendedMessage = {
      id: Date.now().toString(),
      content: trimmedContent,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      thinkingContent: "",
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputContent("");
    setVisible(true);

    // 2. 创建AI消息占位符（新增thinkingContent字段）
    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholder: ExtendedMessage = {
      id: aiMsgId,
      content: "",
      sender: "ai",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      thinkingContent: "", // 初始思考内容为空
    };
    // 初始状态：隐藏思考内容（显示动画）
    setShowThinkingText(prev => ({ ...prev, [aiMsgId]: false }));
    setMessages([...newMessages, aiPlaceholder]);
    setIsStreaming(true);
    setCurrentAiMsgId(aiMsgId);

    // 3. 构建请求参数（核心：添加enableReasoning参数）
    const params: ChatStreamParams = {
      messages: newMessages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        time: msg.time,
        sender: msg.sender,
      })),
      model: selectedModel,
      thinkingMode: isThinkingModeEnabled,
    };

    // 4. 发起流式请求
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      await sendChatStream(
        params,
        controller.signal,
        // 核心修改：仅开启思考模式时处理思考内容
        (content: string, finished: boolean) => {
          // 解析后端封装的数据
          const chunkData = parseChunkData(content);
          const { content: realContent, type, finished: chunkFinished } = chunkData;

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== aiMsgId) return msg;

              // 仅开启思考模式且类型为thinking时，才存储思考内容
              if (type === "thinking" && realContent && isThinkingModeEnabled) {
                return { ...msg, thinkingContent: msg.thinkingContent + realContent };
              } else if (type === "content" && realContent) {
                return { ...msg, content: msg.content + realContent };
              }
              // 错误类型
              else if (type === "error") {
                return { ...msg, content: realContent };
              }
              return msg;
            })
          );

          // 流式结束
          if (chunkFinished) {
            setIsStreaming(false);
            setCurrentAiMsgId("");
            controllerRef.current = null;
          }
        },
        (error: Error) => {
          console.error("Streaming error:", error);
          setIsStreaming(false);
          setCurrentAiMsgId("");
          controllerRef.current = null;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId
                ? { ...msg, content: `Error: ${error.message || "Unknown error"}`, thinkingContent: "" }
                : msg
            )
          );
          message.error(`Failed to get AI response: ${error.message}`);
        },
        () => {
          setIsStreaming(false);
          setCurrentAiMsgId("");
          controllerRef.current = null;
          message.success("AI response completed");
        }
      );
    } catch (error) {
      const err = error as Error;
      console.error("Send message failed:", err);
      setIsStreaming(false);
      setCurrentAiMsgId("");
      controllerRef.current = null;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? { ...msg, content: `Error: ${err.message || "Request failed"}`, thinkingContent: "" }
            : msg
        )
      );
    }
  };

  // ========== 核心：切换思考内容显示/隐藏（永久生效） ==========
  const toggleThinkingText = (msgId: string) => {
    setShowThinkingText(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  // ========== 核心：切换思考模式开关 ==========
  const toggleThinkingMode = () => {
    if (!isThinkingModeAvailable) return; // 非支持模型不允许切换
    setIsThinkingModeEnabled(prev => !prev);
    message.info(`已${!isThinkingModeEnabled ? "开启" : "关闭"}思考模式`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAbort = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setIsStreaming(false);
    setCurrentAiMsgId("");
    message.info("AI response cancelled");
  };

  const renderBottomButton = () => {
    if (isStreaming) {
      return (
        <button
          onClick={handleAbort}
          style={{
            width: 20,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: "#1890ff",
            color: "white",
            cursor: "pointer",
            fontSize: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.4)",
            transition: "all 0.3s ease",
            marginRight: 10,
            marginLeft: "1vw",
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#40a9ff"}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#1890ff"}
          disabled={!isStreaming}
        >
          ⏹
        </button>
      );
    } else {
      return (
        <button
          onClick={handleSend}
          style={{
            width: 20,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: "#1890ff",
            color: "white",
            cursor: "pointer",
            fontSize: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.4)",
            transition: "all 0.3s ease",
            marginRight: 10,
            marginLeft: "1vw",
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#40a9ff"}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#1890ff"}
          disabled={!inputContent.trim()}
        >
          ➤
        </button>
      );
    }
  };

  // ========== 渲染UI（核心修改：添加思考模式开关+控制显示） ==========
  return (
    <>
      {!visible && (
        <button
          onClick={toggleChat}
          style={{
            position: "fixed",
            bottom: 30,
            right: 30,
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            cursor: "pointer",
            fontSize: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.4)",
            transition: "all 0.3s ease",
            zIndex: 1000,
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(1.1)";
            (e.target as HTMLButtonElement).style.boxShadow = "0 6px 16px rgba(24, 144, 255, 0.5)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(1)";
            (e.target as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(24, 144, 255, 0.4)";
          }}
        >
          🤖
        </button>
      )}

      {visible && (
        <div
          ref={chatRef}
          style={{
            position: "fixed",
            bottom: 30,
            right: 30,
            width: "90vw",
            height: "80vh",
            backgroundColor: "white",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "15px 20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: "bold" }}>AI Assistant</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* ========== 核心新增：思考模式开关按钮 ========== */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, opacity: isThinkingModeAvailable ? 1 : 0.5 }}>思考模式</span>
                <button
                  onClick={toggleThinkingMode}
                  disabled={!isThinkingModeAvailable || isStreaming}
                  style={{
                    width: 40,
                    height: 20,
                    borderRadius: 10,
                    border: "none",
                    backgroundColor: isThinkingModeAvailable
                      ? (isThinkingModeEnabled ? "#40a9ff" : "#ccc")
                      : "#666",
                    position: "relative",
                    cursor: isThinkingModeAvailable && !isStreaming ? "pointer" : "not-allowed",
                    transition: "background-color 0.3s ease",
                    opacity: isStreaming ? 0.7 : 1,
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: "white",
                      position: "absolute",
                      top: 2,
                      left: isThinkingModeEnabled ? 22 : 2,
                      transition: "left 0.3s ease",
                    }}
                  />
                </button>
              </div>

              {/* ========== 模型选择框（优化显示：去除(T)） ========== */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={modelsLoading || models.length === 0 || isStreaming}
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: "none",
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: 12,
                  cursor: modelsLoading ? "not-allowed" : "pointer",
                }}
              >
                {modelsLoading ? (
                  <option value="">Loading models...</option>
                ) : models.length === 0 ? (
                  <option value="">No models available</option>
                ) : (
                  models.map((model) => (
                    <option key={model.id} value={model.id} style={{ color: "#333" }}>
                      {model.originalName} {/* 显示去除(T)后的名称 */}
                    </option>
                  ))
                )}
              </select>

              <button
                onClick={toggleChat}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div
            className="chat-content"
            style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 15,
              backgroundColor: "#f9f9f9",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "12px 16px",
                    borderRadius: 18,
                    background: msg.sender === "user"
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "white",
                    color: msg.sender === "user" ? "white" : "#333",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    position: "relative",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: 1,
                    ...(msg.sender === "ai" && { padding: "16px 20px" }),
                  }}
                >
                  <div style={{ fontSize: 14, lineHeight: 1.5, textAlign: "left" }}>
                    {msg.sender === "ai" ? (
                      <>
                        {/* 1. 思考内容区域（仅开启思考模式且有内容时显示开关） */}
                        {isThinkingModeEnabled && showThinkingText[msg.id] && msg.thinkingContent ? (
                          <div style={{
                            marginBottom: 12,
                            padding: 12,
                            backgroundColor: "#f0f8ff",
                            borderRadius: 8,
                            borderLeft: "3px solid #667eea",
                          }}>
                            <div style={{
                              fontSize: 12,
                              color: "#667eea",
                              marginBottom: 8,
                              fontWeight: 500
                            }}>
                              🧠 思考过程
                            </div>
                            <CustomMarkdownRenderer content={msg.thinkingContent} />
                          </div>
                        ) : null}

                        {/* 2. 核心修改：仅开启思考模式时才显示ThinkingAnimation，否则直接显示内容 */}
                        {isThinkingModeEnabled ? (
                          // 开启思考模式：按原有逻辑显示动画或内容
                          !msg.content ? (
                            msg.id === currentAiMsgId && isStreaming ? (
                              <ThinkingAnimation />
                            ) : (
                              <span style={{ color: "#999", fontStyle: "italic" }}>Trying really hard...</span>
                            )
                          ) : (
                            msg.id === currentAiMsgId && isStreaming && !showThinkingText[msg.id] ? (
                              <ThinkingAnimation />
                            ) : (
                              <CustomMarkdownRenderer content={msg.content} />
                            )
                          )
                        ) : (
                          // 关闭思考模式：无论是否流式中，都直接显示内容（流式输出）
                          msg.content ? (
                            <CustomMarkdownRenderer content={msg.content} />
                          ) : (
                            <span style={{ color: "#999", fontStyle: "italic" }}>Trying really hard...</span>
                          )
                        )}
                      </>
                    ) : (
                      // 用户消息
                      <span>{msg.content}</span>
                    )}
                  </div>

                  {/* 核心修改：仅开启思考模式且有思考内容时显示开关 */}
                  {msg.sender === "ai" && isThinkingModeEnabled && msg.thinkingContent && (
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px solid #eee",
                        display: "flex",
                        gap: 8,
                        fontSize: 12,
                        alignItems: "center",
                      }}
                    >
                      {/* 思考内容开关（永久显示，无论是否流式结束） */}
                      <button
                        onClick={() => toggleThinkingText(msg.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#667eea",
                          cursor: "pointer",
                          padding: "2px 6px",
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          fontWeight: 500,
                        }}
                      >
                        {showThinkingText[msg.id] ? "收起思考" : "展开思考"}
                      </button>
                      {/* 原有按钮 */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          message.success("Message copied to clipboard");
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#666",
                          cursor: "pointer",
                          padding: "2px 6px",
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => message.info("Regenerate function to be implemented")}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#666",
                          cursor: "pointer",
                          padding: "2px 6px",
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        🔄 Regenerate
                      </button>
                      <button
                        onClick={() => message.info("Like function to be implemented")}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#666",
                          cursor: "pointer",
                          padding: "2px 6px",
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        👍 Like
                      </button>
                    </div>
                  )}

                  {/* 无思考模式时仅显示基础操作按钮 */}
                  {msg.sender === "ai" && !isThinkingModeEnabled && (
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px solid #eee",
                        display: "flex",
                        gap: 8,
                        fontSize: 12,
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          message.success("Message copied to clipboard");
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#666",
                          cursor: "pointer",
                          padding: "2px 6px",
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => message.info("Regenerate function to be implemented")}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#666",
                          cursor: "pointer",
                          padding: "2px 6px",
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        🔄 Regenerate
                      </button>
                      <button
                        onClick={() => message.info("Like function to be implemented")}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#666",
                          cursor: "pointer",
                          padding: "2px 6px",
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        👍 Like
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: 15,
              boxShadow: "0 -2px 15px rgba(0,0,0,0.1)",
              borderTop: visible ? "1px solid #eee" : "none",
              position: "relative",
              zIndex: 2,
              backgroundColor: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                disabled={isStreaming || models.length === 0}
                style={{
                  flex: 1,
                  padding: "14px 20px",
                  borderRadius: 30,
                  border: "none",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  outline: "none",
                  fontSize: 15,
                  boxSizing: "border-box",
                  backgroundColor: "#f5f5f5",
                  marginLeft: 10,
                  opacity: isStreaming || models.length === 0 ? 0.7 : 1,
                }}
              />
              {renderBottomButton()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}