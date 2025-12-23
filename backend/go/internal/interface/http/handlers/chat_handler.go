package handlers

import (
	"AAAnynotes/backend/go/internal/domain/chat/model"
	"AAAnynotes/backend/go/internal/infrastructure/grpc"
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// 常量定义：超时和心跳配置
const (
	// 流式响应总超时（根据Kimi思考模式调整，建议5分钟）
	streamTotalTimeout = 5 * time.Minute
	// 心跳间隔（避免连接被断开，建议10秒）
	heartbeatInterval = 10 * time.Second
	// 单次读取超时（读取Python响应的超时）
	readTimeout = 30 * time.Second
)

func ChatStream(c *gin.Context) {
	fmt.Println("Go: Processing chat stream request")

	// 1. 解析请求参数
	var req model.ChatStreamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Go: JSON parsing error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "请求参数解析失败，请检查参数格式",
		})
		return
	}

	// 2. 创建带长超时的自定义Context
	ctx, cancel := context.WithTimeout(c.Request.Context(), streamTotalTimeout)
	defer cancel()

	// 3. 调用Python AI服务
	fmt.Println("Go: Calling Python AI service with long timeout...")
	pythonRespBody, err := grpc.SendChatStream(ctx, req)
	if err != nil {
		if context.DeadlineExceeded == err {
			fmt.Printf("Go: Python service timeout (5min): %v\n", err)
			c.JSON(http.StatusGatewayTimeout, gin.H{
				"error": "AI思考超时（5分钟），请简化问题后重试",
			})
		} else if context.Canceled == err {
			fmt.Printf("Go: Python service canceled: %v\n", err)
			c.JSON(http.StatusRequestTimeout, gin.H{
				"error": "请求已取消（客户端断开/超时）",
			})
		} else {
			fmt.Printf("Go: Python service error: %v\n", err)
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error": "服务暂时不可用，请稍后重试",
			})
		}
		return
	}

	// 确保响应体关闭
	defer func() {
		if closeErr := pythonRespBody.Close(); closeErr != nil {
			fmt.Printf("Go: Failed to close Python response body: %v\n", closeErr)
		}
	}()

	// 4. 设置SSE响应头
	c.Header("Content-Type", "text/event-stream; charset=utf-8")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked")
	c.Header("X-Accel-Buffering", "no") // 禁用Nginx缓冲
	c.Header("X-Accel-Expires", "0")    // 禁用Nginx缓存
	c.Status(http.StatusOK)

	// 5. 获取Flusher
	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		fmt.Printf("Go: Cannot get flusher\n")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "流式响应创建失败",
		})
		return
	}

	// 6. 启动心跳协程
	heartbeatQuit := make(chan struct{})
	defer close(heartbeatQuit)
	go func() {
		ticker := time.NewTicker(heartbeatInterval)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				_, err := c.Writer.Write([]byte("data: [HEARTBEAT]\n\n"))
				if err != nil {
					fmt.Printf("Go: Failed to send heartbeat: %v\n", err)
					return
				}
				flusher.Flush()
			case <-heartbeatQuit:
				return
			case <-ctx.Done():
				return
			}
		}
	}()

	// 7. 优化流式读取逻辑（核心修复：SetReadDeadline类型断言）
	fmt.Println("Go: Reading Python response with read loop...")
	reader := bufio.NewReaderSize(pythonRespBody, 1024*1024) // 1MB缓冲区
	buf := make([]byte, 4096)                                // 每次读取4KB

	// 🔧 核心修复：定义SetReadDeadline的接口，做类型断言
	type deadlineSetter interface {
		SetReadDeadline(t time.Time) error
	}
	// 尝试将pythonRespBody转换为可设置超时的类型
	timeoutBody, canSetTimeout := pythonRespBody.(deadlineSetter)

	for {
		// 检查Context状态
		select {
		case <-ctx.Done():
			err := ctx.Err()
			if err == context.DeadlineExceeded {
				fmt.Println("Go: Stream timeout (5min), stop streaming")
			} else if err == context.Canceled {
				fmt.Println("Go: Client disconnected/request canceled")
			}
			return
		default:
		}

		if canSetTimeout {
			// 设置单次读取超时（30秒）
			if err := timeoutBody.SetReadDeadline(time.Now().Add(readTimeout)); err != nil {
				fmt.Printf("Go: Failed to set read deadline: %v\n", err)
				// 设置失败不终止，继续读取
			}
		} else {
			// 日志提示：无法设置读取超时（不影响核心逻辑）
			// fmt.Println("Go: Warning: pythonRespBody does not support SetReadDeadline")
		}

		// 读取数据
		n, err := reader.Read(buf)
		if err != nil {
			// 正常EOF：结束循环
			if err.Error() == "EOF" {
				fmt.Println("Go: Python response EOF")
				break
			}

			// 读取超时：继续循环（避免单次超时终止整体流）
			// 兼容不同的超时错误类型判断
			var timeoutErr interface{ Timeout() bool }
			if ok := errors.As(err, &timeoutErr); ok && timeoutErr.Timeout() {
				fmt.Printf("Go: Read timeout (30s), continue...\n")
				continue
			}

			// 其他错误：记录并终止
			fmt.Printf("Go: Read error: %v\n", err)
			errorMsg, _ := json.Marshal(map[string]string{
				"error": fmt.Sprintf("流式读取失败：%v", err),
			})
			_, _ = c.Writer.Write([]byte("data: " + string(errorMsg) + "\n\n"))
			flusher.Flush()
			return
		}

		// 处理读取到的数据
		if n == 0 {
			continue
		}
		data := buf[:n]
		rawStr := string(data)

		// 按换行分割数据
		lines := strings.Split(rawStr, "\n")
		for _, line := range lines {
			line = strings.TrimSpace(line)
			if line == "" || line == "[DONE]" {
				continue
			}

			// 解析StreamChunk并转发
			var chunk model.StreamChunk
			if unmarshalErr := json.Unmarshal([]byte(line), &chunk); unmarshalErr != nil {
				fmt.Printf("Go: JSON unmarshal error: %v, data: %s\n", unmarshalErr, line[:min(len(line), 100)])
				// 转发原始数据
				_, writeErr := c.Writer.Write([]byte("data: " + line + "\n\n"))
				if writeErr != nil {
					fmt.Printf("Go: Failed to write raw data: %v\n", writeErr)
					return
				}
			} else {
				// 正常解析：转发SSE格式
				chunkJSON, marshalErr := json.Marshal(chunk)
				if marshalErr != nil {
					fmt.Printf("Go: JSON marshal error: %v\n", marshalErr)
					continue
				}
				_, writeErr := c.Writer.Write([]byte("data: " + string(chunkJSON) + "\n\n"))
				if writeErr != nil {
					fmt.Printf("Go: Failed to write chunk: %v\n", writeErr)
					return
				}
			}
			flusher.Flush()
		}
	}

	// 发送结束信号
	_, _ = c.Writer.Write([]byte("data: [DONE]\n\n"))
	flusher.Flush()

	fmt.Println("Go: Stream processing completed")
}

// 补充min函数
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// 补充errors.As兼容（如果Go版本<1.13，需手动实现，否则可省略）
func errorsAs(err error, target interface{}) bool {
	switch x := err.(type) {
	case interface{ Timeout() bool }:
		if t, ok := target.(*interface{ Timeout() bool }); ok {
			*t = x
			return true
		}
	}
	return false
}

// 兼容Go版本的errors.As别名（可选）
var errors = struct {
	As func(error, interface{}) bool
}{
	As: func(err error, target interface{}) bool {
		// 优先用标准库errors.As（Go1.13+），否则用自定义实现
		if err == nil {
			return false
		}
		return errorsAs(err, target)
	},
}