package model

import (
	"AAAnynotes/backend/go/internal/config"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
)

// ModelConfig represents the detailed configuration of a single AI model from models.json
type ModelConfig struct {
	ID          string             `json:"id"`          // Unique identifier of the model
	Name        string             `json:"name"`        // Human-readable name of the model
	Provider    string             `json:"provider"`    // Provider of the model (e.g., OpenAI, Moonshot)
	Description string             `json:"description"` // Detailed description of the model's usage scenarios
	Type        string             `json:"type"`        // Type classification of the model (e.g., kimi, gpt)
	EnvKey      string             `json:"envKey"`      // Corresponding environment variable prefix for API Key (e.g., MOONSHOT for MOONSHOT_API_KEY)
	Enabled     bool               `json:"enabled"`     // Whether the model is available for use
	MaxTokens   int                `json:"maxTokens"`   // Maximum token limit for the model's response
	Temperature TemperatureConfig  `json:"temperature"` // Temperature range and default value for text generation
	Features    []string           `json:"features"`    // Additional features supported by the model
	Online      bool               `json:"online"`      // Whether the model is online and accessible
}

// TemperatureConfig defines the valid range and default value of the temperature parameter
// Temperature affects the randomness of the model's output (lower = more deterministic, higher = more creative)
type TemperatureConfig struct {
	Min     float64 `json:"min"`     // Minimum acceptable temperature value
	Max     float64 `json:"max"`     // Maximum acceptable temperature value
	Default float64 `json:"default"` // Default temperature value used when not specified
}

// ModelsConfig represents the complete root structure of the models.json configuration file
type ModelsConfig struct {
	Models       []ModelConfig         `json:"models"`        // List of all available AI models
	DefaultModel string                `json:"defaultModel"`  // Default model ID used when no specific model is specified
	ModelTypes   map[string]ModelTypeInfo `json:"modelTypes"` // Metadata information for each model type
	Categories   map[string]CategoryInfo  `json:"categories"` // Detailed information for each model category
}

// ModelTypeInfo contains the metadata and additional attributes of a specific model type
type ModelTypeInfo struct {
	Category        string   `json:"category"`        // Category that the model type belongs to
	Region          string   `json:"region"`          // Service region of the model type
	LanguageSupport []string `json:"languageSupport"` // List of languages supported by the model type
}

// CategoryInfo describes the basic information of a model category for classification and display
type CategoryInfo struct {
	Name        string `json:"name"`        // Human-readable name of the category
	Description string `json:"description"` // Detailed description of the category
}

// ModelsResponse represents the API response structure for the models query endpoint
// It contains only the core information required by the frontend/client
type ModelsResponse struct {
	Models       []ModelConfig `json:"models"`       // List of available (enabled) models
	DefaultModel string        `json:"defaultModel"` // Current default model ID
}

// ModelStore is a thread-safe storage manager for AI model configurations
// It maintains indexes for fast query by model ID and type, and caches the full configuration
type ModelStore struct {
	config        *config.Config                      // Global application configuration
	fullConfig    ModelsConfig                        // Full parsed configuration from models.json
	models        map[string]ModelConfig              // Index: lowercase model ID -> ModelConfig (one-to-one)
	modelsByType  map[string][]ModelConfig            // Index: lowercase model type -> []ModelConfig (one-to-many, fixes original coverage issue)
	mu            sync.RWMutex                        // Read-write lock for thread-safe access
}

// Global singleton instances and initialization guard
var (
	globalStore *ModelStore
	once        sync.Once
)

// GetModelStore returns the global singleton instance of ModelStore
// It ensures only one instance is created throughout the application lifecycle
func GetModelStore() *ModelStore {
	once.Do(func() {
		globalStore = NewModelStore()
	})
	return globalStore
}

// NewModelStore creates a new instance of ModelStore and initializes it with configuration data
// It falls back to the existing global config if loading new config fails
func NewModelStore() *ModelStore {
	// Load application configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		fmt.Printf("[DEBUG model] ModelStore initialization: failed to load new config - %v\n", err)
		cfg = config.GetConfig() // Fallback to existing global config
	}

	// Initialize ModelStore with empty indexes
	store := &ModelStore{
		config:       cfg,
		fullConfig:   ModelsConfig{},
		models:       make(map[string]ModelConfig),
		modelsByType: make(map[string][]ModelConfig),
	}

	// Load and parse model configuration from config system
	if err := store.loadModelsFromConfig(); err != nil {
		fmt.Printf("[DEBUG model] ModelStore initialization: failed to load model config - %v\n", err)
	} else {
		fmt.Printf("[DEBUG model] ModelStore initialization completed, total models loaded: %d\n", len(store.models))
	}

	return store
}

// loadModelsFromConfig loads and parses model data from the global config system
// It handles JSON serialization/deserialization and builds the query indexes
func (s *ModelStore) loadModelsFromConfig() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Step 1: Retrieve raw models data from config
	modelsData := s.config.GetModelsData()
	fmt.Printf("[DEBUG model] Retrieved modelsData from config (length: %d)\n", len(modelsData))
	if len(modelsData) == 0 {
		fmt.Printf("[DEBUG model] modelsData is empty\n")
		return fmt.Errorf("models.json data not loaded in config")
	}

	// Step 2: Serialize raw data to JSON bytes (for subsequent deserialization)
	rawJSON, err := json.Marshal(modelsData)
	if err != nil {
		fmt.Printf("[DEBUG model] Failed to marshal modelsData - %v\n", err)
		return fmt.Errorf("failed to marshal models data: %w", err)
	}

	// Step 3: Deserialize JSON bytes to ModelsConfig struct
	var fullConfig ModelsConfig
	if err := json.Unmarshal(rawJSON, &fullConfig); err != nil {
		fmt.Printf("[DEBUG model] Failed to unmarshal to ModelsConfig - %v\n", err)
		return fmt.Errorf("failed to unmarshal to ModelsConfig: %w", err)
	}

	fmt.Printf("[DEBUG model] Parsed ModelsConfig, total models: %d\n", len(fullConfig.Models))
	s.fullConfig = fullConfig

	// Step 4: Build indexes (models by ID, models by type)
	for _, model := range fullConfig.Models {
		modelIDLower := strings.ToLower(model.ID)
		modelTypeLower := strings.ToLower(model.Type)

		// Enable model automatically if corresponding API Key exists in environment
		if model.EnvKey != "" {
			apiKeyPrefix := strings.TrimSuffix(model.EnvKey, "_API_KEY")
			if s.config.HasAPIKey(apiKeyPrefix) {
				model.Enabled = true
			}
		}

		// Build one-to-one index by model ID
		s.models[modelIDLower] = model

		// Build one-to-many index by model type (fix original coverage issue)
		s.modelsByType[modelTypeLower] = append(s.modelsByType[modelTypeLower], model)

		fmt.Printf("[DEBUG model] Loaded model: ID=%s, Type=%s, Enabled=%t\n", model.ID, model.Type, model.Enabled)
	}

	fmt.Printf("[DEBUG model] Final index status - models by ID: %d, models by type: %d\n", len(s.models), len(s.modelsByType))
	return nil
}

// LoadModels manually loads a list of ModelConfig into the store, overwriting existing data
// It maintains the same index structure as loadModelsFromConfig
func (s *ModelStore) LoadModels(models []ModelConfig) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Clear existing indexes
	s.models = make(map[string]ModelConfig)
	s.modelsByType = make(map[string][]ModelConfig)

	// Rebuild indexes with new models data
	for _, model := range models {
		modelIDLower := strings.ToLower(model.ID)
		modelTypeLower := strings.ToLower(model.Type)

		// Special handling for "kimi" type: enable if API Key exists
		if modelTypeLower == "kimi" && s.config.HasAPIKey("kimi") {
			model.Enabled = true
		}

		// Update one-to-one ID index
		s.models[modelIDLower] = model

		// Update one-to-many type index
		s.modelsByType[modelTypeLower] = append(s.modelsByType[modelTypeLower], model)
	}

	// Update full config's models list
	s.fullConfig.Models = models
}

// GetAllModels returns all loaded models (regardless of enabled status)
// The returned slice is a copy to avoid external modification of internal data
func (s *ModelStore) GetAllModels() []ModelConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var models []ModelConfig
	for _, model := range s.models {
		models = append(models, model)
	}
	return models
}

// GetEnabledModels returns a response containing all online/enabled models and the default model
// Models are filtered by their Online status (marked as accessible)
func (s *ModelStore) GetEnabledModels() ModelsResponse {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var enabledModels []ModelConfig
	for _, model := range s.models {
		// Filter condition: model is marked as online (accessible)
		if model.Online {
			enabledModels = append(enabledModels, model)
		}
	}

	return ModelsResponse{
		Models:       enabledModels,
		DefaultModel: s.GetDefaultModel(),
	}
}

// GetModelByType returns the first available ModelConfig of the specified type (case-insensitive)
// Returns nil if no model of the specified type exists
func (s *ModelStore) GetModelByType(modelType string) *ModelConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()

	modelTypeLower := strings.ToLower(modelType)
	models, exists := s.modelsByType[modelTypeLower]
	if exists && len(models) > 0 {
		return &models[0] // Return the first model of the type (compatible with original logic)
	}
	return nil
}

// GetModelByID returns the ModelConfig of the specified ID (case-insensitive)
// Returns nil if the model ID does not exist
func (s *ModelStore) GetModelByID(modelID string) *ModelConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()

	modelIDLower := strings.ToLower(modelID)
	model, exists := s.models[modelIDLower]
	if exists {
		return &model
	}
	return nil
}

// GetDefaultModel returns the current default model ID with priority fallback logic
// Priority: 1. Config's default model -> 2. models.json's default model -> 3. Kimi model (if available) -> 4. First enabled model -> 5. Fallback ID
func (s *ModelStore) GetDefaultModel() string {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Step 1: Prioritize default model from environment config
	configDefault := s.config.GetDefaultModelID()
	if configDefault != "" {
		if s.GetModelByID(configDefault) != nil {
			return configDefault
		}
		fmt.Printf("Warning: Default model %s from config does not exist, falling back to models.json config\n", configDefault)
	}

	// Step 2: Fallback to default model from models.json
	if s.fullConfig.DefaultModel != "" {
		if s.GetModelByID(s.fullConfig.DefaultModel) != nil {
			return s.fullConfig.DefaultModel
		}
		fmt.Printf("Warning: Default model %s from models.json does not exist, falling back to kimi model\n", s.fullConfig.DefaultModel)
	}

	// Step 3: Fallback to Kimi model (if API Key exists)
	if kimiModel := s.GetModelByType("kimi"); kimiModel != nil && s.config.HasAPIKey("kimi") {
		return kimiModel.ID
	}

	// Step 4: Fallback to the first available (enabled or with API Key) model
	for _, model := range s.models {
		apiKeyAvailable := model.EnvKey != "" && s.config.HasAPIKey(strings.TrimSuffix(model.EnvKey, "_API_KEY"))
		if model.Enabled || apiKeyAvailable {
			return model.ID
		}
	}

	// Step 5: Final fallback (default hardcoded ID)
	return "kimi-k2-turbo-preview"
}

// GetAvailableModelIDs returns a list of model IDs whose `online` field is true
// These models are considered "available" (online and accessible) for use
func (s *ModelStore) GetAvailableModelIDs() []string {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var modelIDs []string
	for _, model := range s.models {
		// 判断逻辑：仅保留 online 字段为 true 的模型
		if model.Online {
			modelIDs = append(modelIDs, model.ID)
		}
	}
	return modelIDs
}

// UpdateModelStatus updates the enabled status of a specific model by ID (case-insensitive)
// It synchronously updates the ID index, type index, and full config to maintain data consistency
func (s *ModelStore) UpdateModelStatus(modelID string, enabled bool) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	modelIDLower := strings.ToLower(modelID)
	existingModel, exists := s.models[modelIDLower]
	if !exists {
		return fmt.Errorf("model ID not found: %s", modelID)
	}

	// Update the model's enabled status
	updatedModel := existingModel
	updatedModel.Enabled = enabled

	// 1. Update ID index
	s.models[modelIDLower] = updatedModel

	// 2. Update type index (rebuild the slice for the model's type to maintain consistency)
	modelTypeLower := strings.ToLower(updatedModel.Type)
	var updatedTypeModels []ModelConfig
	for _, m := range s.modelsByType[modelTypeLower] {
		if strings.ToLower(m.ID) == modelIDLower {
			updatedTypeModels = append(updatedTypeModels, updatedModel)
		} else {
			updatedTypeModels = append(updatedTypeModels, m)
		}
	}
	s.modelsByType[modelTypeLower] = updatedTypeModels

	// 3. Update full config's models list
	for i, m := range s.fullConfig.Models {
		if strings.ToLower(m.ID) == modelIDLower {
			s.fullConfig.Models[i].Enabled = enabled
			break
		}
	}

	return nil
}

// GetModelCount returns statistical data about the loaded models (total and enabled counts)
// Enabled count includes models marked as enabled or with valid API Keys
func (s *ModelStore) GetModelCount() map[string]int {
	s.mu.RLock()
	defer s.mu.RUnlock()

	enabledCount := 0
	for _, model := range s.models {
		apiKeyAvailable := model.EnvKey != "" && s.config.HasAPIKey(strings.TrimSuffix(model.EnvKey, "_API_KEY"))
		if model.Enabled || apiKeyAvailable {
			enabledCount++
		}
	}

	return map[string]int{
		"total":   len(s.models),
		"enabled": enabledCount,
	}
}

// SearchModels searches for available models (with valid API Keys) by query string
// It matches the query against model's name, provider, and description (case-insensitive)
func (s *ModelStore) SearchModels(query string) []ModelConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var results []ModelConfig
	queryLower := strings.ToLower(query)

	for _, model := range s.models {
		// Only include models with valid API Keys
		if model.EnvKey == "" {
			continue
		}
		apiKeyPrefix := strings.TrimSuffix(model.EnvKey, "_API_KEY")
		if !s.config.HasAPIKey(apiKeyPrefix) {
			continue
		}

		// Match query against target fields
		modelNameLower := strings.ToLower(model.Name)
		modelProviderLower := strings.ToLower(model.Provider)
		modelDescLower := strings.ToLower(model.Description)
		if strings.Contains(modelNameLower, queryLower) ||
			strings.Contains(modelProviderLower, queryLower) ||
			strings.Contains(modelDescLower, queryLower) {
			results = append(results, model)
		}
	}

	return results
}

// Reload reloads the model configuration from the config system (including fresh models.json data)
// It first reloads the global config to ensure the latest data is used
func (s *ModelStore) Reload() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Reload global config first to get the latest models.json data
	if err := s.config.ReloadConfig(); err != nil {
		return fmt.Errorf("failed to reload config: %w", err)
	}

	// Reload model configuration from the updated config
	return s.loadModelsFromConfig()
}

// GetFullConfig returns the full parsed ModelsConfig (including ModelTypes and Categories)
// The returned value is a copy to prevent external modification of internal state
func (s *ModelStore) GetFullConfig() ModelsConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.fullConfig
}

// GetModelTypeInfo returns the metadata information of a specific model type (case-insensitive)
// The second return value indicates whether the model type exists
func (s *ModelStore) GetModelTypeInfo(modelType string) (ModelTypeInfo, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	info, exists := s.fullConfig.ModelTypes[strings.ToLower(modelType)]
	return info, exists
}

// GetCategoryInfo returns the detailed information of a specific model category (case-insensitive)
// The second return value indicates whether the category exists
func (s *ModelStore) GetCategoryInfo(category string) (CategoryInfo, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	info, exists := s.fullConfig.Categories[strings.ToLower(category)]
	return info, exists
}