import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User, LoginParams, RegisterParams } from "../types/auth";

interface AuthContextType {
  user: User | null;
  isLogin: boolean;
  login: (params: LoginParams) => Promise<void>; // 适配新LoginParams
  register: (params: RegisterParams) => Promise<void>; // 适配新RegisterParams
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  // 登录方法（模拟多方式登录验证）
  const login = async (params: LoginParams) => {
    // 模拟后端逻辑：根据登录方式验证账号
    const { method, account, password } = params;
    let mockUser: User | null = null;

    // 1. 用户名登录验证
    if (
      method === "username" &&
      account === "admin" &&
      password === "123456"
    ) {
      mockUser = { id: "1", username: account, email: "test@example.com" };
    }
    // 2. 手机号登录验证（未来扩展，先模拟）
    else if (
      method === "phone" &&
      account === "15632999556" &&
      password === "123456"
    ) {
      mockUser = { id: "2", username: "phoneuser", phone: account };
    }
    // 3. 邮箱登录验证（未来扩展，先模拟）
    else if (
      method === "email" &&
      account === "test@example.com" &&
      password === "123456"
    ) {
      mockUser = { id: "1", username: "testuser", email: account };
    }

    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    } else {
      throw new Error(`登录失败：${method}或密码错误`);
    }
  };

  // 注册方法（支持多联系方式，至少填一种）
  const register = async (params: RegisterParams) => {
    const { username, password, email, phone } = params;

    // 验证：至少填一种联系方式（邮箱或手机号）
    if (!email && !phone) {
      throw new Error("请至少填写邮箱或手机号");
    }
    // 验证：密码长度
    if (password.length < 6) {
      throw new Error("密码长度至少6位");
    }
    // 验证：邮箱格式（如果填了）
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("邮箱格式无效");
    }
    // 验证：手机号格式（如果填了）
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      throw new Error("手机号格式无效");
    }

    // 模拟注册成功（生成用户ID）
    const mockUser: User = {
      id: Date.now().toString(), // 简单用时间戳当ID
      username,
      ...(email && { email }), // 有邮箱则添加
      ...(phone && { phone }), // 有手机号则添加
    };
    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLogin: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used in AuthProvider");
  return context;
}
