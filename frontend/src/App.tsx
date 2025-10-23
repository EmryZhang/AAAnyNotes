import { useState } from "react";
import "./App.css";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import CardGrid from "./components/layout/CardGrid";
import AIChatInterface from "./components/dialog/AIChatInterface";

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMouseInSidebar, setIsMouseInSidebar] = useState(false);
  const [isMouseInToggleBtn, setIsMouseInToggleBtn] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);

  // 控制侧边栏显示的核心逻辑
  // 鼠标进入侧边栏或按钮时：显示侧边栏并标记“在侧边栏内”
  const handleMouseEnter = () => {
    setSidebarVisible(true);
    setIsMouseInSidebar(true);
  };

  const handleSidebarMouseLeave = () => {
    // 用函数式更新确保拿到最新状态
    setIsMouseInSidebar(false);
    // 直接关闭（无需延迟，因为离开后必然要关，除非再次进入）
    setSidebarVisible(false);
  };

  // 鼠标离开顶部按钮时：如果不在侧边栏内，才关闭
  const handleButtonMouseLeave = () => {
    // 用setTimeout+函数式更新检查最新状态
    setTimeout(() => {
      setIsMouseInSidebar((prev) => {
        if (!prev) {
          setSidebarVisible(false);
        }
        return prev;
      });
    }, 300); // 保留短延迟，避免快速划过按钮误关
  };

  // 手动切换侧边栏显示状态
  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev); // 取反当前状态
    // 同步更新鼠标在侧边栏内的状态（避免自动关闭冲突）
    setIsMouseInSidebar((prev) => !prev);
  };

  const toggleChat = () => {
    setChatVisible((prev) => !prev);
  }
  // 鼠标进入切换按钮
  const handleToggleBtnMouseEnter = () => {
    setIsMouseInToggleBtn(true);
    setSidebarVisible(true); // 悬停在按钮上时，强制展开侧边栏
  };

  // 鼠标离开切换按钮
  const handleToggleBtnMouseLeave = () => {
    setIsMouseInToggleBtn(false);
    // 只有当鼠标既不在按钮，也不在侧边栏时，才关闭
    if (!isMouseInSidebar) {
      setSidebarVisible(false);
    }
  };

  
  return (
    <div
      className="App"
      style={{
        paddingTop: 60,
        minHeight: "95vh",
        minWidth: "90vw",
        backgroundColor: "#f5f7fa",
      }}
    >
      {/* 顶部导航：修改按钮的事件回调 */}
      <Header
        onSidebarHover={handleMouseEnter} // 按钮 hover 时触发
        onButtonMouseLeave={handleButtonMouseLeave}
        onOpenAIChat={toggleChat}
      />

      <Sidebar
        visible={sidebarVisible}
        onMouseEnter={handleMouseEnter} // 侧边栏 hover 时触发
        onMouseLeave={handleSidebarMouseLeave} // 侧边栏离开时触发
        onToggle={toggleSidebar} // 绑定切换函数
        onToggleBtnMouseEnter={handleToggleBtnMouseEnter} // 按钮鼠标进入
        onToggleBtnMouseLeave={handleToggleBtnMouseLeave} // 按钮鼠标离开
      />

      {/* 其他组件不变 */}
      <CardGrid />

      <AIChatInterface visible={chatVisible} onVisibleChange={setChatVisible} />
    </div>
  );
}

export default App;
