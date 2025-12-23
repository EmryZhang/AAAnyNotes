import React from "react";

interface HeaderProps {
  onSidebarHover: () => void; // 鼠标进入按钮时触发
  onButtonMouseLeave: () => void; // 鼠标离开按钮时触发
  onOpenAIChat: () => void;
}

export default function Header({
  onSidebarHover,
  onButtonMouseLeave,
  onOpenAIChat,
}: HeaderProps) {
  return (
    <div
      style={{
        height: 60,
        backgroundColor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 800,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* 侧边栏按钮 */}
      <button
        onMouseEnter={onSidebarHover}
        onMouseLeave={onButtonMouseLeave}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: "none",
          background: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
          transition: "background-color 0.2s",
        }}
      >
        <span style={{ fontSize: 20 }}>☰</span>
      </button>

      {/* AI图标按钮 */}
      <button
        onClick={onOpenAIChat}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: "none",
          background: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 20,
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#f0f0f0";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "transparent";
        }}
      >
        <span style={{ fontSize: 20 }}>🤖</span>
      </button>

      {/* Logo和名称 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginRight: "auto", // 推到中间偏左
        }}
      >
        <div
          style={{
            width: "10vw",
            height: 36,
            borderRadius: 8,
            backgroundColor: "#91c0ffff",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: "bold",
            marginRight: 10,
          }}
        >
          AAAnyNotes
        </div>
        <h1 style={{ margin: 0, fontSize: 18 }}>随记</h1>
      </div>

      {/* 右侧功能区 */}
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        {/* 消息通知按钮 */}
        <button
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            border: "none",
            background: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <span style={{ fontSize: 20 }}>🔔</span>
          <span
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "red",
            }}
          />
        </button>

        {/* 用户头像 */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "#eee",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <img
            src="https://picsum.photos/id/64/200/200"
            alt="用户头像"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
}
