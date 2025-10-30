package http

import (
	"AAAnynotes/backend/go/internal/interface/http/handlers"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRoutes 注册所有 HTTP 路由
func SetupRoutes(r *gin.Engine) {
	// 配置 CORS（允许前端跨域请求）
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // 前端地址
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 注册 API 路由
	api := r.Group("/api")
	{
		chat := api.Group("/chat")
		{
			chat.POST("/stream", handlers.ChatStream) // 大模型流式对话接口
		}
	}
}