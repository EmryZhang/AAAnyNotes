package model

// 与前端 ChatStreamParams 对齐的请求参数
type ChatStreamRequest struct {
	Messages        []Message `json:"messages"`        // 对话历史
	Model           string    `json:"model,omitempty"` // 模型名称
	Temperature     float64   `json:"temperature,omitempty"`
	TopP            float64   `json:"topP,omitempty"`
	MaxTokens       int       `json:"maxTokens,omitempty"`
	FrequencyPenalty float64  `json:"frequencyPenalty,omitempty"`
	PresencePenalty  float64  `json:"presencePenalty,omitempty"`
	Stop            []string  `json:"stop,omitempty"`
}

// 单条消息结构（与前端一致）
type Message struct {
	ID      string `json:"id"`
	Content string `json:"content"`
	Sender  string `json:"sender"` // "user" 或 "ai"
	Time    string `json:"time"`
}

// 流式响应数据块（与前端 StreamChunk 对齐）
type StreamChunk struct {
	Content  string `json:"content"`
	Finished bool   `json:"finished"`
}