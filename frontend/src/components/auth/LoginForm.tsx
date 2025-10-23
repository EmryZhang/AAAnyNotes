import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { LoginParams, LoginMethod } from '../../types/auth';

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  // 默认用邮箱登录，可切换为phone/username
  const [method, setMethod] = useState<LoginMethod>('username');
  const [formData, setFormData] = useState<Omit<LoginParams, 'method'>>({
    account: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();

  // 输入框变化时更新
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 切换登录方式时清空账号输入
  const handleMethodChange = (newMethod: LoginMethod) => {
    setMethod(newMethod);
    setFormData({ ...formData, account: '' });
    setError('');
  };

  // 提交登录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ ...formData, method }); // 传入登录方式
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    }
  };

  // 根据登录方式显示对应的提示文字
  const getAccountLabel = () => {
    switch (method) {
      case "username":
        return "用户名";
      case "email":
        return "邮箱";
      case "phone":
        return "手机号";
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3>登录</h3>

      {/* 登录方式切换 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => handleMethodChange('username')}
          style={{
            flex: 1,
            padding: 8,
            border: method === 'username' ? '1px solid #007bff' : '1px solid #ddd',
            background: method === 'username' ? '#f0f8ff' : 'white',
            cursor: 'pointer',
          }}
        >
          用户名登录
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange('email')}
          style={{
            flex: 1,
            padding: 8,
            border: method === 'email' ? '1px solid #007bff' : '1px solid #ddd',
            background: method === 'email' ? '#f0f8ff' : 'white',
            cursor: 'pointer',
          }}
        >
          邮箱登录
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange('phone')}
          style={{
            flex: 1,
            padding: 8,
            border: method === 'phone' ? '1px solid #007bff' : '1px solid #ddd',
            background: method === 'phone' ? '#f0f8ff' : 'white',
            cursor: 'pointer',
          }}
        >
          手机号登录
        </button>
      </div>

      {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}

      {/* 账号输入框（根据方式动态变化） */}
      <div>
        <label>{getAccountLabel()}</label>
        <input
          type={method === 'email' ? 'email' : 'text'} // 邮箱用email类型，其他用text
          name="account"
          value={formData.account}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: 8,
            marginTop: 4,
            border: '1px solid #ddd',
            borderRadius: 4,
          }}
        />
      </div>

      {/* 密码输入框（通用） */}
      <div>
        <label>密码</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: 8,
            marginTop: 4,
            border: '1px solid #ddd',
            borderRadius: 4,
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          padding: 10,
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        登录
      </button>
    </form>
  );
}
