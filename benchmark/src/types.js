/**
 * @typedef {Object} BenchmarkTestCase
 * @property {string} id - Test ID (e.g. 'TEST-A')
 * @property {string} name - Test Name
 * @property {string} category - Category
 * @property {string} prompt - Detailed prompt
 * @property {string} [negativePrompt] - Negative prompt
 * @property {string} [inputImageUrl] - Input reference image URL for I2V
 * @property {string} aspectRatio - '16:9' | '9:16'
 * @property {number} durationSeconds - Target duration (e.g. 5, 6, 8)
 * @property {string} resolution - '720p' | '1080p' | '4k'
 * @property {boolean} requiresAudio - Whether synchronized audio is required
 * @property {string[]} languages - e.g. ['English', 'Yoruba', 'Nigerian Pidgin']
 * @property {string} culturalContext - Nollywood / African setting notes
 */

/**
 * @typedef {Object} BenchmarkResultRecord
 * @property {string} testId
 * @property {string} testName
 * @property {string} provider
 * @property {string} model
 * @property {string} operation - 'text-to-video' | 'image-to-video' | 'video-editing'
 * @property {string} inputPrompt
 * @property {string} resolution
 * @property {number} durationSeconds
 * @property {string} providerRequestId
 * @property {number} latencyMs
 * @property {'SUCCESS' | 'FAILED' | 'RETRY_SUCCESS'} status
 * @property {boolean} isUsable
 * @property {number} providerCostUsd
 * @property {number} retryCount
 * @property {string|null} failureReason
 * @property {string} outputAssetReference
 * @property {Object} evaluationScores
 * @property {number} evaluationScores.promptAdherence - 1 to 5
 * @property {number} evaluationScores.motionQuality - 1 to 5
 * @property {number} evaluationScores.characterConsistency - 1 to 5
 * @property {number} evaluationScores.audioSync - 1 to 5
 * @property {number} evaluationScores.culturalAuthenticity - 1 to 5
 */

/**
 * @typedef {Object} ProviderAggregateMetrics
 * @property {string} provider
 * @property {string} model
 * @property {number} totalTests
 * @property {number} successCount
 * @property {number} usableCount
 * @property {number} failureCount
 * @property {number} totalCostUsd
 * @property {number} costPerAttemptUsd
 * @property {number} effectiveCostPerUsableClipUsd
 * @property {number} successRatePercent
 * @property {number} usableRatePercent
 * @property {number} failureRatePercent
 * @property {number} medianLatencyMs
 * @property {number} avgPromptAdherence
 * @property {number} avgMotionQuality
 * @property {number} avgCharacterConsistency
 * @property {number} avgCulturalAuthenticity
 * @property {string} commercialSuitabilityNote
 */

export {};
