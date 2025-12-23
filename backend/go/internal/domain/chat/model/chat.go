package model

// ChatStreamRequest aligned with frontend ChatStreamParams
type ChatStreamRequest struct {
	Messages         []Message `json:"messages"`        // Conversation history
	Model            string    `json:"model,omitempty"` // Model name(id)
	Temperature      float64   `json:"temperature,omitempty"`
	TopP             float64   `json:"topP,omitempty"`
	MaxTokens        int       `json:"maxTokens,omitempty"`
	FrequencyPenalty float64   `json:"frequencyPenalty,omitempty"`
	PresencePenalty  float64   `json:"presencePenalty,omitempty"`
	Stop             []string  `json:"stop,omitempty"`
	ThinkingMode     bool      `json:"thinkingMode,omitempty"` // Enable thinking mode
}

// Single message structure (consistent with frontend)
type Message struct {
	ID      string `json:"id"`
	Content string `json:"content"`
	Sender  string `json:"sender"` // "user" or "ai"
	Time    string `json:"time"`
}

// Streaming response data chunk (aligned with frontend StreamChunk)
type StreamChunk struct {
	Content  string `json:"content"`
	Finished bool   `json:"finished"`
}
