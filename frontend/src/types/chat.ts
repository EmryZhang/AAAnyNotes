// src/types/chat.ts

/**
 * 对话消息类型定义
 * 用于描述用户与AI之间的单条消息
 */
export interface Message {
  /** 消息唯一标识（建议使用时间戳+随机数） */
  id: string;
  /** 消息内容 */
  content: string;
  /** 发送者类型（用户或AI） */
  sender: "user" | "ai";
  /** 消息发送时间（格式：本地化时间字符串，如 "10:05"） */
  time: string;
}

/**
 * 流式对话请求参数类型
 * 包含与大模型交互所需的所有参数，支持扩展
 */
export interface ChatStreamParams {
  /** 对话历史消息列表 */
  messages: Message[];
  /** 模型名称（如 "gpt-3.5-turbo"、"gpt-4" 等） */
  model?: string;
  /** 温度参数（控制生成内容的随机性，0-1之间，值越高越随机） */
  temperature?: number;
  /** 采样阈值（控制生成内容的多样性，0-1之间） */
  topP?: number;
  /** 最大生成token长度（限制回复内容长度） */
  maxTokens?: number;
  /** 重复惩罚参数（减少重复内容生成，通常1-2之间） */
  frequencyPenalty?: number;
  /** 存在惩罚参数（减少已出现内容的重复生成，通常-2-2之间） */
  presencePenalty?: number;
  /** 停止序列（遇到该序列时停止生成，如 ["\n", "。"]） */
  stop?: string[];
  /** 预留扩展字段（支持后端新增参数时无需修改类型定义） */
  [key: string]: any;
}

/**
 * 流式响应数据块类型
 * 描述大模型流式输出的单块数据
 */
export interface StreamChunk {
  /** 当前数据块的内容（单条token或连续文本） */
  content: string;
  /** 是否为最后一块数据（用于标识流式输出结束） */
  finished: boolean;
  /** 预留扩展字段（如错误信息、模型状态等） */
  [key: string]: any;
}

/**
 * 流式请求回调函数类型定义
 */
export interface StreamCallbacks {
  /** 接收数据块的回调函数 */
  onChunk: (chunk: string) => void;
  /** 流式输出完成的回调函数 */
  onComplete?: () => void;
  /** 发生错误时的回调函数 */
  onError?: (error: Error) => void;
}
