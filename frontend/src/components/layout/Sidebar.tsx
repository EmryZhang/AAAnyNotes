interface SidebarProps {
  visible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onToggle: () => void; // 切换侧边栏显示状态的回调
  onToggleBtnMouseEnter: () => void; // 按钮鼠标进入
  onToggleBtnMouseLeave: () => void; // 按钮鼠标离开
}
export default function Sidebar({
  visible,
  onMouseEnter,
  onMouseLeave,
  onToggle,
  onToggleBtnMouseEnter, // 接收按钮进入事件
  onToggleBtnMouseLeave, // 接收按钮离开事件
}: SidebarProps) {
  return (
    <>
      {/* 侧边栏主体 */}
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          backgroundColor: "white",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          zIndex: 900,
          transform: visible ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          paddingTop: 70,
          paddingRight: 10,
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {/* 侧边栏原有内容 */}
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ margin: "15px 0" }}>主导航</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {["首页", "知识库", "收藏", "历史记录"].map((item) => (
              <li key={item} style={{ margin: "12px 0" }}>
                <a
                  href="#"
                  style={{
                    textDecoration: "none",
                    color: "#333",
                    fontSize: 16,
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 style={{ margin: "15px 0" }}>AI助手</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {["写作助手", "翻译工具", "思维导图"].map((item) => (
              <li key={item} style={{ margin: "12px 0" }}>
                <a
                  href="#"
                  style={{
                    textDecoration: "none",
                    color: "#333",
                    fontSize: 16,
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 侧边栏切换按钮（右侧中心） */}
      <button
        onClick={onToggle} // 点击切换显示状态
        onMouseEnter={onToggleBtnMouseEnter} // 鼠标进入按钮时触发
        onMouseLeave={onToggleBtnMouseLeave} // 鼠标离开按钮时触发
        style={{
          position: "fixed",
          top: "50%",
          // 位置：展开时一半嵌入侧边栏（260px - 按钮宽度的一半），隐藏时靠左
          left: visible ? "260px" : "20px", // 260是侧边栏宽度，20是按钮一半（40/2）
          transform: "translateX(-50%)",
          // 尺寸：展开时宽高相等（圆形），隐藏时保持长方形
          width: "40px",
          height: "70px",
          // 圆角：展开时全圆，隐藏时左方右圆
          borderRadius: visible ? "50%" : "0 50% 50% 0",
          border: "none",
          backgroundColor: "#ffffffff",
          color: "#949494ff",
          fontSize: 30,
          cursor: "pointer",
          // 层级：展开时低于侧边栏（实现融合），隐藏时高于页面
          zIndex: visible ? 910 : 850, // 侧边栏是900，所以890会被侧边栏覆盖一半
          // 过渡动画：所有样式变化平滑过渡（0.3s与侧边栏动画同步）
          transition:
            "left 0.3s ease, borderRadius 0.3s ease, height 0.3s ease, z-index 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: visible
            ? "0 0 5px rgba(0,0,0,0.2)"
            : "2px 0 5px rgba(0,0,0,0.1)",
        }}
      >
        {/* 根据侧边栏状态切换图标：展开时向左，隐藏时向右 */}
        {visible ? "👈" : "👉"}
      </button>
    </>
  );
}
