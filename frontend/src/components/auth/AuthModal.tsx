import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";


interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  // 用于动画的状态：记录是否正在切换（控制过渡时机）
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSuccess = () => {
    onClose();
  };

  // 处理标签切换：先标记为"切换中"，触发动画后再更新activeTab
  const handleTabChange = (newTab: "login" | "register") => {
    if (activeTab === newTab) return;
    setIsSwitching(true); // 开始切换动画
    // 延迟更新activeTab，等待当前表单的淡出动画完成（与CSS过渡时间一致）
    setTimeout(() => {
      setActiveTab(newTab);
      setIsSwitching(false); // 结束切换动画
    }, 300);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        // 遮罩层淡入动画
        opacity: open ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* 弹窗内容 */}
      <div
        style={{
          backgroundColor: "white",
          padding: 32,
          borderRadius: 8,
          height: "70%",
          width: "80%",
          maxWidth: 420,
          position: "relative", // 让表单绝对定位基于此容器
          // 弹窗缩放动画
          transform: open ? "scale(1)" : "scale(0.9)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "none",
            border: "none",
            fontSize: 12,
            cursor: "pointer",
            // 按钮悬停动画
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = "#a9a5a5ff";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.color = "inherit";
          }}
        >
          x
        </button>

        {/* 标签切换按钮 */}
        <div style={{ display: "flex", marginBottom: 20 }}>
          <button
            onClick={() => handleTabChange("login")}
            style={{
              flex: 1,
              padding: 10,
              margin: "0 5px",
              border: "none",
              borderRadius: 4,
              // 背景色过渡动画
              background: activeTab === "login" ? "#e6f7ff" : "white",
              color: activeTab === "login" ? "#1890ff" : "#333",
              fontWeight: activeTab === "login" ? "bold" : "normal",
              cursor: "pointer",
              transition: "all 0.3s ease", // 背景色、文字色平滑过渡
            }}
          >
            登录
          </button>
          <button
            onClick={() => handleTabChange("register")}
            style={{
              flex: 1,
              padding: 10,
              margin: "0 5px",
              border: "none",
              borderRadius: 4,
              background: activeTab === "register" ? "#e6f7ff" : "white",
              color: activeTab === "register" ? "#1890ff" : "#333",
              fontWeight: activeTab === "register" ? "bold" : "normal",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            注册
          </button>
        </div>

        {/* 表单容器（相对定位，让两个表单重叠） */}
        <div style={{ position: "relative", minHeight: 500 }}>
          {/* 登录表单 - 动画逻辑 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              // 动画状态：根据activeTab和切换状态控制透明度和位移
              opacity: activeTab === "login" && !isSwitching ? 1 : 0,
              transform:
                activeTab === "login" && !isSwitching
                  ? "translateX(0)"
                  : "translateX(-20px)", // 未激活时向左偏移
              transition: "opacity 0.3s ease, transform 0.3s ease", // 过渡动画
              pointerEvents: activeTab === "login" ? "auto" : "none", // 未激活时不响应点击
            }}
          >
            <LoginForm onSuccess={handleSuccess} />
          </div>

          {/* 注册表单 - 动画逻辑 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              // 动画状态：根据activeTab和切换状态控制透明度和位移
              opacity: activeTab === "register" && !isSwitching ? 1 : 0,
              transform:
                activeTab === "register" && !isSwitching
                  ? "translateX(0)"
                  : "translateX(20px)", // 未激活时向右偏移
              transition: "opacity 0.3s ease, transform 0.3s ease",
              pointerEvents: activeTab === "register" ? "auto" : "none",
            }}
          >
            <RegisterForm onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}
