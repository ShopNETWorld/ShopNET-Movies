import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { RegisterMediaAssetDto } from './dto/media.dto';
import { ProjectsService } from '../projects/projects.service';
import { MediaAssetSummary } from '@shopnet/types';
import { Logger } from '@shopnet/logger';

@Injectable()
export class MediaService {
  private readonly logger = new Logger('media-service');
  private inMemoryAssets = new Map<string, MediaAssetSummary>();

  constructor(
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
  ) {}

  async registerAsset(projectId: string, userId: string, dto: RegisterMediaAssetDto): Promise<MediaAssetSummary> {
    await this.projectsService.getProject(projectId, userId);

    const id = `ast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const asset: MediaAssetSummary = {
      id,
      projectId,
      sceneId: dto.sceneId,
      characterId: dto.characterId,
      uploaderId: userId,
      type: dto.type,
      storageKey: dto.storageKey,
      storageBucket: dto.storageBucket || 'shopnet-media',
      assetUrl: dto.assetUrl,
      filename: dto.filename,
      mimeType: dto.mimeType,
      fileSizeBytes: dto.fileSizeBytes,
      width: dto.width,
      height: dto.height,
      durationSeconds: dto.durationSeconds,
      resolution: dto.resolution,
      aspectRatio: dto.aspectRatio,
      provider: dto.provider,
      model: dto.model,
      generationJobId: dto.generationJobId,
      metadata: dto.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryAssets.set(id, asset);
    this.logger.info(`Media asset registered: ${asset.filename} (${asset.type})`, {
      assetId: id,
      projectId,
      provider: asset.provider,
      model: asset.model,
      generationJobId: asset.generationJobId,
    });

    return asset;
  }

  async getAsset(assetId: string, userId: string): Promise<MediaAssetSummary> {
    const asset = this.inMemoryAssets.get(assetId);
    if (!asset) {
      throw new NotFoundException(`Media asset with ID '${assetId}' not found`);
    }

    await this.projectsService.getProject(asset.projectId, userId);
    return asset;
  }

  async listAssets(projectId: string, userId: string): Promise<MediaAssetSummary[]> {
    await this.projectsService.getProject(projectId, userId);
    return Array.from(this.inMemoryAssets.values()).filter((a) => a.projectId === projectId);
  }
}
