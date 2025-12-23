package http

import (
	"AAAnynotes/backend/go/internal/interface/http/handlers"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRoutes registers all HTTP routes
func SetupRoutes(r *gin.Engine) {
	// Configure CORS (allow frontend cross-origin requests)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // frontend address
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Register API routes
	api := r.Group("/api")
	{
		chat := api.Group("/chat")
		{
			chat.POST("/stream", handlers.ChatStream)    // AI model streaming chat endpoint
			chat.GET("/models", handlers.GetModels)       // Get available AI models endpoint
			chat.GET("/health", handlers.GetModelHealth)  // Chat service health check endpoint
		}
	}
}
