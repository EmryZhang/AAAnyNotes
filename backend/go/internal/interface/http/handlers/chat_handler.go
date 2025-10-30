package handlers

import (
	"AAAnynotes/backend/go/internal/domain/chat/model"
	"AAAnynotes/backend/go/internal/infrastructure/grpc"
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ChatStream 处理前端的大模型流式对话请求
func ChatStream(c *gin.Context) {
	fmt.Print("收到前端请求")
	// 1. 解析前端请求参数
	var req model.ChatStreamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求参数: " + err.Error()})
		return
	}

	// 2. 转发请求到 Python 服务，获取流式响应
	pythonRespBody, err := grpc.SendChatStream(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "调用模型服务失败: " + err.Error()})
		return
	}
	defer pythonRespBody.Close() // 确保资源释放

	// 3. 配置 SSE 响应头（流式输出给前端）
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no") // 禁用代理缓冲

	// 4. 读取 Python 流式响应，透传给前端（SSE 格式）
	scanner := bufio.NewScanner(pythonRespBody)
	for scanner.Scan() {
		// 解析 Python 返回的单块数据
		var chunk model.StreamChunk
		if err := json.Unmarshal(scanner.Bytes(), &chunk); err != nil {
			fmt.Printf("解析 Python 响应失败: %v\n", err)
			continue
		}

		// 转换为 SSE 格式: data: {json}\n\n
		sseData, _ := json.Marshal(chunk)
		if _, err := fmt.Fprintf(c.Writer, "data: %s\n\n", sseData); err != nil {
			fmt.Printf("向前端发送数据失败: %v\n", err)
			return
		}
		c.Writer.Flush() // 实时推送

		// 检查前端是否断开连接
		if c.Request.Context().Err() != nil {
			fmt.Println("前端已断开连接")
			return
		}

		// 若为最后一块数据，终止循环
		if chunk.Finished {
			break
		}
	}

	// 处理扫描错误
	if err := scanner.Err(); err != nil {
		fmt.Printf("读取 Python 流式响应失败: %v\n", err)
	}
}