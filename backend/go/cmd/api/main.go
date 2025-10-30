package main

import (
	"AAAnynotes/backend/go/internal/interface/http"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化 Gin 引擎
	r := gin.Default()

	// 注册路由
	http.SetupRoutes(r)

	// 启动服务（监听 8080 端口）
	log.Println("Go 接入层服务启动，端口: 8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("服务启动失败: %v", err)
	}
}