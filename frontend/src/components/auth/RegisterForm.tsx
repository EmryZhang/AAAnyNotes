import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import type { RegisterParams } from "../../types/auth";

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterParams>({
    username: "",
    password: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(formData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <h3>注册</h3>
      {error && <div style={{ color: "red", fontSize: 14 }}>{error}</div>}

      {/* 用户名（必填） */}
      <div>
        <label>用户名（唯一标识）</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: 8,
            marginTop: 4,
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        />
      </div>

      {/* 邮箱（可选，但至少填一种联系方式） */}
      <div>
        <label>邮箱（选填，可用于登录）</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: 8,
            marginTop: 4,
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
          placeholder="例如：test@example.com"
        />
      </div>

      {/* 手机号（可选，但至少填一种联系方式） */}
      <div>
        <label>手机号（选填，可用于登录）</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: 8,
            marginTop: 4,
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
          placeholder="例如：13800138000"
        />
      </div>

      {/* 密码（必填） */}
      <div>
        <label>密码（至少6位）</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          style={{
            width: "100%",
            padding: 8,
            marginTop: 4,
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          padding: 10,
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        注册
      </button>
      <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
        注：建议至少填写邮箱或手机号中的一项，用于登录和账号找回
      </p>
    </form>
  );
}
