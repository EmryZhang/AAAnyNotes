import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Space, Divider, Typography, Avatar, Tooltip, Tag, Badge, Layout, theme } from 'antd';
import {
  EditOutlined, SaveOutlined, CloseOutlined, ShareAltOutlined,
  TagOutlined, StarOutlined, MoreOutlined, LockOutlined,
  TeamOutlined, GlobalOutlined, ClockCircleOutlined, UserOutlined,
  CalendarOutlined, InfoCircleOutlined, StarFilled
} from '@ant-design/icons';
import { CardType, Permission } from '../../types/card';
import type { Card } from '../../types/card';
import { useCardContext } from './CardContext';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Sider, Content } = Layout;

interface CardDetailModalProps {
  visible: boolean;
  onClose: () => void;
  card: Card | null;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ visible, onClose, card }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card?.title || '');
  const [editedContent, setEditedContent] = useState(card?.content || '');
  const { updateCard } = useCardContext();
  const { token } = theme.useToken();

  useEffect(() => {
    if (card) {
      setEditedTitle(card.title);
      setEditedContent(card.content);
      setIsEditing(false);
    }
  }, [card]);

  const handleSave = () => {
    if (!card) return;
    const updatedCard: Card = {
      ...card,
      title: editedTitle,
      content: editedContent,
      updatedAt: new Date().toISOString(),
    };
    updateCard(updatedCard);
    setIsEditing(false);
    onClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (card) {
      setEditedTitle(card.title);
      setEditedContent(card.content);
    }
    setIsEditing(false);
  };

  const getPermissionIcon = (permission: Permission) => {
    switch (permission) {
      case Permission.PRIVATE:
        return <LockOutlined style={{ color: '#ff4d4f' }} />;
      case Permission.SHARED:
        return <TeamOutlined style={{ color: '#1890ff' }} />;
      case Permission.PUBLIC:
        return <GlobalOutlined style={{ color: '#52c41a' }} />;
      default:
        return <LockOutlined />;
    }
  };

  const getCardIcon = (type: CardType) => {
    const iconMap: Record<string, string> = {
      [CardType.NOTE]: '📝',
      [CardType.TODO]: '✅',
      [CardType.IDEA]: '💡',
      [CardType.KNOWLEDGE]: '📚',
      [CardType.REFERENCE]: '🔖',
      [CardType.PROJECT]: '📋',
      [CardType.RESEARCH]: '🔬',
      [CardType.PERSONAL]: '👤',
      [CardType.WORK]: '💼',
      [CardType.OTHER]: '📌'
    };
    return iconMap[type] || '📌';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (!card) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={"80vw"}
      title={null}
      closeIcon={null} // 我们自定义关闭按钮
      styles={{
        content: { padding: 0, borderRadius: '16px', overflow: 'hidden' },
        mask: { backdropFilter: 'blur(4px)' }
      }}
      className="beautified-card-modal"
    >
      <Layout style={{ height: '75vh', background: '#fff' }}>
        {/* ================= 左侧侧边栏：元数据 ================= */}
        <Sider
          width={280}
          theme="light"
          style={{
            borderRight: '1px solid #f0f0f0',
            backgroundColor: '#fafafa',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            {/* 图标与类型 */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Badge count={card.favorite ? <StarFilled style={{ color: '#faad14', fontSize: 16 }} /> : 0} offset={[-10, 10]}>
                <Avatar
                  size={100}
                  style={{
                    backgroundColor: '#fff',
                    fontSize: '48px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #eaeaea',
                    color: '#333'
                  }}
                >
                  {getCardIcon(card.type)}
                </Avatar>
              </Badge>
              <div style={{ marginTop: '16px' }}>
                <Tag color="geekblue" style={{ fontSize: '14px', padding: '4px 12px', borderRadius: '12px' }}>
                  {card.type.toUpperCase()}
                </Tag>
              </div>
            </div>

            <Divider style={{ margin: '24px 0' }} />

            {/* 信息列表 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="meta-item">
                <Text type="secondary" style={{ fontSize: 12 }}>PERMISSION</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  {getPermissionIcon(card.permission)}
                  <Text strong>{card.permission.toUpperCase()}</Text>
                </div>
              </div>

              <div className="meta-item">
                <Text type="secondary" style={{ fontSize: 12 }}>AUTHOR</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
                  <Text>{card.author}</Text>
                </div>
              </div>

              <div className="meta-item">
                <Text type="secondary" style={{ fontSize: 12 }}>TIMELINE</Text>
                <div style={{ marginTop: 4, fontSize: 13, color: '#666' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <CalendarOutlined /> Created: {formatDate(card.createdAt)}
                  </div>
                  {card.updatedAt !== card.createdAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ClockCircleOutlined /> Updated: {formatDate(card.updatedAt)}
                    </div>
                  )}
                </div>
              </div>

              {card.source && (
                <div className="meta-item">
                  <Text type="secondary" style={{ fontSize: 12 }}>SOURCE</Text>
                  <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
                    <InfoCircleOutlined style={{ marginTop: 4 }} />
                    <Text ellipsis style={{ maxWidth: 180 }}>{card.source}</Text>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 侧边栏底部 */}
          <div style={{ marginTop: 'auto', textAlign: 'center' }}>
            {card.priority && (
              <Tag
                style={{ width: '100%', textAlign: 'center', padding: '6px 0', border: 'none' }}
                color={
                  card.priority === 'urgent' ? '#ff4d4f' :
                    card.priority === 'high' ? '#faad14' :
                      card.priority === 'low' ? '#52c41a' : 'default'
                }
              >
                {card.priority?.toUpperCase()} PRIORITY
              </Tag>
            )}
          </div>
        </Sider>

        {/* ================= 右侧主内容区 ================= */}
        <Layout style={{ background: '#fff' }}>
          {/* Header */}
          <div style={{
            padding: '24px 32px 16px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start'
          }}>
            <div style={{ flex: 1, marginRight: 24 }}>
              {isEditing ? (
                <Input
                  size="large"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Card Title"
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <Title level={3} style={{ margin: 0, fontSize: '24px' }}>
                  {editedTitle}
                </Title>
              )}
            </div>

            <Space size="small">
              {!isEditing ? (
                <>
                  <Tooltip title="Edit">
                    <Button type="text" shape="circle" icon={<EditOutlined />} onClick={handleEdit} />
                  </Tooltip>
                  <Tooltip title="Toggle Favorite">
                    <Button
                      type="text"
                      shape="circle"
                      icon={card.favorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                      onClick={() => console.log('Fav', card.id)}
                    />
                  </Tooltip>
                  <Tooltip title="More">
                    <Button type="text" shape="circle" icon={<MoreOutlined />} />
                  </Tooltip>
                  <Divider type="vertical" />
                  <Button type="text" shape="circle" icon={<CloseOutlined />} onClick={onClose} />
                </>
              ) : (
                <Space>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>Save</Button>
                </Space>
              )}
            </Space>
          </div>

          {/* Scrollable Body */}
          <Content style={{
            padding: '24px 32px',
            overflowY: 'auto',
            height: '100%',
          }} className="custom-scrollbar">
            {isEditing ? (
              <TextArea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                autoSize={{ minRows: 15 }}
                variant="borderless"
                style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  padding: 0,
                  resize: 'none'
                }}
                placeholder="Start typing your content..."
              />
            ) : (
              <Paragraph style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#262626',
                whiteSpace: 'pre-wrap',
                marginBottom: 24,
                minHeight: '200px'
              }}>
                {editedContent || <Text type="secondary" italic>No content provided.</Text>}
              </Paragraph>
            )}

            {/* Tags Section (Always visible at bottom of content) */}
            <div style={{ marginTop: 40 }}>
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TagOutlined style={{ color: token.colorTextSecondary }} />
                <Text type="secondary" strong style={{ fontSize: 12 }}>TAGS</Text>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {card.tags && card.tags.length > 0 ? (
                  card.tags.map((tag, idx) => (
                    <Tag key={idx} color="blue" bordered={false} style={{ fontSize: 13, padding: '4px 10px' }}>
                      #{tag}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary" style={{ fontSize: 13 }}>No tags added</Text>
                )}
                <Button size="small" type="dashed" shape="circle" icon={<EditOutlined style={{ fontSize: 10 }} />} />
              </div>
            </div>
          </Content>

          {/* Footer Actions */}
          <div style={{
            padding: '16px 32px',
            borderTop: '1px solid #f0f0f0',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <Button icon={<ShareAltOutlined />} type="text">Share</Button>
            <Text type="secondary" style={{ fontSize: 12, alignSelf: 'center' }}>ID: {card.id.slice(0, 8)}...</Text>
          </div>
        </Layout>
      </Layout>

      <style>{`
        .beautified-card-modal .ant-modal-content {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }

        .meta-item {
          padding: 8px 0;
        }
      `}</style>
    </Modal>
  );
};

export default CardDetailModal;