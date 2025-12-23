package grpc

import (
	"AAAnynotes/backend/go/internal/domain/chat/model"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"time"
)

// 假设你原代码中有这个全局变量（保持不变）
var pythonChatStreamURL = "http://localhost:8000/api/chat/stream" // 替换为你的实际地址

// 🔧 核心优化：适配Kimi长时思考模式的流式请求
func SendChatStream(ctx context.Context, req model.ChatStreamRequest) (io.ReadCloser, error) {
	fmt.Println("=== Go: Starting SendChatStream to Python service ===")
	fmt.Printf("Go: Python service URL: %s\n", pythonChatStreamURL)

	// 1. 序列化请求参数（原有逻辑保留，增强日志）
	reqBody, err := json.Marshal(req)
	if err != nil {
		errMsg := fmt.Sprintf("JSON marshal failed: %v", err)
		fmt.Printf("Go: %s\n", errMsg)
		return nil, fmt.Errorf("request parameter serialization failed: %w", err)
	}

	fmt.Printf("Go: Request JSON preview: %s\n", string(reqBody))

	// 2. 创建带Context的HTTP请求（核心：绑定ctx，支持取消/超时）
	httpReq, err := http.NewRequestWithContext(ctx, "POST", pythonChatStreamURL, bytes.NewBuffer(reqBody))
	if err != nil {
		errMsg := fmt.Sprintf("HTTP request creation failed: %v", err)
		fmt.Printf("Go: %s\n", errMsg)
		return nil, fmt.Errorf("request creation failed: %w", err)
	}

	// 🔧 核心优化：补充流式响应关键请求头
	httpReq.Header.Set("Content-Type", "application/json; charset=utf-8")
	httpReq.Header.Set("Accept", "text/event-stream; charset=utf-8")       // 声明接收SSE流式响应
	httpReq.Header.Set("Cache-Control", "no-cache")                       // 禁用缓存
	httpReq.Header.Set("Connection", "keep-alive")                        // 强制长连接
	httpReq.Header.Set("X-Requested-With", "XMLHttpRequest")              // 兼容前端AJAX请求
	httpReq.Header.Set("Accept-Encoding", "identity")                     // 禁用压缩，避免流式数据乱码

	fmt.Println("Go: Sending HTTP request to Python service (long connection)...")

	// 3. 🔧 核心优化：HTTP客户端配置（适配长时流式请求）
	client := &http.Client{
		Timeout: 6000 * time.Second,
		Transport: &http.Transport{
			// 启用Keep-Alive（流式请求必需）
			DisableKeepAlives:     false,
			// 连接池配置：适配高并发流式请求
			MaxIdleConns:          100,                // 最大空闲连接数
			MaxIdleConnsPerHost:   20,                 // 每个主机最大空闲连接
			IdleConnTimeout:       60 * time.Second,   // 空闲连接超时（60秒）
			// 超时配置：握手/连接超时（短超时，快速失败）
			TLSHandshakeTimeout:   10 * time.Second,   // TLS握手超时
			// 连接超时控制
			DialContext: (&net.Dialer{
				Timeout:   10 * time.Second,  // 连接建立超时
				KeepAlive: 30 * time.Second,  // Keep-Alive时间
			}).DialContext,
			ResponseHeaderTimeout: 15 * time.Second,   // 响应头超时
			// 禁用压缩：避免流式数据解压混乱
			DisableCompression:    true,
		},
	}

	// 4. 发送请求（ctx绑定，客户端断开/超时会立即终止）
	resp, err := client.Do(httpReq)
	if err != nil {
		// 🔧 精细化错误区分：日志更精准
		switch {
		case ctx.Err() == context.DeadlineExceeded:
			errMsg := "HTTP request timeout (ctx deadline exceeded, 5min)"
			fmt.Printf("Go: %s: %v\n", errMsg, ctx.Err())
			return nil, fmt.Errorf("%s: %w", errMsg, ctx.Err())
		case ctx.Err() == context.Canceled:
			errMsg := "HTTP request cancelled (client disconnected)"
			fmt.Printf("Go: %s: %v\n", errMsg, ctx.Err())
			return nil, fmt.Errorf("%s: %w", errMsg, ctx.Err())
		default:
			errMsg := fmt.Sprintf("HTTP request failed: %v", err)
			fmt.Printf("Go: %s\n", errMsg)
			return nil, fmt.Errorf("python service call failed: %w", err)
		}
	}

	fmt.Printf("Go: HTTP response received - Status Code: %d\n", resp.StatusCode)
	fmt.Printf("Go: Response Content-Type: %s\n", resp.Header.Get("Content-Type"))

	// 5. 检查响应状态（增强错误处理，确保Body必关）
	if resp.StatusCode != http.StatusOK {
		// 读取错误响应体（最多1024字符，避免内存溢出）
		bodyBytes := make([]byte, 0, 1024)
		_, readErr := io.ReadFull(resp.Body, bodyBytes[:cap(bodyBytes)])
		if readErr != nil && readErr != io.EOF && readErr != io.ErrUnexpectedEOF {
			fmt.Printf("Go: Failed to read error response body: %v\n", readErr)
		}
		// 必须关闭Body，防止资源泄漏
		if closeErr := resp.Body.Close(); closeErr != nil {
			fmt.Printf("Go: Failed to close error response body: %v\n", closeErr)
		}
		errMsg := fmt.Sprintf(
			"python service returned error: status=%d, body=%s",
			resp.StatusCode, string(bodyBytes),
		)
		fmt.Printf("Go: %s\n", errMsg)
		return nil, fmt.Errorf(errMsg)
	}

	fmt.Println("=== Go: Python service response OK, returning stream body ===")
	return resp.Body, nil
}

// 补充min函数（确保存在）
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}