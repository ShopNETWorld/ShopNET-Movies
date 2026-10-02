# ShopNET Movies — Product Requirements Document

## 1. Product
ShopNET Movies is a modern, mobile-responsive AI-powered platform for filmmakers, producers, content creators, scriptwriters and marketers, with an initial focus on Nigerian and American film/content workflows.

## 2. Core capabilities
- User registration and authentication
- User profiles and workspaces
- Project/movie creation
- AI-assisted script generation and rewriting
- Character and scene management
- Image generation
- Text-to-video
- Image-to-video
- Video editing/continuation where supported by the selected provider
- Aspect-ratio selection
- Style selection including cinematic, 3D and pixel-style options
- Multilingual generation
- Captions/subtitles
- Voice/speech generation
- Media storage and project asset management
- Generation history and job status
- Credit/usage accounting
- Subscription/payment management
- YouTube, TikTok, Instagram and Facebook connection
- Single-platform or multi-platform publishing
- Scheduled publishing
- Publishing status, retry and error reporting
- Admin dashboard
- Security, abuse prevention and rate limiting

## 3. Gemini Omni Flash
Gemini Omni Flash must be included as a candidate production media-generation provider, not assumed to be the sole provider.

Current API model identifier to evaluate:
`gemini-omni-1.1-flash`

Evaluate it for:
- text-to-video
- image-to-video
- video editing
- video extension
- interpolation
- upscaling
- multilingual/media workflows
- cost per usable output
- commercial suitability
- latency
- limits
- consistency

Do not hard-wire production logic to Omni until provider selection is approved.

## 4. Business principles
- Provider-agnostic architecture
- Cost visibility per generation
- Provider fallback capability
- Avoid vendor lock-in
- Secure handling of API keys
- Clear user credit accounting
- Auditability
- Production scalability
- Human approval for irreversible architecture decisions

## 5. Non-functional requirements
- Mobile responsive
- Secure by default
- Observable
- Testable
- Maintainable
- Accessible
- API versioning where appropriate
- Background job processing for long-running media tasks
- Idempotent payment/webhook operations
- Retry with bounded backoff
- Abuse/rate controls
- DDoS protection at the appropriate infrastructure layer

## 6. Out of scope until explicitly approved
- Automatic provider selection by the production application
- Unreviewed autonomous spending
- Production deployment
- Destructive migrations
- Hard-coded provider-specific business logic
