interface CardProps {
  title: string;
  content: string;
  date: string;
}

export default function Card({ title, content, date }: CardProps) {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        overflow: "hidden",
        transition: "transform 0.2s ease, boxShadow 0.2s ease",
        height: "100%", // 确保同 rows 卡片高度一致
        display: "flex",
        flexDirection: "column",
        width: "100%", // 关键：自适应父容器（网格列）宽度
        boxSizing: "border-box", // 确保padding不影响宽度计算
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-5px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 16px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 8px rgba(0,0,0,0.08)";
      }}
    >
      <div
        style={{
          height: 80,
          backgroundColor: "#f0f7ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#007bff",
          fontSize: 40,
        }}
      >
        🏷️
      </div>

      <div
        style={{
          padding: 16,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: 18,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: 0,
            color: "#666",
            fontSize: 14,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {content}
        </p>

        <div
          style={{
            marginTop: 15,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            color: "#999",
          }}
        >
          <span>{date}</span>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              cursor: "pointer",
              padding: 0,
            }}
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
}
