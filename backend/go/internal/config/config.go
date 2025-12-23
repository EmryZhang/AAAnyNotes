package config

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
)

// Config holds application configuration
type Config struct {
	// API keys storage - dynamic map for any number of models
	apiKeys map[string]string
	mu      sync.RWMutex
	
	// 🔧 新增：存储models.json解析后的数据（原代码未保存）
	modelsData map[string]interface{}
	
	// Other configuration settings from .env
	Debug        bool
	LogLevel     string
	DefaultModel string
	
	// Service settings
	PortGo     string
	PortPython string
	FrontendURL string
	
	// Database settings
	DBHost     string
	DBPort     string
	DBName     string
	DBUser     string
	DBPassword string
	
	// Security settings
	JWTSecret      string
	EncryptionKey string
	
	// External service URLs
	PythonAPIURL string
	GoAPIURL     string
}

var globalConfig *Config
var once sync.Once

// GetProjectRoot 自动定位项目根目录（特征：根目录包含config文件夹，且config/.env存在）
func GetProjectRoot() (string, error) {
	// 1. 获取当前代码文件（config.go）的绝对路径（不是可执行文件！）
	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		fmt.Println("[DEBUG GetProjectRoot] 警告：获取代码文件路径失败，降级使用可执行文件路径")
		exePath, err := os.Executable()
		if err != nil {
			return "", fmt.Errorf("获取代码文件路径失败+可执行文件路径失败: %w", err)
		}
		currentFile = exePath
	}

	// 2. 拿到代码文件所在的目录（比如：AAAnynotes/backend/go/internal/config）
	currentDir := filepath.Dir(currentFile)

	for i := 0; i < 20; i++ { // 限制最大遍历层数（防止无限循环）
		configDir := filepath.Join(currentDir, "config")
		envFilePath := filepath.Join(configDir, ".env")

		if _, err := os.Stat(envFilePath); err == nil {
			fmt.Printf("[DEBUG GetProjectRoot] ✅ 找到项目根目录：%s（存在config/.env）\n", currentDir)
			return currentDir, nil
		}
		parentDir := filepath.Dir(currentDir)
		if parentDir == currentDir {
			break
		}
		currentDir = parentDir
	}

	return "", fmt.Errorf("遍历%d层目录后，未找到包含config/.env的项目根目录", 20)
}
// LoadConfig loads configuration from .env file (root/config/) and models.json file (root/config/)
func LoadConfig() (*Config, error) {
	var loadErr error

	once.Do(func() {
		globalConfig = &Config{
			apiKeys:    make(map[string]string),
			modelsData: make(map[string]interface{}), // 确保初始化，避免nil
		}

		// 第一步：获取项目根路径
		rootDir, err := GetProjectRoot()
		if err != nil {
			loadErr = fmt.Errorf("推导项目根路径失败: %w", err)
			fmt.Printf("[DEBUG LoadConfig] 推导根路径失败：%v\n", err)
			return
		}
		fmt.Printf("[DEBUG LoadConfig] 最终推导的项目根目录：%s\n", rootDir)

		// 第二步：加载根目录/config/.env文件（修正路径）
		envFilePath := filepath.Join(rootDir, "config", ".env") 
		fmt.Printf("[DEBUG LoadConfig] 准备加载.env文件：%s\n", envFilePath)
		if err := globalConfig.loadFromFile(envFilePath); err != nil {
			fmt.Printf("警告：加载.env文件失败，尝试读取系统环境变量: %v\n", err)
			globalConfig.loadFromEnv()
		} else {
			fmt.Printf("[DEBUG LoadConfig] .env文件加载成功！\n")
		}

		// 第三步：加载根目录/config/models.json（路径不变，逻辑一致）
		modelsFilePath := filepath.Join(rootDir, "config", "models.json")
		fmt.Printf("[DEBUG LoadConfig] 准备加载models.json文件：%s\n", modelsFilePath)
		if modelsErr := globalConfig.loadModelsFromFile(modelsFilePath); modelsErr != nil {
			fmt.Printf("Warning: models.json not loaded: %v\n", modelsErr)
			globalConfig.modelsData = make(map[string]interface{})
		} else {
			fmt.Printf("[DEBUG LoadConfig] models.json文件加载成功！\n")
		}
	})

	return globalConfig, loadErr
}

// GetConfig returns the global configuration instance
func GetConfig() *Config {
	if globalConfig == nil {
		// 忽略错误：GetConfig偏向易用性，LoadConfig已保证初始化
		LoadConfig()
	}
	return globalConfig
}

// loadFromFile reads .env file and parses configuration
func (c *Config) loadFromFile(filePath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("failed to open env file %s: %w", filePath, err)
	}
	defer file.Close()

	c.mu.Lock()
	defer c.mu.Unlock()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		
		// Skip empty lines and comments
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Parse key=value pairs
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		// 🔧 修复：原代码重复判断双引号，改为支持单/双引号
		if (strings.HasPrefix(value, `"`) && strings.HasSuffix(value, `"`)) ||
		   (strings.HasPrefix(value, `'`) && strings.HasSuffix(value, `'`)) {
			value = value[1 : len(value)-1]
		}

		c.setEnvValue(key, value)
	}

	return scanner.Err()
}

// loadModelsFromFile reads models.json and stores data in Config
func (c *Config) loadModelsFromFile(filePath string) error {
	fmt.Printf("[DEBUG loadModelsFromFile] 开始加载models.json：%s\n", filePath)
	
	file, err := os.Open(filePath)
	if err != nil {
		fmt.Printf("[DEBUG loadModelsFromFile] 打开文件失败：%v\n", err)
		return fmt.Errorf("failed to open models file %s: %w", filePath, err)
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	var tempData map[string]interface{}
	if err := decoder.Decode(&tempData); err != nil {
		fmt.Printf("[DEBUG loadModelsFromFile] 解析JSON失败：%v\n", err)
		return fmt.Errorf("failed to decode models config: %w", err)
	}

	// 🔧 核心修复：将解析后的tempData赋值给c.modelsData（原代码漏了这步！）
	c.mu.Lock()
	c.modelsData = tempData // 关键赋值，确保数据存入Config
	c.mu.Unlock()

	// 🔧 Debug：打印赋值后的结果
	fmt.Printf("[DEBUG loadModelsFromFile] 解析成功，modelsData赋值完成，内容：%+v\n", tempData)
	fmt.Printf("[DEBUG loadModelsFromFile] modelsData中models数组长度：%d\n", 
		len(tempData["models"].([]interface{})))

	return nil
}

// loadFromEnv loads configuration from system environment variables
func (c *Config) loadFromEnv() {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Load all API keys from environment
	for _, envKey := range c.getAllAPIKeyEnvVars() {
		if value := os.Getenv(envKey); value != "" {
			modelKey := strings.ToLower(strings.TrimSuffix(envKey, "_API_KEY"))
			c.apiKeys[modelKey] = value
		}
	}

	// Load other configuration from environment
	if debug := os.Getenv("DEBUG"); debug != "" {
		c.Debug = strings.ToLower(debug) == "true"
	}
	if logLevel := os.Getenv("LOG_LEVEL"); logLevel != "" {
		c.LogLevel = logLevel
	}
	if defaultModel := os.Getenv("DEFAULT_MODEL"); defaultModel != "" {
		c.DefaultModel = defaultModel
	}
	
	// Service settings
	if portGo := os.Getenv("PORT_GO"); portGo != "" {
		c.PortGo = portGo
	}
	if portPython := os.Getenv("PORT_PYTHON"); portPython != "" {
		c.PortPython = portPython
	}
	if frontendURL := os.Getenv("FRONTEND_URL"); frontendURL != "" {
		c.FrontendURL = frontendURL
	}
	
	// Database settings
	if dbHost := os.Getenv("DB_HOST"); dbHost != "" {
		c.DBHost = dbHost
	}
	if dbPort := os.Getenv("DB_PORT"); dbPort != "" {
		c.DBPort = dbPort
	}
	if dbName := os.Getenv("DB_NAME"); dbName != "" {
		c.DBName = dbName
	}
	if dbUser := os.Getenv("DB_USER"); dbUser != "" {
		c.DBUser = dbUser
	}
	if dbPassword := os.Getenv("DB_PASSWORD"); dbPassword != "" {
		c.DBPassword = dbPassword
	}
	
	// Security settings
	if jwtSecret := os.Getenv("JWT_SECRET"); jwtSecret != "" {
		c.JWTSecret = jwtSecret
	}
	if encryptionKey := os.Getenv("ENCRYPTION_KEY"); encryptionKey != "" {
		c.EncryptionKey = encryptionKey
	}
	
	// External service URLs
	if pythonAPIURL := os.Getenv("PYTHON_API_URL"); pythonAPIURL != "" {
		c.PythonAPIURL = pythonAPIURL
	}
	if goAPIURL := os.Getenv("GO_API_URL"); goAPIURL != "" {
		c.GoAPIURL = goAPIURL
	}
}

// setEnvValue sets a configuration value from environment variable
func (c *Config) setEnvValue(key, value string) {
	upperKey := strings.ToUpper(key)
	
	// Check if it is an API key (ends with _API_KEY)
	if strings.HasSuffix(upperKey, "_API_KEY") {
		// Extract model name (GLM_API_KEY -> glm)
		modelKey := strings.ToLower(strings.TrimSuffix(key, "_API_KEY"))
		c.apiKeys[modelKey] = value
		return
	}
	
	// Handle other configuration values
	switch upperKey {
	case "DEBUG":
		c.Debug = strings.ToLower(value) == "true"
	case "LOG_LEVEL":
		c.LogLevel = value
	case "DEFAULT_MODEL":
		c.DefaultModel = value
	case "PORT_GO":
		c.PortGo = value
	case "PORT_PYTHON":
		c.PortPython = value
	case "FRONTEND_URL":
		c.FrontendURL = value
	case "DB_HOST":
		c.DBHost = value
	case "DB_PORT":
		c.DBPort = value
	case "DB_NAME":
		c.DBName = value
	case "DB_USER":
		c.DBUser = value
	case "DB_PASSWORD":
		c.DBPassword = value
	case "JWT_SECRET":
		c.JWTSecret = value
	case "ENCRYPTION_KEY":
		c.EncryptionKey = value
	case "PYTHON_API_URL":
		c.PythonAPIURL = value
	case "GO_API_URL":
		c.GoAPIURL = value
	}
}

// getAllAPIKeyEnvVars returns list of known API key environment variables
func (c *Config) getAllAPIKeyEnvVars() []string {
	return []string{
		"GLM_API_KEY", "MOONSHOT_API_KEY", "OPENAI_API_KEY", "CLAUDE_API_KEY",
		"ANTHROPIC_API_KEY", "AZURE_API_KEY", "GEMINI_API_KEY", "BAIDU_API_KEY",
		"TENCENT_API_KEY", "HUGGINGFACE_API_KEY", "COHERE_API_KEY",
		"PERPLEXITY_API_KEY", "MISTRAL_API_KEY", "GROQ_API_KEY",
		"TOGETHER_API_KEY", "STABILITY_API_KEY", "ELEVENLABS_API_KEY",
		"WHISPER_API_KEY",
	}
}

// GetAPIKey returns the API key for the specified model
func (c *Config) GetAPIKey(model string) string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	if key, exists := c.apiKeys[strings.ToLower(model)]; exists {
		return key
	}
	
	return ""
}

// HasAPIKey checks if an API key is configured and non-empty for the specified model
func (c *Config) HasAPIKey(model string) bool {
	return strings.TrimSpace(c.GetAPIKey(model)) != ""
}

// GetAllAPIKeys returns a map of all configured API keys
func (c *Config) GetAllAPIKeys() map[string]string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	// Return a copy to prevent external modification
	result := make(map[string]string)
	for k, v := range c.apiKeys {
		result[k] = v
	}
	return result
}

// GetAvailableModels returns a list of all model types that have API keys
func (c *Config) GetAvailableModels() []string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	var models []string
	for model := range c.apiKeys {
		if strings.TrimSpace(c.apiKeys[model]) != "" {
			models = append(models, model)
		}
	}
	return models
}

// SetAPIKey programmatically sets an API key for a model
func (c *Config) SetAPIKey(model, apiKey string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.apiKeys[strings.ToLower(model)] = apiKey
}

// RemoveAPIKey removes an API key for a model
func (c *Config) RemoveAPIKey(model string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.apiKeys, strings.ToLower(model))
}

// ClearAPIKeys removes all API keys
func (c *Config) ClearAPIKeys() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.apiKeys = make(map[string]string)
}

// ReloadConfig reloads configuration from both files
func (c *Config) ReloadConfig() error {
	// 🔧 修正：Reload时也用根路径拼接文件
	rootDir, err := GetProjectRoot()
	if err != nil {
		return fmt.Errorf("推导项目根路径失败: %w", err)
	}

	c.ClearAPIKeys()
	
	// 加载根目录下的.env
	envFilePath := filepath.Join(rootDir, ".env")
	err = c.loadFromFile(envFilePath)
	if err != nil {
		return fmt.Errorf("failed to reload .env file: %w", err)
	}
	
	// 加载config/models.json
	modelsFilePath := filepath.Join(rootDir, "config", "models.json")
	modelsErr := c.loadModelsFromFile(modelsFilePath)
	if modelsErr != nil {
		return fmt.Errorf("failed to reload models.json file: %w", modelsErr)
	}
	
	return nil
}

// GetConfigSummary returns a summary of current configuration
func (c *Config) GetConfigSummary() map[string]interface{} {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	return map[string]interface{}{
		"debug_mode":        c.Debug,
		"log_level":         c.LogLevel,
		"default_model":     c.DefaultModel,
		"api_keys_count":    len(c.apiKeys),
		"available_models":  c.GetAvailableModels(),
		"port_go":           c.PortGo,
		"port_python":       c.PortPython,
		"frontend_url":      c.FrontendURL,
	}
}

// GetDefaultModelID returns the configured default model ID
func (c *Config) GetDefaultModelID() string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.DefaultModel
}

// SetDefaultModel sets the default model ID
func (c *Config) SetDefaultModel(modelID string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.DefaultModel = modelID
}

// GetModelsData returns the raw models data loaded from JSON
func (c *Config) GetModelsData() map[string]interface{} {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if c.modelsData == nil {
		fmt.Println("[DEBUG GetModelsData] 警告：modelsData为nil！")
		return make(map[string]interface{})
	}

	result := make(map[string]interface{})
	for k, v := range c.modelsData {
		result[k] = v
	}

	return result
}

// GetServiceSettings returns service-related configuration
func (c *Config) GetServiceSettings() map[string]string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	return map[string]string{
		"python_api_url": c.PythonAPIURL,
		"go_api_url":     c.GoAPIURL,
		"port_go":        c.PortGo,
		"port_python":    c.PortPython,
		"frontend_url":   c.FrontendURL,
	}
}

// GetDatabaseSettings returns database configuration
func (c *Config) GetDatabaseSettings() map[string]string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	return map[string]string{
		"host":     c.DBHost,
		"port":     c.DBPort,
		"name":     c.DBName,
		"user":     c.DBUser,
		"password": c.DBPassword,
	}
}

// GetSecuritySettings returns security configuration
func (c *Config) GetSecuritySettings() map[string]string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	return map[string]string{
		"jwt_secret":     c.JWTSecret,
		"encryption_key": c.EncryptionKey,
	}
}