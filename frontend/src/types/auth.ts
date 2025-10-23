// 用户信息类型（支持多联系方式）
export interface User {
  id: string;
  username: string; // 唯一用户名（必填）
  email?: string; // 邮箱（可选，可用于登录）
  phone?: string; // 手机号（可选，可用于登录）
}

// 登录方式枚举（方便后续扩展）
export type LoginMethod = "email" | "phone" | "username";

// 登录参数（根据登录方式动态变化）
export interface LoginParams {
  method: LoginMethod; // 登录方式
  account: string; // 账号（邮箱/手机号/用户名，根据method确定）
  password: string; // 密码（通用）
}

// 注册参数（支持多联系方式，至少填一种）
export interface RegisterParams {
  username: string; // 唯一用户名（必填）
  password: string; // 密码（必填）
  email?: string; // 邮箱（可选，填则需验证格式）
  phone?: string; // 手机号（可选，填则需验证格式）
}
