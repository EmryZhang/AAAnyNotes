import Card from "./Card";

// 模拟卡片数据
const mockCards = [
  {
    title: "人工智能发展简史",
    content: "从图灵测试到现代深度学习，人工智能的发展经历了多个关键阶段...",
    date: "2023-10-01",
  },
  {
    title: "React性能优化技巧",
    content: "掌握这些React优化技巧，让你的应用运行如飞...",
    date: "2023-09-15",
  },
  {
    title: "多Agent系统设计指南",
    content: "如何设计高效的多Agent协作系统，解决复杂任务分配问题...",
    date: "2023-08-20",
  },
  {
    title: "数据可视化最佳实践",
    content: "从图表选择到色彩搭配，打造专业的数据可视化界面...",
    date: "2023-07-05",
  },
  {
    title: "大模型应用场景分析",
    content: "盘点大模型在各行各业的创新应用，看看有哪些机会...",
    date: "2023-09-30",
  },
  {
    title: "前端工程化方案",
    content: "从构建工具到代码规范，一套完整的前端工程化实践...",
    date: "2023-08-10",
  },
];
export default function CardGrid() {
  return (
    <div
      style={{
        padding: "20px 40px",
        maxWidth: "100%",
        margin: "auto auto",
        // 确保容器占满可用宽度（避免被内容限制）
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ margin: "20px 0 30px" }}>知识卡片</h2>

      {/* 网格布局：优化响应式逻辑，确保多列显示 */}
      <div
        style={{
          display: "grid",
          // 最小列宽280px，自动填充多列，最大列宽平均分配
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 24, // 列间距和行间距
          rowGap: 30, // 行间距稍大，区分行
          // 确保网格容器没有额外限制
          width: "100%",
                  boxSizing: "border-box",
          
        }}
      >
        {mockCards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            content={card.content}
            date={card.date}
          />
        ))}
      </div>
    </div>
  );
}