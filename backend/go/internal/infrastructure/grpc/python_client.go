package grpc

import (
	"AAAnynotes/backend/go/internal/domain/chat/model"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// Python 模型服务的流式接口地址
const pythonChatStreamURL = "http://localhost:8000/api/chat/stream"

// SendChatStream 转发前端请求到 Python 服务，返回流式响应
func SendChatStream(req model.ChatStreamRequest) (io.ReadCloser, error) {
	// 序列化请求参数为 JSON
	reqBody, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("请求参数序列化失败: %w", err)
	}

	// 创建 HTTP POST 请求
	httpReq, err := http.NewRequest("POST", pythonChatStreamURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "text/event-stream") // 声明接收流式响应

	// 发送请求
	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("调用 Python 服务失败: %w", err)
	}

	// 检查响应状态
	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, fmt.Errorf("Python 服务返回错误: 状态码 %d", resp.StatusCode)
	}

	return resp.Body, nil
}