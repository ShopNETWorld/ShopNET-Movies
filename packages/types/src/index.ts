/**
 * ShopNET Movies — Core Domain Types
 */

export type UserRole = 'USER' | 'CREATOR' | 'PRODUCER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '2.39:1';
export type VideoResolution = '360p' | '720p' | '1080p' | '4k';
export type VideoStyle = 'cinematic' | '3d-render' | 'anime' | 'documentary' | 'vintage-film';
export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'PRODUCED' | 'ARCHIVED';

export interface ProjectSummary {
  id: string;
  workspaceId: string;
  ownerId: string;
  title: string;
  logline?: string;
  synopsis?: string;
  genre: string;
  targetAudience?: string;
  primaryLanguage: string;
  secondaryLanguage?: string;
  aspectRatio: AspectRatio;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScriptSummary {
  id: string;
  projectId: string;
  version: number;
  title: string;
  content: string;
  rawText?: string;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterSummary {
  id: string;
  projectId: string;
  name: string;
  alias?: string;
  description?: string;
  bio?: string;
  ageRange?: string;
  gender?: string;
  ethnicBackground?: string;
  visualPrompt?: string;
  voiceProvider?: string;
  voiceVoiceId?: string;
  voiceCharacteristics?: Record<string, any>;
  referenceImageUrl?: string;
  referenceAudioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TimeOfDay = 'DAY' | 'NIGHT' | 'DUSK' | 'DAWN';
export type CameraMovement = 'STATIC' | 'PAN' | 'TILT' | 'TRACK' | 'ZOOM' | 'DRONE' | 'HANDHELD';

export interface SceneSummary {
  id: string;
  projectId: string;
  scriptId?: string;
  sceneNumber: number;
  slugline: string;
  heading?: string;
  description: string;
  estimatedDurationSeconds?: number;
  location?: string;
  timeOfDay: TimeOfDay;
  visualStyle?: string;
  prompt?: string;
  negativePrompt?: string;
  cameraMovement: CameraMovement;
  dialogue?: Array<{ character: string; line: string; emotion?: string }>;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'SCRIPT_DOCUMENT' | 'SUBTITLE' | 'THUMBNAIL';

export interface MediaAssetSummary {
  id: string;
  projectId: string;
  sceneId?: string;
  characterId?: string;
  uploaderId: string;
  type: MediaType;
  storageKey: string;
  storageBucket: string;
  assetUrl: string;
  filename: string;
  mimeType: string;
  fileSizeBytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  resolution?: string;
  aspectRatio?: string;
  provider: string;
  model?: string;
  generationJobId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type GenerationOperation = 
  | 'TEXT_TO_VIDEO'
  | 'IMAGE_TO_VIDEO'
  | 'VIDEO_EDITING'
  | 'VIDEO_EXTENSION'
  | 'IMAGE_GENERATION'
  | 'VOICE_GENERATION'
  | 'TRANSLATION'
  | 'CAPTIONS';

export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'RETRYING';

export interface GenerationJobMetadata {
  id: string;
  projectId: string;
  userId: string;
  sceneId?: string;
  operation: GenerationOperation;
  provider: string;
  model: string;
  providerRequestId?: string;
  status: JobStatus;
  progressPercent: number;
  inputParameters: Record<string, any>;
  durationSeconds?: number;
  estimatedCostUsd: number;
  actualCostUsd?: number;
  creditsConsumed: number;
  retryCount: number;
  maxRetries: number;
  failureReason?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageRecordSummary {
  id: string;
  userId: string;
  projectId?: string;
  jobId?: string;
  provider: string;
  model: string;
  operation: string;
  inputUnits: number;
  outputUnits: number;
  providerCostUsd: number;
  creditsCharged: number;
  createdAt: Date;
}

export type CreditTransactionReason = 
  | 'PURCHASE'
  | 'SUBSCRIPTION_GRANT'
  | 'GENERATION_DEDUCTION'
  | 'REFUND'
  | 'ADMIN_ADJUSTMENT'
  | 'WEBHOOK_GRANT';

export interface CreditAccount {
  id: string;
  userId: string;
  balanceCredits: number;
  lifetimeGrantedCredits: number;
  lifetimeConsumedCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditTransaction {
  id: string;
  accountId: string;
  amount: number; // positive = credit grant, negative = deduction
  balanceAfter: number;
  reason: CreditTransactionReason;
  referenceId?: string;
  idempotencyKey: string;
  createdAt: Date;
}

// --- Billing & Subscriptions ---

export type PlanInterval = 'MONTHLY' | 'ANNUALLY';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED' | 'TRIALING';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  interval: PlanInterval;
  amountNgn: number;       // Price in kobo
  amountUsdCents: number;  // Price in cents
  creditsPerCycle: number;
  paystackPlanCode?: string;
  stripePriceId?: string;
  isActive: boolean;
  displayOrder: number;
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionSummary {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  provider: string;
  providerSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelledAt?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSummary {
  id: string;
  userId: string;
  subscriptionId?: string;
  provider: string;
  providerReference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmountSubunits?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookEventRecord {
  id: string;
  provider: string;
  providerEventId: string;
  eventType: string;
  payload: Record<string, any>;
  processed: boolean;
  processedAt?: Date;
  failureReason?: string;
  createdAt: Date;
}

// --- Payment Provider Abstractions ---

export interface InitPaymentParams {
  email: string;
  amount: number;       // In subunits (kobo or cents)
  currency: string;
  planCode?: string;     // Provider plan ID
  reference?: string;    // Idempotency reference
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentSession {
  authorizationUrl: string;   // Redirect URL for user to complete payment
  reference: string;          // Unique payment reference
  accessCode?: string;        // Paystack access code
  providerSessionId?: string; // Stripe Checkout Session ID
}

export interface PaymentVerification {
  verified: boolean;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: Date;
  customerEmail?: string;
  providerData?: Record<string, any>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount: number;
  currency: string;
}
