import { useState, useRef, useEffect } from "react";

interface AiChatProps {
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

// 对话消息类型
interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  time: string;
}

export default function AiChat({
  visible: propVisible,
  onVisibleChange,
}: AiChatProps) {
  // 状态管理
  const [visible, setVisible] = useState(propVisible ?? false); // 对话框是否可见
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "你好！有什么可以帮助你的吗？",
      sender: "ai",
      time: "10:00",
    },
  ]);
  const [inputContent, setInputContent] = useState("");
  const chatRef = useRef<HTMLDivElement>(null); // 对话框容器引用

  // 当外部传入的visible变化时，同步更新内部状态
  useEffect(() => {
    setVisible(propVisible ?? false);
  }, [propVisible]);

  // 展开/收起对话框（同时通知外部状态变化）
  const toggleChat = () => {
    const newVisible = !visible;
    setVisible(newVisible);
    onVisibleChange?.(newVisible); // 通知外部：状态已改变
  };

  // 发送消息
  const handleSend = () => {
    if (!inputContent.trim()) return;
    // 添加用户消息
    const userMsg: Message = {
      id: Date.now().toString(),
      content: inputContent,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputContent("");
    setVisible(true); // 发送消息时自动展开对话框

    // 模拟AI回复
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: `已收到你的消息："${inputContent}"，这是我的回复...`,
        sender: "ai",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  // 按Enter发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  // 对话框展开时自动滚动到底部
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

  return (
    <>
      {/* 渐变模糊层（仅对话框展开时显示） */}
      {visible && (
        <div
          style={{
            position: "fixed",
            bottom: "120px", // 与输入框高度匹配
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

      {/* 浮动容器：包含【对话框】和【输入框】（两者同级） */}
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
          // 确保容器内部元素按垂直方向排列
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 对话框（展开/收起动画）- 仅包含聊天内容，不包含输入框 */}
        <div
          style={{
            // 对话框高度：展开时为80vh减去输入框高度，收起时为0
            height: visible ? "calc(80vh - 100px)" : "0",
            overflow: "hidden",
            transition:
              "maxHeight 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: visible ? "translateY(0)" : "translateY(20px)",
            opacity: visible ? 1 : 0,
            backgroundColor: "white",
            // 展开时顶部有圆角，底部无圆角（与输入框衔接）
            borderRadius: visible ? "16px 16px 0 0" : "0",
            boxShadow: "0 -2px 20px rgba(0,0,0,0.15)",
            // 确保对话框在输入框上方
            zIndex: 1,
          }}
        >
          {/* 对话框标题栏 */}
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
              height: "calc(100% - 100px)", // 减去标题栏高度
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
                          onClick={() => {
                            // 重新生成逻辑
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

        {/* 底部输入框（始终显示）- 与对话框同级，不再被包裹 */}
        <div
          style={{
            padding: "15px 0",
            display: "flex",
            gap: 10,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            // 展开时顶部无圆角（与对话框衔接），收起时全圆角
            borderRadius: visible ? "0 0 16px 16px" : "16px",
            boxShadow: "0 -2px 15px rgba(0,0,0,0.1)",
            borderTop: visible ? "1px solid #eee" : "none", // 展开时显示分隔线
            // 确保输入框在最底部，不被对话框遮挡
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
            }}
          />
          <button
            onClick={() => {
              // 点击按钮时切换对话框状态，若有内容则发送
              if (inputContent.trim()) {
                handleSend();
              } else {
                toggleChat();
              }
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
              (e.target as HTMLButtonElement).style.backgroundColor =
                "#c2d7ecff";
            }}
          >
            {visible ? "👇" : "👆"}
          </button>
        </div>
      </div>
    </>
  );
}