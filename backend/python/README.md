# Python后端服务

这是大模型推理服务的Python后端，使用FastAPI框架，支持GLM模型的流式调用。

## 安装依赖

```bash
pip install -r requirements/base.txt
```

## 配置

1. 复制 `.env.example` 为 `.env`
2. 设置你的GLM API密钥：
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，设置 GLM_API_KEY
   ```

## 运行

```bash
python src/main.py
```

服务将在 http://localhost:8000 启动

## API端点

- `POST /api/chat/stream` - 流式聊天接口

## 环境变量

- `GLM_API_KEY`: GLM API密钥（必需）
- `GLM_MODEL`: 使用的模型（默认：glm-4）
- `GLM_BASE_URL`: API基础URL（可选）

## 注意事项

- 需要有效的GLM API密钥
- 确保网络可以访问 open.bigmodel.cn
- 支持流式响应，前端可以实时显示回复内容
