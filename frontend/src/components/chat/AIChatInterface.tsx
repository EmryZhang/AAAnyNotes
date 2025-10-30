import { useState, useRef, useEffect } from "react";
import { message } from "antd";
import { sendChatStream } from "../../api/chat";
import type { Message, ChatStreamParams } from "../../types/chat";

interface AiChatProps {
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

export default function AiChat({
  visible: propVisible,
  onVisibleChange,
}: AiChatProps) {
  // 基础状态
  const [visible, setVisible] = useState(propVisible ?? false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "你好！有什么可以帮助你的吗？",
      sender: "ai",
      time: "10:00",
    },
  ]);
  const [inputContent, setInputContent] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  // 流式相关状态
  const [isStreaming, setIsStreaming] = useState(false); // 是否正在流式输出
  const [abortRequest, setAbortRequest] = useState<(() => void) | null>(null); // 明确取消函数类型
  const [currentAiMsgId, setCurrentAiMsgId] = useState<string>(""); // 明确为字符串类型

  // 同步外部visible状态
  useEffect(() => {
    setVisible(propVisible ?? false);
  }, [propVisible]);

  // 自动滚动到底部
  useEffect(() => {
    if (visible && chatRef.current) {
      const scrollable = chatRef.current.querySelector(
        ".chat-content"
      ) as HTMLDivElement;
      scrollable?.scrollTo({
        top: scrollable.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [visible, messages]);

  // 取消流式请求时重置状态
  useEffect(() => {
    return () => {
      abortRequest?.();
    };
  }, [abortRequest]);

  // 展开/收起对话框
  const toggleChat = () => {
    const newVisible = !visible;
    setVisible(newVisible);
    onVisibleChange?.(newVisible);
  };

  // 处理暂停/继续（当前仅实现暂停功能）
  const handlePauseStream = () => {
    if (isStreaming && abortRequest) {
      abortRequest(); // 取消流式请求
      setIsStreaming(false);
      setAbortRequest(null);
      // 弹出终止提示对话框
      message.info("你已终止本次对话请求"); // 替换为自定义提示
    }
  };

  // 发送消息（对接流式API）
  const handleSend = () => {
    if (!inputContent.trim() || isStreaming) return;

    // 1. 添加用户消息
    const userMsg: Message = {
      id: Date.now().toString(),
      content: inputContent,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputContent("");
    setVisible(true);

    // 2. 创建AI消息占位（用于流式填充）
    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholderMsg: Message = {
      id: aiMsgId,
      content: "",
      sender: "ai",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, aiPlaceholderMsg]);
    setCurrentAiMsgId(aiMsgId);
    setIsStreaming(true);

    // 3. 调用流式API（明确参数类型）
    const requestParams: ChatStreamParams = {
      // 明确为 ChatStreamParams 类型
      messages: newMessages,
      // 可扩展参数示例（自动符合类型规范）
      // model: "gpt-4",
      // temperature: 0.5,
    };

    const cancel = sendChatStream(
      requestParams,
      (chunk: string) => {
        // 明确 chunk 为 string 类型
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      },
      () => {
        // 完成回调无参数
        setIsStreaming(false);
        setAbortRequest(null);
      },
      (error: Error) => {
        // 明确 error 为 Error 类型
        console.error("流式请求失败：", error);
        setIsStreaming(false);
        setAbortRequest(null);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? { ...msg, content: `请求失败：${error.message}` }
              : msg
          )
        );
      }
    );

    setAbortRequest(cancel);
  };

  // 按Enter发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  // 右下角按钮逻辑：流式输出时显示暂停，否则显示展开关闭
  const renderBottomButton = () => {
    if (isStreaming) {
      // 流式输出中：显示暂停按钮
      return (
        <button
          onClick={handlePauseStream}
          style={{
            width: 44,
            height: 52,
            borderRadius: "50%",
            backgroundColor: "#ff6b6b",
            color: "white",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(255,107,107,0.3)",
            transition: "transform 0.2s ease",
            marginRight: "2%",
            fontSize: 24,
            paddingTop: 6,
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(1.1)";
            (e.target as HTMLButtonElement).style.backgroundColor = "#ca5050ff";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(1)";
            (e.target as HTMLButtonElement).style.backgroundColor = "#ff6b6b";
          }}
        >
          ■
        </button>
      );
    } else {
      // 非流式输出：显示原展开关闭按钮
      return (
        <button
          onClick={() => {
            toggleChat();
          }}
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: "#c2d7ecff",
            color: "white",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,123,255,0.3)",
            transition: "transform 0.2s ease, background-color 0.2s ease",
            marginRight: "2%",
            fontSize: 22,
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(1.1)";
            (e.target as HTMLButtonElement).style.backgroundColor = "#2c86e6ff";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(1)";
            (e.target as HTMLButtonElement).style.backgroundColor = "#c2d7ecff";
          }}
        >
          {visible ? "👇" : "👆"}
        </button>
      );
    }
  };

  return (
    <>
      {/* 渐变模糊层 */}
      {visible && (
        <div
          style={{
            position: "fixed",
            bottom: "120px",
            left: 0,
            right: 0,
            height: "100px",
            background:
              "linear-gradient(to top, rgba(255,255,255,0.8) 0%, transparent 100%)",
            backdropFilter: "blur(8px)",
            zIndex: 10,
            pointerEvents: "none",
            transition: "opacity 0.3s ease",
            opacity: visible ? 1 : 0,
          }}
        />
      )}

      {/* 浮动容器 */}
      <div
        ref={chatRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: 1400,
          zIndex: 10,
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 对话框 */}
        <div
          style={{
            height: visible ? "calc(80vh - 100px)" : "0",
            overflow: "hidden",
            transition:
              "maxHeight 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: visible ? "translateY(0)" : "translateY(20px)",
            opacity: visible ? 1 : 0,
            backgroundColor: "white",
            borderRadius: visible ? "16px 16px 0 0" : "0",
            boxShadow: "0 -2px 20px rgba(0,0,0,0.15)",
            zIndex: 1,
          }}
        >
          {/* 标题栏 */}
          <div
            style={{
              padding: "15px 20px",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f9f9f9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "#007bff",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                🤖
              </div>
              <h3 style={{ margin: 0, fontSize: 16 }}>AI 对话助手</h3>
            </div>
            <button
              onClick={toggleChat}
              style={{
                background: "none",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
                width: 36,
                height: 44,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor =
                  "#f0f0f0")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor =
                  "transparent")
              }
            >
              ×
            </button>
          </div>

          {/* 对话内容区 */}
          <div
            className="chat-content"
            style={{
              height: "calc(100% - 100px)",
              padding: "20px",
              overflowY: "auto",
              backgroundColor: "#f9f9f9",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: 20,
                  display: "flex",
                  flexDirection: msg.sender === "user" ? "row-reverse" : "row",
                  gap: 10,
                  alignItems: "flex-end",
                }}
              >
                {/* 头像 */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: msg.sender === "user" ? "#eee" : "#007bff",
                    color: msg.sender === "user" ? "#333" : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {msg.sender === "user" ? "U" : "AI"}
                </div>

                {/* 消息内容和功能按钮容器 */}
                <div
                  style={{
                    maxWidth: "70%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* 消息内容 */}
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius:
                        msg.sender === "user"
                          ? "12px 12px 0px 12px"
                          : "12px 12px 12px 0px",
                      backgroundColor:
                        msg.sender === "user" ? "#e6f7ff" : "white",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                      position: "relative",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                      {msg.content}
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: 11,
                        color: "#999",
                        textAlign: "right",
                      }}
                    >
                      {msg.time}
                    </p>
                  </div>

                  {/* 功能按钮组 */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 6,
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 12,
                      justifyContent:
                        msg.sender === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    {/* 用户消息功能按钮 */}
                    {msg.sender === "user" ? (
                      <>
                        <button
                          onClick={() => {
                            setInputContent(msg.content);
                            if (!visible) toggleChat();
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
                          onMouseEnter={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "rgba(0,0,0,0.05)";
                            (e.target as HTMLButtonElement).style.color =
                              "#333";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "transparent";
                            (e.target as HTMLButtonElement).style.color =
                              "#666";
                          }}
                        >
                          <span>✏️</span>
                          <span>编辑</span>
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
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
                          onMouseEnter={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "rgba(0,0,0,0.05)";
                            (e.target as HTMLButtonElement).style.color =
                              "#333";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "transparent";
                            (e.target as HTMLButtonElement).style.color =
                              "#666";
                          }}
                        >
                          <span>📋</span>
                          <span>复制</span>
                        </button>
                      </>
                    ) : (
                      // AI消息功能按钮
                      <>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
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
                          onMouseEnter={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "rgba(0,0,0,0.05)";
                            (e.target as HTMLButtonElement).style.color =
                              "#333";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "transparent";
                            (e.target as HTMLButtonElement).style.color =
                              "#666";
                          }}
                        >
                          <span>📋</span>
                          <span>复制</span>
                        </button>

                        <button
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
                          onMouseEnter={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "rgba(0,0,0,0.05)";
                            (e.target as HTMLButtonElement).style.color =
                              "#333";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "transparent";
                            (e.target as HTMLButtonElement).style.color =
                              "#666";
                          }}
                        >
                          <span>🔄</span>
                          <span>重新生成</span>
                        </button>

                        <button
                          onClick={() => {
                            // 添加到卡片逻辑
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
                          onMouseEnter={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "rgba(0,0,0,0.05)";
                            (e.target as HTMLButtonElement).style.color =
                              "#333";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "transparent";
                            (e.target as HTMLButtonElement).style.color =
                              "#666";
                          }}
                        >
                          <span>📌</span>
                          <span>添加到卡片</span>
                        </button>

                        <button
                          onClick={() => {
                            // 点赞逻辑
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
                          onMouseEnter={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "rgba(0,0,0,0.05)";
                            (e.target as HTMLButtonElement).style.color =
                              "#333";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "transparent";
                            (e.target as HTMLButtonElement).style.color =
                              "#666";
                          }}
                        >
                          <span>👍</span>
                          <span>点赞</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部输入框 */}
        <div
          style={{
            padding: "15px 0",
            display: "flex",
            gap: 10,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: visible ? "0 0 16px 16px" : "16px",
            boxShadow: "0 -2px 15px rgba(0,0,0,0.1)",
            borderTop: visible ? "1px solid #eee" : "none",
            position: "relative",
            zIndex: 2,
          }}
        >
          <input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入内容或提问..."
            disabled={isStreaming} // 流式输出时禁用输入框
            style={{
              flex: 1,
              padding: "14px 20px",
              borderRadius: 30,
              border: "none",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              outline: "none",
              fontSize: 15,
              boxSizing: "border-box",
              backgroundColor: "white",
              marginLeft: "2%",
              marginRight: "2%",
              opacity: isStreaming ? 0.7 : 1, // 流式输出时输入框置灰
            }}
          />
          {renderBottomButton()}
        </div>
      </div>
    </>
  );
}
