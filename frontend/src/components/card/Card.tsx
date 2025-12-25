import React, { useState } from 'react';
import CardDetailModal from '../card/CardDetailModal';

import type { Card } from '../../types/card';
interface CardProps {
  card: Card;
}

export default function CardComponent({ card }: CardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleCardClick = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // 格式化日期（保留逻辑，优化显示）
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // 修复乱码：替换为规范emoji图标
  const getCardIcon = (type: string) => {
    switch (type) {
      case 'note': return '📝';
      case 'todo': return '✅';
      case 'idea': return '💡';
      case 'knowledge': return '📚';
      case 'reference': return '🔖';
      case 'project': return '📋';
      case 'research': return '🔬';
      case 'personal': return '👤';
      case 'work': return '💼';
      default: return '📌';
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 16, // 优化：圆角更大更现代
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)", // 优化：更细腻的默认阴影
          overflow: "hidden",
          transition: "all 0.3s ease", // 优化：过渡更丝滑，覆盖所有属性
          height: "100%",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          boxSizing: "border-box",
          cursor: "pointer",
          position: "relative",
          border: "1px solid #f0f0f0", // 新增：浅边框提升层次感
        }}
        onClick={handleCardClick}
        onMouseEnter={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.transform = "translateY(-6px)"; // 优化：上移距离更舒适
          target.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)"; // 优化：hover阴影更柔和
          target.style.borderColor = "#e8f4ff"; // 新增：hover边框变色
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.transform = "translateY(0)";
          target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
          target.style.borderColor = "#f0f0f0";
        }}
      >
        {/* Favorite indicator - 修复乱码+优化样式 */}
        {card.favorite && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              zIndex: 1,
              fontSize: "18px",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))", // 新增：轻微阴影提升层级
            }}
          >
            ⭐ {/* 修复：替换乱码?为星星 */}
          </div>
        )}

        {/* Card header with icon - 优化背景+颜色 */}
        <div
          style={{
            height: 88, // 优化：高度更协调
            background: "linear-gradient(135deg, #e8f4ff 0%, #f0f7ff 100%)", // 优化：渐变背景
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44, // 优化：图标更大
            color: "#1890ff", // 新增：图标统一主色
            transition: "transform 0.3s ease", // 新增：图标hover动效
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
          }}
        >
          {getCardIcon(card.type)}
        </div>

        {/* Card content - 优化间距+颜色 */}
        <div
          style={{
            padding: 20, // 优化：内边距更大
            flex: 1,
            display: "flex",
            flexDirection: "column",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", // 新增：统一字体
          }}
        >
          {/* Title - 优化颜色+行高 */}
          <h3
            style={{
              margin: "0 0 12px 0", // 优化：间距更合理
              fontSize: 18,
              fontWeight: "600",
              color: "#1f2937", // 优化：更深的标题色
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: "1.4", // 优化：行高更舒适
            }}
          >
            {card.title}
          </h3>
          {/* Content preview - 左对齐 + 3行截断 + 渐变模糊遮罩 */}
          <div
            style={{
              position: "relative", // 为渐变遮罩提供定位容器
              flex: 1,
              overflow: "hidden", // 配合子元素截断
              lineHeight: "1.6", // 统一行高
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#4b5563",
                fontSize: 14,
                textAlign: "left", // 强制左对齐
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3, // 限制仅显示3行
                WebkitBoxOrient: "vertical",
                lineHeight: "1.6",
                marginBottom: 0, // 清除默认margin
                position: "relative",
                zIndex: 1, // 确保文字在遮罩上层
              }}
            >
              {card.content}
            </p>
            {/* 渐变模糊遮罩：仅在内容超过3行时显示 */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "30px", // 遮罩高度（覆盖最后一行的下半部分）
                background: "linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))",
                pointerEvents: "none", // 不影响点击事件
                zIndex: 2, // 遮罩在文字上层
              }}
            />
          </div>

          {/* Tags - 优化样式+间距 */}
          {card.tags && card.tags.length > 0 && (
            <div
              style={{
                margin: "10px 0", // 优化：间距更合理
                display: "flex",
                flexWrap: "wrap",
                gap: "6px", // 优化：标签间距更大
              }}
            >
              {card.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: "#e6f7ff",
                    color: "#1890ff",
                    fontSize: "11px", // 优化：字体大小
                    padding: "3px 8px", // 优化：内边距更精致
                    borderRadius: "12px", // 优化：圆角更大
                    fontWeight: "500",
                    transition: "background-color 0.2s ease", // 新增：hover变色
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLSpanElement).style.backgroundColor = "#d1e9ff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLSpanElement).style.backgroundColor = "#e6f7ff";
                  }}
                >
                  {tag}
                </span>
              ))}
              {card.tags.length > 2 && (
                <span
                  style={{
                    backgroundColor: "#f3f4f6", // 优化：更柔和的背景
                    color: "#6b7280", // 优化：更协调的文字色
                    fontSize: "11px",
                    padding: "3px 8px",
                    borderRadius: "12px",
                  }}
                >
                  +{card.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Footer info - 优化样式+分隔符 */}
          <div
            style={{
              marginTop: "auto", // 新增：固定在底部
              paddingTop: 12, // 新增：上内边距
              borderTop: "1px solid #f3f4f6", // 新增：上边框分隔
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
              color: "#6b7280", // 优化：更舒适的文字色
            }}
          >
            <div>
              <span style={{ color: "#4b5563", fontWeight: "400" }}>{formatDate(card.createdAt)}</span>
              {card.author && (
                <>
                  <span style={{ margin: "0 4px", color: "#d1d5db" }}>•</span> {/* 修复：替换乱码?为点 */}
                  <span style={{ color: "#4b5563" }}>{card.author}</span>
                </>
              )}
            </div>
            <span
              style={{
                color: "#1890ff", // 优化：统一主色
                fontWeight: "500",
                transition: "color 0.2s ease", // 新增：hover变色
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLSpanElement).style.color = "#096dd9";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLSpanElement).style.color = "#1890ff";
              }}
            >
              View Details → {/* 修复：替换乱码��为箭头 */}
            </span>
          </div>
        </div>
      </div>

      <CardDetailModal
        visible={modalVisible}
        onClose={handleCloseModal}
        card={card}
      />
    </>
  );
}
