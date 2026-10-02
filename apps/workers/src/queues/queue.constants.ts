export const QUEUE_NAMES = {
  MEDIA_GENERATION: 'media-generation',
  VIDEO_TRANSCODE: 'video-transcode',
  SOCIAL_PUBLISH: 'social-publish',
  WEBHOOK_DISPATCH: 'webhook-dispatch'
} as const;

export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];
