package service

import (
	"AAAnynotes/backend/go/internal/config"
	"AAAnynotes/backend/go/internal/domain/chat/model"
	"fmt"
	"strings"
)

// ModelService provides model-related services
// Simple wrapper around config and model store
type ModelService struct {
	config     *config.Config
	modelStore *model.ModelStore // 🔧 新增：缓存modelStore，避免重复创建
}

// NewModelService creates a new ModelService instance
func NewModelService() *ModelService {
	cfg, err := config.LoadConfig()
	if err != nil {
		// Use empty config as fallback
		cfg = config.GetConfig()
	}
	
	return &ModelService{
		config:     cfg,
		modelStore: model.GetModelStore(), // 初始化时获取全局modelStore
	}
}


// GetEnabledModels returns enabled models with API key availability
func (s *ModelService) GetEnabledModels() model.ModelsResponse {
	// 🔧 移除冗余参数：model.go中已移除hasAPIKeyFunc参数
	return s.modelStore.GetEnabledModels()
}

// GetModelByType returns model configuration by type
func (s *ModelService) GetModelByType(modelType string) *model.ModelConfig {
	return s.modelStore.GetModelByType(modelType)
}

// GetModelByID returns model configuration by model ID
func (s *ModelService) GetModelByID(modelID string) *model.ModelConfig {
	return s.modelStore.GetModelByID(modelID)
}

// GetDefaultModel returns default model configuration
func (s *ModelService) GetDefaultModel() *model.ModelConfig {
	// 🔧 移除冗余参数：GetDefaultModel不再需要传hasAPIKeyFunc
	defaultModelID := s.modelStore.GetDefaultModel()
	
	// Get full model config
	defaultModel := s.modelStore.GetModelByID(defaultModelID)
	if defaultModel == nil {
		// Fallback to kimi
		return s.modelStore.GetModelByType("kimi")
	}
	
	return defaultModel
}

// GetAPIKey returns API key for a specific model
func (s *ModelService) GetAPIKey(modelType string) string {
	return s.config.GetAPIKey(modelType)
}

// GetAllAPIKeys returns all configured API keys
func (s *ModelService) GetAllAPIKeys() map[string]string {
	return s.config.GetAllAPIKeys()
}

// GetAvailableModelNames returns a list of all model types that have API keys
func (s *ModelService) GetAvailableModelNames() []string {
	return s.GetAvailableModels()
}

// HasAPIKey checks if a specific model has an API key configured
func (s *ModelService) HasAPIKey(modelType string) bool {
	return s.config.HasAPIKey(modelType)
}

// ValidateModel checks if a model is available and has an API key
func (s *ModelService) ValidateModel(modelType string) error {
	if !s.config.HasAPIKey(modelType) {
		return fmt.Errorf("no API key configured for model: %s", modelType)
	}
	
	if s.GetModelByType(modelType) == nil {
		return fmt.Errorf("unknown model type: %s", modelType)
	}
	
	return nil
}

// GetModelCapabilities returns capabilities of available models
func (s *ModelService) GetModelCapabilities() map[string]interface{} {
	// 🔧 优化：从modelStore获取可用模型ID，而非直接用config
	availableIDs := s.modelStore.GetAvailableModelIDs()
	allModels := s.modelStore.GetAllModels()
	
	capabilities := make(map[string]interface{})
	for _, m := range allModels {
		// 检查模型是否有API Key（通过ID判断更准确）
		if s.hasModelID(m.ID, availableIDs) {
			capabilities[m.Type] = map[string]interface{}{
				"id":          m.ID,
				"name":        m.Name,
				"provider":    m.Provider,
				"description": m.Description,
				"type":        m.Type,
				"features":    m.Features,
				"maxTokens":   m.MaxTokens,
				"hasApiKey":   s.config.HasAPIKey(m.Type),
				"enabled":     m.Enabled,
			}
		}
	}
	return capabilities
}

// GetConfigSummary returns a summary of current configuration
func (s *ModelService) GetConfigSummary() map[string]interface{} {
	return s.config.GetConfigSummary()
}

// 🔧 新增：按ID检查模型是否可用（替代原有的按Type检查）
func (s *ModelService) hasModelID(modelID string, availableIDs []string) bool {
	for _, id := range availableIDs {
		if strings.EqualFold(id, modelID) {
			return true
		}
	}
	return false
}


// GetAllModels returns all model configurations
func (s *ModelService) GetAllModels() []model.ModelConfig {
	return s.modelStore.GetAllModels()
}

// GetAvailableModelTypes returns list of available model types
// 🔧 备注：和GetAvailableModels逻辑一致，保持接口兼容
func (s *ModelService) GetAvailableModelTypes() []string {
	return s.GetAvailableModels()
}

// GetModelsWithAPIKey returns models that have API keys
func (s *ModelService) GetModelsWithAPIKey() []model.ModelConfig {
	// 🔧 移除冗余参数：GetAvailableModelIDs不再需要传hasAPIKeyFunc
	ids := s.modelStore.GetAvailableModelIDs()
	
	var models []model.ModelConfig
	for _, id := range ids {
		if m := s.modelStore.GetModelByID(id); m != nil {
			models = append(models, *m)
		}
	}
	return models
}

// GetAvailableModels 返回有API Key的模型类型列表
func (s *ModelService) GetAvailableModels() []string {
    ids := s.modelStore.GetAvailableModelIDs()
    fmt.Printf("[DEBUG service] GetAvailableModels：获取到的可用模型ID数量：%d → %+v\n", len(ids), ids)
    
    var types []string
    for _, id := range ids {
        if m := s.modelStore.GetModelByID(id); m != nil {
            types = append(types, m.Type)
            fmt.Printf("[DEBUG service] 可用模型ID=%s → Type=%s\n", id, m.Type)
        }
    }
    fmt.Printf("[DEBUG service] 最终返回的可用模型类型数量：%d → %+v\n", len(types), types)
    return types
}

// GetModelCount returns statistics about loaded models
func (s *ModelService) GetModelCount() map[string]int {
    storeStats := s.modelStore.GetModelCount()
    storeStats["withApiKey"] = len(s.modelStore.GetAvailableModelIDs())
    fmt.Printf("[DEBUG service] 模型统计：%+v\n", storeStats)
    return storeStats
}

// GetAvailableModelIDs returns list of model IDs that have API keys
func (s *ModelService) GetAvailableModelIDs() []string {
	return s.modelStore.GetAvailableModelIDs()
}

// GetModelResponse for API compatibility
func (s *ModelService) GetModelResponse() model.ModelsResponse {
	return s.GetEnabledModels()
}