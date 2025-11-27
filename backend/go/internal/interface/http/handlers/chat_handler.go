package handlers

import (
	"AAAnynotes/backend/go/internal/domain/chat/model"
	"AAAnynotes/backend/go/internal/infrastructure/grpc"
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// ChatStream 处理前端的大模型流式对话请求（修正版）
func ChatStream(c *gin.Context) {
	fmt.Println("收到前端请求")
	// 1. 解析前端请求参数
	var req model.ChatStreamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// 注意：流式响应的错误返回需用 c.String，避免 JSON 与 SSE 格式冲突
		c.String(http.StatusBadRequest, "data: %s\n\n", jsonEscape(`{"error":"无效的请求参数: `+err.Error()+`"}`))
		return
	}

	// 2. 转发请求到 Python 服务，获取流式响应
	pythonRespBody, err := grpc.SendChatStream(req)
	if err != nil {
		c.String(http.StatusInternalServerError, "data: %s\n\n", jsonEscape(`{"error":"调用模型服务失败: `+err.Error()+`"}`))
		return
	}
	defer pythonRespBody.Close() // 确保资源释放

	// 3. 配置 SSE + 流式响应头（关键：补充缺失的分块编码）
	c.Header("Content-Type", "text/event-stream; charset=utf-8")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked") // 显式开启分块传输（核心）
	c.Header("X-Accel-Buffering", "no")      // 禁用 Nginx 代理缓冲
	c.Status(http.StatusOK)                  // 先返回 200 状态码

	// 4. 获取 Gin 响应的 Flusher（核心：刷新缓冲区）
	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.String(http.StatusInternalServerError, "data: %s\n\n", jsonEscape(`{"error":"服务器不支持流式响应"}`))
		return
	}

	// 5. 监听客户端断开连接（核心：及时终止循环）
	clientQuit := c.Request.Context().Done()

	// 6. 读取 Python 流式响应，透传给前端（补充完整推送逻辑）
	scanner := bufio.NewScanner(pythonRespBody)
	fmt.Println("📤 开始读取 Python 流式响应...")

	for scanner.Scan() {
		// 优先检查：客户端是否断开连接（如前端取消请求）
		select {
		case <-clientQuit:
			fmt.Println("⚠️ 客户端断开连接，终止流式推送")
			return
		default:
		}

		// 打印 Python 返回的原始数据（调试用）
		rawData := scanner.Text()
		fmt.Printf("📥 收到 Python 原始数据：%s\n", rawData)
		if strings.TrimSpace(rawData) == "" {
			continue // 跳过空行
		}

		// 解析 Python 返回的 StreamChunk
		var chunk model.StreamChunk
		if err := json.Unmarshal(scanner.Bytes(), &chunk); err != nil {
			errMsg := fmt.Sprintf(`{"error":"解析模型响应失败: %v","rawData":"%s"}`, err, jsonEscape(rawData))
			c.Writer.Write([]byte("data: " + jsonEscape(errMsg) + "\n\n"))
			flusher.Flush()
			fmt.Printf("❌ 解析 Python 响应失败: %v | 原始数据：%s\n", err, rawData)
			continue
		}

		// 日志：确认解析成功
		fmt.Printf("✅ 解析后的数据：%+v\n", chunk)

		// 核心：将 chunk 转为 SSE 格式推送给前端（关键缺失的逻辑）
		chunkJSON, err := json.Marshal(chunk)
		if err != nil {
			errMsg := fmt.Sprintf(`{"error":"序列化响应失败: %v"}`, err)
			c.Writer.Write([]byte("data: " + jsonEscape(errMsg) + "\n\n"))
		} else {
			// SSE 规范格式：data: JSON字符串\n\n
			c.Writer.Write([]byte("data: " + string(chunkJSON) + "\n\n"))
		}

		// 强制刷新缓冲区，立即发送数据给前端（核心）
		flusher.Flush()
	}

	// 处理扫描错误
	if err := scanner.Err(); err != nil {
		errMsg := fmt.Sprintf(`{"error":"读取模型响应失败: %v"}`, err)
		c.Writer.Write([]byte("data: " + jsonEscape(errMsg) + "\n\n"))
		flusher.Flush()
		fmt.Printf("❌ 扫描 Python 响应失败: %v\n", err)
	} else {
		// 流式结束：推送 finished=true 的标识
		endChunk := model.StreamChunk{Finished: true}
		endJSON, _ := json.Marshal(endChunk)
		c.Writer.Write([]byte("data: " + string(endJSON) + "\n\n"))
		flusher.Flush()
		fmt.Println("📌 流式响应推送完成")
	}
}

// 辅助函数：转义 JSON 中的特殊字符（避免 SSE 格式错误）
func jsonEscape(s string) string {
	b, err := json.Marshal(s)
	if err != nil {
		return s
	}
	return string(b)[1 : len(b)-1] // 去掉首尾的引号
}