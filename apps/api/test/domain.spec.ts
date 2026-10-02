import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/database/prisma.service';
import { ProjectsService } from '../src/projects/projects.service';
import { ScriptsService } from '../src/scripts/scripts.service';
import { CharactersService } from '../src/characters/characters.service';
import { ScenesService } from '../src/scenes/scenes.service';
import { MediaService } from '../src/media/media.service';
import { JobsService } from '../src/jobs/jobs.service';
import { CreditsService } from '../src/credits/credits.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('Domain & Database Security Suite (Phase 03)', () => {
  let projectsService: ProjectsService;
  let scriptsService: ScriptsService;
  let charactersService: CharactersService;
  let scenesService: ScenesService;
  let mediaService: MediaService;
  let jobsService: JobsService;
  let creditsService: CreditsService;

  const mockPrismaService = {
    connected: false,
    getClient: () => null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        ScriptsService,
        CharactersService,
        ScenesService,
        MediaService,
        JobsService,
        CreditsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    projectsService = module.get<ProjectsService>(ProjectsService);
    scriptsService = module.get<ScriptsService>(ScriptsService);
    charactersService = module.get<CharactersService>(CharactersService);
    scenesService = module.get<ScenesService>(ScenesService);
    mediaService = module.get<MediaService>(MediaService);
    jobsService = module.get<JobsService>(JobsService);
    creditsService = module.get<CreditsService>(CreditsService);
  });

  describe('1. Projects & Tenant Boundaries', () => {
    it('should create a project with Nollywood cinematic metadata', async () => {
      const project = await projectsService.createProject('user_nollywood_1', {
        title: 'The Lagos Heist',
        logline: 'An elite squad takes on a billionaire syndicate in Lagos Island.',
        synopsis: 'A high-octane Nollywood thriller exploring loyalty and survival.',
        genre: 'Action Thriller',
        primaryLanguage: 'English',
        secondaryLanguage: 'Yoruba',
        aspectRatio: '16:9',
      });

      expect(project.id).toBeDefined();
      expect(project.ownerId).toBe('user_nollywood_1');
      expect(project.title).toBe('The Lagos Heist');
      expect(project.genre).toBe('Action Thriller');
      expect(project.status).toBe('DRAFT');
    });

    it('should enforce tenant isolation (prevent User B from accessing User A project)', async () => {
      const project = await projectsService.createProject('creator_alice', {
        title: 'Alice Production',
        genre: 'Drama',
        primaryLanguage: 'English',
      });

      // Alice can read her own project
      const aliceView = await projectsService.getProject(project.id, 'creator_alice');
      expect(aliceView.id).toBe(project.id);

      // Bob must be forbidden
      await expect(
        projectsService.getProject(project.id, 'intruder_bob'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('2. Scripts & Versioning', () => {
    it('should create sequential script versions and manage current active version', async () => {
      const project = await projectsService.createProject('creator_script_1', {
        title: 'Echoes of the Forest',
        genre: 'Afro-futurism',
        primaryLanguage: 'Igbo',
      });

      const v1 = await scriptsService.createScript(project.id, 'creator_script_1', {
        title: 'Echoes - Draft 1',
        content: 'EXT. ENUGU FOREST - DAY\nAdanna discovers the monolith.',
      });

      expect(v1.version).toBe(1);
      expect(v1.isCurrent).toBe(true);

      const v2 = await scriptsService.createScript(project.id, 'creator_script_1', {
        title: 'Echoes - Draft 2 (Revised)',
        content: 'EXT. ENUGU FOREST - DUSK\nAdanna decodes the celestial glyphs.',
      });

      expect(v2.version).toBe(2);
      expect(v2.isCurrent).toBe(true);

      // v1 is no longer current
      const fetchedV1 = await scriptsService.getScript(v1.id, 'creator_script_1');
      expect(fetchedV1.isCurrent).toBe(false);
    });
  });

  describe('3. Character Bible & Multimodal Attributes', () => {
    it('should create character with ethnic background, visual prompt, and voice parameters', async () => {
      const project = await projectsService.createProject('creator_char_1', {
        title: 'Warrior Queen',
        genre: 'Epic Historical',
        primaryLanguage: 'Hausa',
      });

      const character = await charactersService.createCharacter(project.id, 'creator_char_1', {
        name: 'Amina',
        alias: 'Queen of Zazzau',
        bio: 'Fierce military leader and monarch of the 16th century.',
        ethnicBackground: 'Hausa',
        visualPrompt: 'Regal 16th-century West African warrior queen with copper armor, cinematic lighting, 8k',
        voiceProvider: 'ELEVENLABS',
        voiceVoiceId: 'voice_amina_01',
        voiceCharacteristics: { accent: 'Nigerian Northern', tone: 'Commanding', pitch: 1.0 },
      });

      expect(character.id).toBeDefined();
      expect(character.name).toBe('Amina');
      expect(character.voiceProvider).toBe('ELEVENLABS');
      expect(character.voiceCharacteristics?.accent).toBe('Nigerian Northern');
    });
  });

  describe('4. Scenes & Shot Breakdown', () => {
    it('should create scene with slugline, camera movement, and time of day', async () => {
      const project = await projectsService.createProject('creator_scene_1', {
        title: 'Lekki Nights',
        genre: 'Noir',
        primaryLanguage: 'English',
      });

      const scene = await scenesService.createScene(project.id, 'creator_scene_1', {
        sceneNumber: 1,
        slugline: 'EXT. LEKKI-IKOYI LINK BRIDGE - NIGHT',
        description: 'Heavy rain beats down on the suspension cables as headlights streak past.',
        timeOfDay: 'NIGHT',
        cameraMovement: 'DRONE',
        prompt: 'Aerial drone tracking shot over rainy futuristic suspension bridge in Lagos, neon reflections',
        dialogue: [{ character: 'KAYODE', line: 'We have five minutes before the bridge closes.' }],
      });

      expect(scene.sceneNumber).toBe(1);
      expect(scene.cameraMovement).toBe('DRONE');
      expect(scene.timeOfDay).toBe('NIGHT');
      expect(scene.dialogue?.[0].character).toBe('KAYODE');
    });
  });

  describe('5. Media Assets & Lineage Attribution', () => {
    it('should register media asset and enforce provider, model, and generation lineage', async () => {
      const project = await projectsService.createProject('creator_media_1', {
        title: 'Abuja Skyline',
        genre: 'Documentary',
        primaryLanguage: 'English',
      });

      const asset = await mediaService.registerAsset(project.id, 'creator_media_1', {
        type: 'VIDEO',
        storageKey: 'projects/abuja/scenes/scene_1.mp4',
        assetUrl: 'https://cdn.shopnet.movies/projects/abuja/scenes/scene_1.mp4',
        filename: 'scene_1.mp4',
        mimeType: 'video/mp4',
        durationSeconds: 5.0,
        resolution: '1080p',
        provider: 'RUNWAY',
        model: 'gen-3-alpha',
        generationJobId: 'job_gen3_test_01',
      });

      expect(asset.id).toBeDefined();
      expect(asset.provider).toBe('RUNWAY');
      expect(asset.model).toBe('gen-3-alpha');
      expect(asset.generationJobId).toBe('job_gen3_test_01');
    });
  });

  describe('6. Generation Jobs & Usage Cost Accounting', () => {
    it('should track job lifecycle and automatically generate audit usage record upon completion', async () => {
      const project = await projectsService.createProject('creator_job_1', {
        title: 'Kano Dairies',
        genre: 'Drama',
        primaryLanguage: 'Hausa',
      });

      const job = await jobsService.createJob(project.id, 'creator_job_1', {
        operation: 'TEXT_TO_VIDEO',
        provider: 'runway',
        model: 'gen-3-alpha',
        inputParameters: { prompt: 'Sunset over Kano city walls' },
        estimatedCostUsd: 0.25,
        creditsRequired: 25,
      });

      expect(job.status).toBe('QUEUED');
      expect(job.progressPercent).toBe(0);

      // Transition to RUNNING
      const runningJob = await jobsService.updateJobStatus(job.id, {
        status: 'RUNNING',
        progressPercent: 45,
        providerRequestId: 'req_runway_9921',
      });
      expect(runningJob.status).toBe('RUNNING');
      expect(runningJob.startedAt).toBeDefined();

      // Transition to COMPLETED
      const completedJob = await jobsService.updateJobStatus(job.id, {
        status: 'COMPLETED',
        actualCostUsd: 0.24,
      });
      expect(completedJob.status).toBe('COMPLETED');
      expect(completedJob.progressPercent).toBe(100);
      expect(completedJob.completedAt).toBeDefined();

      // Verify usage record was generated
      const usageRecords = await jobsService.getUsageRecords('creator_job_1');
      expect(usageRecords.length).toBe(1);
      expect(usageRecords[0].jobId).toBe(job.id);
      expect(usageRecords[0].provider).toBe('runway');
      expect(usageRecords[0].providerCostUsd).toBe(0.24);
      expect(usageRecords[0].creditsCharged).toBe(25);
    });
  });

  describe('7. Credit Foundation & Append-Only Idempotent Ledger', () => {
    it('should grant credits and maintain strictly append-only ledger', async () => {
      const userId = 'creator_fin_1';

      const initialBalance = await creditsService.getBalance(userId);
      expect(initialBalance).toBe(0);

      const grant = await creditsService.grantCredits(userId, {
        amount: 500,
        reason: 'PURCHASE',
        idempotencyKey: 'idem_purchase_001',
      });

      expect(grant.amount).toBe(500);
      expect(grant.balanceAfter).toBe(500);

      const balance = await creditsService.getBalance(userId);
      expect(balance).toBe(500);
    });

    it('should deduct credits for generation and fail on insufficient balance', async () => {
      const userId = 'creator_fin_2';

      // Seed with 100 credits
      await creditsService.grantCredits(userId, {
        amount: 100,
        reason: 'SUBSCRIPTION_GRANT',
        idempotencyKey: 'idem_seed_100',
      });

      // Deduct 40 credits
      const deduction = await creditsService.deductCredits(userId, {
        amount: 40,
        reason: 'GENERATION_DEDUCTION',
        idempotencyKey: 'idem_deduct_40',
      });

      expect(deduction.amount).toBe(-40);
      expect(deduction.balanceAfter).toBe(60);

      // Attempt to deduct 70 (exceeding 60 balance)
      await expect(
        creditsService.deductCredits(userId, {
          amount: 70,
          reason: 'GENERATION_DEDUCTION',
          idempotencyKey: 'idem_deduct_fail',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should guarantee idempotency on retry with same idempotencyKey (no double debit)', async () => {
      const userId = 'creator_fin_3';

      await creditsService.grantCredits(userId, {
        amount: 200,
        reason: 'PURCHASE',
        idempotencyKey: 'idem_grant_200',
      });

      // First debit attempt
      const debit1 = await creditsService.deductCredits(userId, {
        amount: 50,
        reason: 'GENERATION_DEDUCTION',
        idempotencyKey: 'tx_generation_unique_key_123',
      });
      expect(debit1.balanceAfter).toBe(150);

      // Second identical debit attempt (network retry simulation)
      const debit2 = await creditsService.deductCredits(userId, {
        amount: 50,
        reason: 'GENERATION_DEDUCTION',
        idempotencyKey: 'tx_generation_unique_key_123',
      });

      // Returns identical transaction without double decrementing
      expect(debit2.id).toBe(debit1.id);
      expect(debit2.balanceAfter).toBe(150);

      const finalBalance = await creditsService.getBalance(userId);
      expect(finalBalance).toBe(150);

      const ledger = await creditsService.getLedger(userId);
      // Only 2 total transactions in ledger: 1 grant + 1 debit
      expect(ledger.length).toBe(2);
    });
  });
});
