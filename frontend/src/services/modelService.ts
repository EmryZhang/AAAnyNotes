import { getModels, type ModelConfig, type ModelsResponse } from '../api/chat';

// Global state for models
let models: ModelConfig[] = [];
let defaultModel: string = '';
let isInitialized: boolean = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize models once at app startup
 * This should be called during app initialization
 */
export async function initializeModels(): Promise<void> {
  if (isInitialized) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      console.log('Initializing models...');
      const response: ModelsResponse = await getModels();
      models = response.models;
      defaultModel = response.defaultModel || '';
      isInitialized = true;
      console.log('Models initialized successfully:', { modelCount: models.length, defaultModel });
    } catch (error) {
      console.error('Failed to initialize models:', error);
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Get available models synchronously
 * Must be called after initializeModels() has completed
 */
export function getModelsSync(): ModelConfig[] {
  if (!isInitialized) {
    console.warn('Models not initialized yet. Call initializeModels() first.');
    return [];
  }
  return models;
}

/**
 * Get default model synchronously
 * Must be called after initializeModels() has completed
 */
export function getDefaultModelSync(): string {
  if (!isInitialized) {
    console.warn('Models not initialized yet. Call initializeModels() first.');
    return '';
  }
  return defaultModel;
}

/**
 * Check if models are initialized
 */
export function areModelsInitialized(): boolean {
  return isInitialized;
}

/**
 * Get model by ID synchronously
 */
export function getModelById(id: string): ModelConfig | undefined {
  return models.find(model => model.id === id);
}
