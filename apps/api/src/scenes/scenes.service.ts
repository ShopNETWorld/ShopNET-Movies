import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateSceneDto, UpdateSceneDto } from './dto/scene.dto';
import { ProjectsService } from '../projects/projects.service';
import { SceneSummary } from '@shopnet/types';
import { Logger } from '@shopnet/logger';

@Injectable()
export class ScenesService {
  private readonly logger = new Logger('scenes-service');
  private inMemoryScenes = new Map<string, SceneSummary>();

  constructor(
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
  ) {}

  async createScene(projectId: string, userId: string, dto: CreateSceneDto): Promise<SceneSummary> {
    await this.projectsService.getProject(projectId, userId);

    const id = `scn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const scene: SceneSummary = {
      id,
      projectId,
      scriptId: dto.scriptId,
      sceneNumber: dto.sceneNumber,
      slugline: dto.slugline,
      heading: dto.heading,
      description: dto.description,
      estimatedDurationSeconds: dto.estimatedDurationSeconds,
      location: dto.location,
      timeOfDay: dto.timeOfDay || 'DAY',
      visualStyle: dto.visualStyle,
      prompt: dto.prompt,
      negativePrompt: dto.negativePrompt,
      cameraMovement: dto.cameraMovement || 'STATIC',
      dialogue: dto.dialogue,
      orderIndex: dto.orderIndex ?? dto.sceneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryScenes.set(id, scene);
    this.logger.info(`Scene created: ${scene.slugline}`, {
      sceneId: id,
      projectId,
      sceneNumber: scene.sceneNumber,
    });

    return scene;
  }

  async getScene(sceneId: string, userId: string): Promise<SceneSummary> {
    const scene = this.inMemoryScenes.get(sceneId);
    if (!scene) {
      throw new NotFoundException(`Scene with ID '${sceneId}' not found`);
    }

    await this.projectsService.getProject(scene.projectId, userId);
    return scene;
  }

  async listScenes(projectId: string, userId: string): Promise<SceneSummary[]> {
    await this.projectsService.getProject(projectId, userId);
    return Array.from(this.inMemoryScenes.values())
      .filter((s) => s.projectId === projectId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async updateScene(sceneId: string, userId: string, dto: UpdateSceneDto): Promise<SceneSummary> {
    const scene = await this.getScene(sceneId, userId);

    const updated: SceneSummary = {
      ...scene,
      ...(dto.sceneNumber !== undefined && { sceneNumber: dto.sceneNumber }),
      ...(dto.slugline && { slugline: dto.slugline }),
      ...(dto.heading !== undefined && { heading: dto.heading }),
      ...(dto.description && { description: dto.description }),
      ...(dto.scriptId !== undefined && { scriptId: dto.scriptId }),
      ...(dto.estimatedDurationSeconds !== undefined && { estimatedDurationSeconds: dto.estimatedDurationSeconds }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.timeOfDay && { timeOfDay: dto.timeOfDay }),
      ...(dto.visualStyle !== undefined && { visualStyle: dto.visualStyle }),
      ...(dto.prompt !== undefined && { prompt: dto.prompt }),
      ...(dto.negativePrompt !== undefined && { negativePrompt: dto.negativePrompt }),
      ...(dto.cameraMovement && { cameraMovement: dto.cameraMovement }),
      ...(dto.dialogue !== undefined && { dialogue: dto.dialogue }),
      ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
      updatedAt: new Date(),
    };

    this.inMemoryScenes.set(sceneId, updated);
    return updated;
  }

  async deleteScene(sceneId: string, userId: string): Promise<boolean> {
    await this.getScene(sceneId, userId);
    this.inMemoryScenes.delete(sceneId);
    return true;
  }
}
