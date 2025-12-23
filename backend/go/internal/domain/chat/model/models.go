package model

import (
	"AAAnynotes/backend/go/internal/config"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
)

// ModelConfig represents model information from models.json
type ModelConfig struct {
	ID          string             `json:"id"`
	Name        string             `json:"name"`
	Provider    string             `json:"provider"`
	Description string             `json:"description"`
	Type        string             `json:"type"`
	EnvKey      string             `json:"envKey"` // 对应.env中的API Key变量名（如MOONSHOT_API_KEY）
	Enabled     bool               `json:"enabled"`
	MaxTokens   int                `json:"maxTokens"`
	Temperature TemperatureConfig  `json:"temperature"`
	Features    []string           `json:"features"`
}

// TemperatureConfig defines temperature range and default
type TemperatureConfig struct {
	Min     float64 `json:"min"`
	Max     float64 `json:"max"`
	Default float64 `json:"default"`
}

// ModelsConfig represents complete models.json structure
type ModelsConfig struct {
	Models       []ModelConfig         `json:"models"`
	DefaultModel string                `json:"defaultModel"`
	ModelTypes   map[string]ModelTypeInfo `json:"modelTypes"`
	Categories   map[string]CategoryInfo  `json:"categories"`
}

// ModelTypeInfo contains metadata about model types
type ModelTypeInfo struct {
	Category        string   `json:"category"`
	Region          string   `json:"region"`
	LanguageSupport []string `json:"languageSupport"`
}

// CategoryInfo describes model categories
type CategoryInfo struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// ModelsResponse represents response for models endpoint
type ModelsResponse struct {
	Models       []ModelConfig `json:"models"`
	DefaultModel string        `json:"defaultModel"`
}

// ModelStore integrated model lookup table using config
type ModelStore struct {
	config        *config.Config
	fullConfig    ModelsConfig       // 🔧 新增：存储完整的models.json配置
	models        map[string]ModelConfig  // model.ID (小写) -> config（更通用的key）
	modelsByType  map[string]ModelConfig  // model.Type (小写) -> config（兼容原有逻辑）
	mu            sync.RWMutex
}

var globalStore *ModelStore
var once sync.Once

// GetModelStore returns global model store instance
func GetModelStore() *ModelStore {
	once.Do(func() {
		globalStore = NewModelStore()
	})
	return globalStore
}

// NewModelStore creates a new model store instance
func NewModelStore() *ModelStore {
    cfg, err := config.LoadConfig()
    if err != nil {
        fmt.Printf("[DEBUG model] ModelStore初始化：加载config失败 - %v\n", err)
        cfg = config.GetConfig()
    }

    store := &ModelStore{
        config:       cfg,
        fullConfig:   ModelsConfig{},
        models:       make(map[string]ModelConfig),
        modelsByType: make(map[string]ModelConfig),
    }

    // 加载模型配置
    if err := store.loadModelsFromConfig(); err != nil {
        fmt.Printf("[DEBUG model] ModelStore初始化：加载模型配置失败 - %v\n", err)
    } else {
        // 🔧 新增：打印初始化后的模型数量
        fmt.Printf("[DEBUG model] ModelStore初始化完成，模型数量：%d\n", len(store.models))
    }

    return store
}

// loadModelsFromConfig loads models data from the config system
func (s *ModelStore) loadModelsFromConfig() error {
    s.mu.Lock()
    defer s.mu.Unlock()

    // 1. 获取config中的modelsData
    modelsData := s.config.GetModelsData()
    // 🔧 新增：打印原始modelsData
    fmt.Printf("[DEBUG model] 从config获取的modelsData：%+v（长度：%d）\n", modelsData, len(modelsData))
    if len(modelsData) == 0 {
        fmt.Printf("[DEBUG model] modelsData为空！\n")
        return fmt.Errorf("config中未加载到models.json数据")
    }

    // 2. 序列化+反序列化
    rawJSON, err := json.Marshal(modelsData)
    if err != nil {
        fmt.Printf("[DEBUG model] 序列化modelsData失败：%v\n", err)
        return fmt.Errorf("序列化models数据失败: %w", err)
    }
    // 🔧 新增：打印序列化后的JSON字符串
    fmt.Printf("[DEBUG model] 序列化后的models JSON：%s\n", string(rawJSON))

    var fullConfig ModelsConfig
    if err := json.Unmarshal(rawJSON, &fullConfig); err != nil {
        fmt.Printf("[DEBUG model] 反序列化ModelsConfig失败：%v\n", err)
        return fmt.Errorf("反序列化ModelsConfig失败: %w", err)
    }
    // 🔧 新增：打印解析后的完整配置
    fmt.Printf("[DEBUG model] 解析后的ModelsConfig：%+v\n", fullConfig)
    fmt.Printf("[DEBUG model] 解析出的模型数量：%d\n", len(fullConfig.Models))
    s.fullConfig = fullConfig

    // 3. 构建索引
    for _, model := range fullConfig.Models {
        modelIDLower := strings.ToLower(model.ID)
        modelTypeLower := strings.ToLower(model.Type)

        if model.EnvKey != "" && s.config.HasAPIKey(strings.TrimSuffix(model.EnvKey, "_API_KEY")) {
            model.Enabled = true
        }

        s.models[modelIDLower] = model
        s.modelsByType[modelTypeLower] = model
        // 🔧 新增：打印每个加载的模型
        fmt.Printf("[DEBUG model] 加载模型：ID=%s, Type=%s, Enabled=%t\n", model.ID, model.Type, model.Enabled)
    }

    fmt.Printf("[DEBUG model] 最终存储的模型数量（按ID）：%d，（按Type）：%d\n", len(s.models), len(s.modelsByType))
    return nil
}

// LoadModels loads models into the store
func (s *ModelStore) LoadModels(models []ModelConfig) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// 清空现有索引
	s.models = make(map[string]ModelConfig)
	s.modelsByType = make(map[string]ModelConfig)

	// 重新构建索引
	for _, model := range models {
		modelIDLower := strings.ToLower(model.ID)
		modelTypeLower := strings.ToLower(model.Type)

		// 保留原有kimi特殊逻辑（兼容）
		if modelTypeLower == "kimi" && s.config.HasAPIKey("kimi") {
			model.Enabled = true
		}

		s.models[modelIDLower] = model
		s.modelsByType[modelTypeLower] = model
	}

	// 更新完整配置的models数组
	s.fullConfig.Models = models
}

// GetAllModels returns all loaded models
func (s *ModelStore) GetAllModels() []ModelConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var models []ModelConfig
	for _, model := range s.models {
		models = append(models, model)
	}
	return models
}

// GetEnabledModels returns enabled models with API key availability
func (s *ModelStore) GetEnabledModels() ModelsResponse { // 🔧 简化：移除冗余的hasAPIKeyFunc参数
	s.mu.RLock()
	defer s.mu.RUnlock()

	var enabledModels []ModelConfig
	for _, model := range s.models {
		// 启用条件：配置enabled=true 或 有对应的API Key
		if model.Enabled || (model.EnvKey != "" && s.config.HasAPIKey(strings.TrimSuffix(model.EnvKey, "_API_KEY"))) {
			enabledModels = append(enabledModels, model)
		}
	}

	defaultModel := s.GetDefaultModel()

	return ModelsResponse{
		Models:       enabledModels,
		DefaultModel: defaultModel,
	}
}

// GetModelByType returns model configuration by type
func (s *ModelStore) GetModelByType(modelType string) *ModelConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()

	modelTypeLower := strings.ToLower(modelType)
	if model, exists := s.modelsByType[modelTypeLower]; exists {
		return &model
	}
	return nil
}

// GetModelByID returns model configuration by model ID
func (s *ModelStore) GetModelByID(modelID string) *ModelConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()

	modelIDLower := strings.ToLower(modelID)
	if model, exists := s.models[modelIDLower]; exists {
		return &model
	}
	return nil
}

// GetDefaultModel returns default model (优先用config配置，再用models.json，最后兜底)
func (s *ModelStore) GetDefaultModel() string {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// 1. 优先使用config.go中.env配置的DefaultModel
	configDefault := s.config.GetDefaultModelID()
	if configDefault != "" {
		if model := s.GetModelByID(configDefault); model != nil {
			return model.ID
		}
		fmt.Printf("警告：config中配置的DefaultModel %s 不存在，降级使用models.json配置\n", configDefault)
	}

	// 2. 降级使用models.json中的defaultModel
	if s.fullConfig.DefaultModel != "" {
		if model := s.GetModelByID(s.fullConfig.DefaultModel); model != nil {
			return model.ID
		}
		fmt.Printf("警告：models.json中配置的DefaultModel %s 不存在，降级使用kimi\n", s.fullConfig.DefaultModel)
	}

	// 3. 最后兜底（兼容原有逻辑）
	if kimiModel := s.GetModelByType("kimi"); kimiModel != nil && s.config.HasAPIKey("kimi") {
		return kimiModel.ID
	}

	// 4. 终极兜底：返回第一个可用模型
	for _, model := range s.models {
		if model.Enabled || (model.EnvKey != "" && s.config.HasAPIKey(strings.TrimSuffix(model.EnvKey, "_API_KEY"))) {
			return model.ID
		}
	}

	return "kimi-k2-turbo-preview"
}

// GetAvailableModelIDs returns list of model IDs that have API keys
func (s *ModelStore) GetAvailableModelIDs() []string { // 🔧 简化：移除冗余参数
	s.mu.RLock()
	defer s.mu.RUnlock()

	var modelIDs []string
	for _, model := range s.models {
		// 根据EnvKey判断API Key是否存在
		if model.EnvKey != "" && s.config.HasAPIKey(strings.TrimSuffix(model.EnvKey, "_API_KEY")) {
			modelIDs = append(modelIDs, model.ID)
		}
	}
	return modelIDs
}

// UpdateModelStatus updates enabled status of a model
func (s *ModelStore) UpdateModelStatus(modelID string, enabled bool) error { // 🔧 改为按ID更新（更准确）
	s.mu.Lock()
	defer s.mu.Unlock()

	modelIDLower := strings.ToLower(modelID)
	if model, exists := s.models[modelIDLower]; exists {
		model.Enabled = enabled
		s.models[modelIDLower] = model
		// 同步更新按Type索引的模型
		modelTypeLower := strings.ToLower(model.Type)
		s.modelsByType[modelTypeLower] = model
		// 同步更新fullConfig中的模型
		for i, m := range s.fullConfig.Models {
			if strings.ToLower(m.ID) == modelIDLower {
				s.fullConfig.Models[i].Enabled = enabled
				break
			}
		}
		return nil
	}
	return fmt.Errorf("model ID not found: %s", modelID)
}

// GetModelCount returns statistics about loaded models
func (s *ModelStore) GetModelCount() map[string]int {
	s.mu.RLock()
	defer s.mu.RUnlock()

	enabledCount := 0
	for _, model := range s.models {
		if model.Enabled || (model.EnvKey != "" && s.config.HasAPIKey(strings.TrimSuffix(model.EnvKey, "_API_KEY"))) {
			enabledCount++
		}
	}

	return map[string]int{
		"total":   len(s.models),
		"enabled": enabledCount, // 实际计算启用数量
	}
}

// SearchModels searches models by name, provider, or description
func (s *ModelStore) SearchModels(query string) []ModelConfig { // 🔧 简化：移除冗余参数
	s.mu.RLock()
	defer s.mu.RUnlock()

	var results []ModelConfig
	queryLower := strings.ToLower(query)

	for _, model := range s.models {
		// 只包含有API Key的模型
		if model.EnvKey != "" && s.config.HasAPIKey(strings.TrimSuffix(model.EnvKey, "_API_KEY")) {
			if strings.Contains(strings.ToLower(model.Name), queryLower) ||
				strings.Contains(strings.ToLower(model.Provider), queryLower) ||
				strings.Contains(strings.ToLower(model.Description), queryLower) {
				results = append(results, model)
			}
		}
	}
	return results
}

// Reload reloads models from config
func (s *ModelStore) Reload() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// 先重新加载config（确保models.json数据最新）
	if err := s.config.ReloadConfig(); err != nil {
		return fmt.Errorf("重新加载config失败: %w", err)
	}

	// 重新加载模型配置
	return s.loadModelsFromConfig()
}

// 🔧 新增：获取完整的ModelsConfig（包含modelTypes/categories）
func (s *ModelStore) GetFullConfig() ModelsConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.fullConfig
}

// 🔧 新增：获取模型类型元信息
func (s *ModelStore) GetModelTypeInfo(modelType string) (ModelTypeInfo, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	info, exists := s.fullConfig.ModelTypes[strings.ToLower(modelType)]
	return info, exists
}

// 🔧 新增：获取分类信息
func (s *ModelStore) GetCategoryInfo(category string) (CategoryInfo, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	info, exists := s.fullConfig.Categories[strings.ToLower(category)]
	return info, exists
}