// 卡片核心类型定义
export interface Card {
  id: string; // 唯一标识，用于前后端通信
  title: string; // 卡片标题
  content: string; // 卡片核心内容/描述
  author: string; // 卡片创建者
  createdAt: string; // 创建时间（ISO格式）
  updatedAt: string; // 最后修改时间
  type: CardType; // 卡片分类类型
  source?: string; // 内容来源（如AI生成/手动录入）
  tags?: string[]; // 分类标签，用于搜索筛选
  permission: Permission; // 访问权限等级
  visibility: Visibility; // 可见性设置
  priority?: Priority; // 优先级（默认normal）
  status?: CardStatus; // 卡片状态（默认active）
  favorite?: boolean; // 是否收藏（默认false）
  attachments?: string[]; // 附件URL/路径数组
  links?: string[]; // 相关链接数组
  metadata?: Record<string, any>; // 扩展元数据（灵活字段）
}

// 卡片类型（替代枚举，无额外编译产物）
export const CardType = {
  NOTE: 'note',
  TODO: 'todo',
  IDEA: 'idea',
  KNOWLEDGE: 'knowledge',
  REFERENCE: 'reference',
  PROJECT: 'project',
  RESEARCH: 'research',
  PERSONAL: 'personal',
  WORK: 'work',
  OTHER: 'other'
} as const;
export type CardType = typeof CardType[keyof typeof CardType];

// 权限等级（替代枚举）
export const Permission = {
  PRIVATE: 'private',
  SHARED: 'shared',
  PUBLIC: 'public',
  READ_ONLY: 'read_only',
  EDITABLE: 'editable'
} as const;
export type Permission = typeof Permission[keyof typeof Permission];

// 可见性设置（替代枚举）
export const Visibility = {
  VISIBLE: 'visible',
  HIDDEN: 'hidden',
  ARCHIVED: 'archived',
  DELETED: 'deleted'
} as const;
export type Visibility = typeof Visibility[keyof typeof Visibility];

// 优先级（替代枚举）
export const Priority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;
export type Priority = typeof Priority[keyof typeof Priority];

// 卡片状态（替代枚举）
export const CardStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  PENDING: 'pending',
  DRAFT: 'draft'
} as const;
export type CardStatus = typeof CardStatus[keyof typeof CardStatus];

// 新建卡片默认值
export const DEFAULT_CARD: Partial<Card> = {
  type: CardType.NOTE,
  permission: Permission.PRIVATE,
  visibility: Visibility.VISIBLE,
  priority: Priority.NORMAL,
  status: CardStatus.ACTIVE,
  favorite: false,
  source: 'Manual Entry',
  tags: [],
  attachments: [],
  links: []
};

// 创建完整卡片对象（自动补全默认值）
export const createCard = (cardData: Partial<Card>): Card => {
  const now = new Date().toISOString();
  return {
    id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`, // 生成唯一ID
    title: cardData.title || 'Untitled Card',
    content: cardData.content || '',
    author: cardData.author || 'Anonymous',
    createdAt: cardData.createdAt || now,
    updatedAt: cardData.updatedAt || now,
    type: cardData.type || CardType.NOTE,
    permission: cardData.permission || Permission.PRIVATE,
    visibility: cardData.visibility || Visibility.VISIBLE,
    priority: cardData.priority || Priority.NORMAL,
    status: cardData.status || CardStatus.ACTIVE,
    favorite: cardData.favorite || false,
    source: cardData.source || 'Manual Entry',
    tags: cardData.tags || [],
    attachments: cardData.attachments || [],
    links: cardData.links || [],
    metadata: cardData.metadata || {}
  };
};

// 类型守卫：校验是否为合法Card对象
export const isValidCard = (obj: any): obj is Card => {
  if (typeof obj !== 'object' || obj === null) return false;
  const requiredFields = ['id', 'title', 'content', 'author', 'createdAt', 'updatedAt', 'type', 'permission', 'visibility'];
  for (const field of requiredFields) if (!(field in obj)) return false;

  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.author === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string' &&
    Object.values(CardType).includes(obj.type) &&
    Object.values(Permission).includes(obj.permission) &&
    Object.values(Visibility).includes(obj.visibility)
  );
};

// 生成7条默认测试卡片数据
export const generateDefaultCards = (): Card[] => {
  return [
    createCard({
      title: 'React性能优化核心技巧',
      content: '1. 使用memo/useMemo/useCallback减少不必要渲染；2. 虚拟列表优化长列表；3. 懒加载组件和图片；4. 避免在渲染中创建函数/对象。',
      author: 'Frontend Dev',
      type: CardType.KNOWLEDGE,
      tags: ['React', '性能优化', '前端'],
      priority: Priority.HIGH,
      source: 'Manual Entry'
    }),
    createCard({
      title: '本周开发任务',
      content: '1. 完成卡片组件美化；2. 修复类型定义语法错误；3. 联调后端接口；4. 编写单元测试。',
      author: 'Fullstack Dev',
      type: CardType.TODO,
      tags: ['开发', '任务', '本周'],
      priority: Priority.URGENT,
      status: CardStatus.PENDING,
      source: 'Manual Entry'
    }),
    createCard({
      title: '笔记应用新功能构思',
      content: '新增卡片模板功能，支持不同类型卡片的预设模板；添加标签分组和筛选；支持导出为Markdown格式。',
      author: 'Product Manager',
      type: CardType.IDEA,
      tags: ['产品', '功能构思', '笔记应用'],
      priority: Priority.NORMAL,
      favorite: true,
      source: 'Brainstorm'
    }),
    createCard({
      title: 'AI知识库项目规划',
      content: '阶段1：需求分析和原型设计（1周）；阶段2：核心功能开发（3周）；阶段3：测试和优化（1周）；阶段4：上线和迭代（持续）。',
      author: 'Project Manager',
      type: CardType.PROJECT,
      tags: ['AI', '知识库', '项目规划'],
      permission: Permission.SHARED,
      status: CardStatus.ACTIVE,
      source: 'Team Discussion'
    }),
    createCard({
      title: 'TypeScript枚举最佳实践',
      content: '1. 避免数字枚举；2. 使用字符串枚举提高可读性；3. 枚举值命名统一；4. 配合类型守卫使用。',
      author: 'TS Dev',
      type: CardType.REFERENCE,
      tags: ['TypeScript', '枚举', '最佳实践'],
      links: ['https://www.typescriptlang.org/docs/handbook/enums.html'],
      source: 'Official Docs'
    }),
    createCard({
      title: '读书笔记 - 《深入浅出React》',
      content: '核心知识点：1. React核心理念；2. 虚拟DOM工作原理；3. Hooks的设计思想；4. 状态管理方案对比。',
      author: 'Personal',
      type: CardType.PERSONAL,
      tags: ['读书', 'React', '笔记'],
      favorite: true,
      priority: Priority.LOW,
      source: 'Book Notes'
    }),
    createCard({
      title: '大模型应用场景调研',
      content: '1. 智能客服：70%企业已落地；2. 代码生成：提升效率30%+；3. 数据分析：自动化报表；4. 内容创作：文案生成。',
      author: 'Researcher',
      type: CardType.RESEARCH,
      tags: ['大模型', 'AI', '调研'],
      permission: Permission.PUBLIC,
      status: CardStatus.COMPLETED,
      source: 'AI Generated'
    })
  ];
};