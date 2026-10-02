/**
 * ShopNET Movies - 10 Standardized Video Benchmark Test Cases (A through J)
 * Defined per docs/PROVIDER-SELECTION.md and prompts/PROMPT-00.5-PROVIDER-BENCHMARK.md
 */

/** @type {import('./types.js').BenchmarkTestCase[]} */
export const BENCHMARK_TEST_CASES = [
  {
    id: 'TEST-A',
    name: 'Nigerian Family Drama Scene',
    category: 'Drama / Dialogue',
    prompt: 'Cinematic interior of an upscale Ikeja living room, golden hour sunlight streaming through sheer curtains. A Nigerian matriarch in elegant royal-blue Ankara attire confronts her adult son across a polished mahogany dining table. Intense emotional expressions, natural Nollywood color grading, shallow depth of field, 35mm film grain, 24fps.',
    negativePrompt: 'cartoonish, oversaturated, deformed hands, plastic skin, distorted anatomy, Western caricature',
    aspectRatio: '16:9',
    durationSeconds: 6,
    resolution: '1080p',
    requiresAudio: true,
    languages: ['English', 'Yoruba'],
    culturalContext: 'Nollywood drama, natural Nigerian indoor lighting, authentic textile textures.'
  },
  {
    id: 'TEST-B',
    name: 'Action / Chase Scene',
    category: 'Action / High Motion',
    prompt: 'High-octane action chase sequence through vibrant Lagos traffic on third mainland bridge at sunset. A motorcycle weaves sharply between yellow Danfo buses, kinetic camera tracking low to the asphalt, exhaust smoke, cinematic motion blur, realistic physics, reflections on wet pavement, hyper-realistic, dramatic lens flare.',
    negativePrompt: 'jerky frame jumps, morphing vehicles, low frame rate, floating objects, warped wheels',
    aspectRatio: '16:9',
    durationSeconds: 6,
    resolution: '1080p',
    requiresAudio: false,
    languages: [],
    culturalContext: 'Lagos iconic transit environment, Danfo buses, speed, cinematic action tracking.'
  },
  {
    id: 'TEST-C',
    name: 'Character Consistency Across Three Clips',
    category: 'Character Continuity',
    prompt: 'Consistent character: Chidi, a 32-year-old Nigerian sound engineer with short faded hair, trimmed beard, wearing an olive-green military jacket over a black t-shirt and silver pendant. Scene 1: standing outside a music studio in Surulere. Scene 2: sitting inside the mixing booth nodding to beat. Scene 3: walking through evening street under neon sign. Exact facial structure and clothing preserved.',
    negativePrompt: 'facial identity shift, changing hairstyles, varying age, distorted wardrobe, extra limbs',
    aspectRatio: '16:9',
    durationSeconds: 8,
    resolution: '1080p',
    requiresAudio: false,
    languages: [],
    culturalContext: 'Surulere creative hub, identity preservation across varying lighting and focal lengths.'
  },
  {
    id: 'TEST-D',
    name: 'Image-to-Video Fidelity & Motion Initiation',
    category: 'Image-to-Video',
    prompt: 'Gentle ocean breeze catching the white linen shirt of a woman standing at the edge of Landmark Beach, Lagos. Natural hair blowing softly, slow graceful turn towards the camera, subtle smile, golden hour water reflections, photorealistic micro-movements, cinematic fluid motion.',
    negativePrompt: 'rigid still frame, morphing facial features, flickering, synthetic rubber movements',
    inputImageUrl: 'https://assets.shopnet.internal/benchmarks/seeds/landmark-beach-portrait.jpg',
    aspectRatio: '16:9',
    durationSeconds: 6,
    resolution: '1080p',
    requiresAudio: false,
    languages: [],
    culturalContext: 'Contemporary Lagos coastline, luxury aesthetic, realistic fabric physics.'
  },
  {
    id: 'TEST-E',
    name: 'Dialogue and Audio Lip Sync',
    category: 'Dialogue / Audio-Visual Sync',
    prompt: 'Close-up shot of a young Nigerian filmmaker looking into the camera lens with passionate expression, clearly enunciating: "We tell our own stories, on our own terms." Accurate lip synchronization to the spoken audio, synchronized studio-level room acoustic resonance, 4k ultra-crisp detail.',
    negativePrompt: 'out of sync lips, mechanical voice, robotic audio, ventriloquist effect, mouth artifacting',
    aspectRatio: '16:9',
    durationSeconds: 5,
    resolution: '1080p',
    requiresAudio: true,
    languages: ['Nigerian English'],
    culturalContext: 'Authentic Nigerian English accent, synchronized phoneme-to-viseme mapping.'
  },
  {
    id: 'TEST-F',
    name: 'Dynamic Camera Movement (Crane & Dolly)',
    category: 'Cinematography / Camera Control',
    prompt: 'A sweeping cinematic crane shot starting high above an open-air rooftop gathering in Victoria Island, descending smoothly into an intimate group conversation around a fire pit. Parallax background motion of the illuminated Lagos skyline, stable horizon, continuous smooth camera velocity.',
    negativePrompt: 'camera jitter, clipping geometry, wobbling perspective, uneven frame pacing',
    aspectRatio: '16:9',
    durationSeconds: 6,
    resolution: '1080p',
    requiresAudio: false,
    languages: [],
    culturalContext: 'Lagos Island skyline, upscale rooftop cinematography, controlled continuous camera movement.'
  },
  {
    id: 'TEST-G',
    name: 'Lagos / Abeokuta Architectural Environment',
    category: 'Environment / Cultural Authenticity',
    prompt: 'Majestic morning aerial establishing shot of the ancient Olumo Rock in Abeokuta rising above traditional rust-red tin rooftops. Morning mist drifting through the valley, lush tropical greenery on the rock ledges, authentic southwestern Nigerian topography, cinematic documentary aesthetic.',
    negativePrompt: 'generic European hills, fantasy mountains, flat texture, AI dream-soup artifacting',
    aspectRatio: '16:9',
    durationSeconds: 6,
    resolution: '1080p',
    requiresAudio: false,
    languages: [],
    culturalContext: 'Historic Abeokuta, Ogun State, ancient rock heritage, correct architectural forms.'
  },
  {
    id: 'TEST-H',
    name: 'Multilingual Workflow (English + Yoruba + Pidgin)',
    category: 'Localization / Multilingual',
    prompt: 'Vibrant outdoor market scene in Balogun Market, Lagos. A jovial trader bargaining animatedly with a customer, switching naturally from Yoruba ("E kaaro ma") to Nigerian Pidgin ("How much last this fabric?") and Nigerian English. Rich colorful fabrics, atmospheric crowd chatter, authentic cadence.',
    negativePrompt: 'inappropriate lip movements, incorrect cadence, generic foreign accents, silent mismatch',
    aspectRatio: '16:9',
    durationSeconds: 6,
    resolution: '1080p',
    requiresAudio: true,
    languages: ['English', 'Yoruba', 'Nigerian Pidgin'],
    culturalContext: 'Balogun market bustle, linguistic code-switching, authentic West African market dynamics.'
  },
  {
    id: 'TEST-I',
    name: '9:16 Social Output (Vertical Video)',
    category: 'Social Formats / Mobile',
    prompt: 'Vertical 9:16 portrait video of a trendy Nollywood fashion designer showing off a contemporary adire streetwear jacket. Studio backdrop with warm rim lighting, dynamic model pivot, fashion reel cadence, ultra-sharp textile texture, TikTok / Instagram Reels pacing.',
    negativePrompt: 'stretched aspect ratio, pillarboxing, cropped head, unnatural torso elongation',
    aspectRatio: '9:16',
    durationSeconds: 6,
    resolution: '1080p',
    requiresAudio: false,
    languages: [],
    culturalContext: 'Adire modern fashion, vertical portrait composition optimized for mobile viewers.'
  },
  {
    id: 'TEST-J',
    name: '16:9 Cinematic Output (Widescreen Master)',
    category: 'Cinematic Master',
    prompt: 'Epic 2.39:1 / 16:9 widescreen anamorphic frame of a lone traveler standing on the rocky crest overlooking a savanna landscape at dawn. Silhouette backlit by blazing crimson sunrise, atmospheric dust motes, anamorphic horizontal lens flare, Panavision cinematic grandeur.',
    negativePrompt: 'low dynamic range, muddy shadows, digital video look, cartoon rendering, flat lighting',
    aspectRatio: '16:9',
    durationSeconds: 8,
    resolution: '1080p',
    requiresAudio: false,
    languages: [],
    culturalContext: 'African savanna grandeur, epic Nollywood historical drama visual grammar.'
  }
];
