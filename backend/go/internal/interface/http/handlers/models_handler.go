package handlers

import (
	"AAAnynotes/backend/go/internal/domain/chat/service"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

var modelService = service.NewModelService()

// GetModels handles GET /api/chat/models requests
// Returns available AI models with their configurations
func GetModels(c *gin.Context) {
	fmt.Println("Go: Processing models request")
	
	// Get enabled models from service
	response := modelService.GetEnabledModels()
	
	fmt.Printf("Go: Found %d enabled models\n", len(response.Models))
	fmt.Printf("Go: Default model: %s\n", response.DefaultModel)
	
	// Return successful response
	c.JSON(http.StatusOK, response)
}

// GetModelHealth handles GET /api/chat/health requests
// Returns health status and model availability
func GetModelHealth(c *gin.Context) {
	fmt.Println("Go: Processing model health request")
	
	// Get model availability
	available := modelService.GetAvailableModels()
	
	// Return health response
	c.JSON(http.StatusOK, gin.H{
		"status":           "healthy",
		"service":          "Chat Service",
		"available_models": available,
	})
}
