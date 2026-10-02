import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { Logger } from '@shopnet/logger';
import { PrismaService } from '../database/prisma.service';
import { ProjectSummary } from '@shopnet/types';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger('projects-service');
  private inMemoryProjects = new Map<string, ProjectSummary>();

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async createProject(userId: string, dto: CreateProjectDto): Promise<ProjectSummary> {
    const id = `prj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const workspaceId = dto.workspaceId || `ws_${userId}`;

    const project: ProjectSummary = {
      id,
      workspaceId,
      ownerId: userId,
      title: dto.title,
      logline: dto.logline,
      synopsis: dto.synopsis,
      genre: dto.genre,
      targetAudience: dto.targetAudience,
      primaryLanguage: dto.primaryLanguage,
      secondaryLanguage: dto.secondaryLanguage,
      aspectRatio: dto.aspectRatio || '16:9',
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryProjects.set(id, project);

    if (this.prisma && this.prisma.connected) {
      try {
        await this.prisma.getClient().project.create({
          data: {
            id,
            workspaceId,
            ownerId: userId,
            title: dto.title,
            logline: dto.logline,
            synopsis: dto.synopsis,
            genre: dto.genre,
            targetAudience: dto.targetAudience,
            primaryLanguage: dto.primaryLanguage,
            secondaryLanguage: dto.secondaryLanguage,
            aspectRatio: dto.aspectRatio === '16:9' ? 'RATIO_16_9' : 'RATIO_16_9',
            status: 'DRAFT',
          },
        });
      } catch (err: any) {
        this.logger.warn('Failed to persist project to database, kept in memory', { error: err.message });
      }
    }

    this.logger.info(`Project created: ${project.title}`, {
      projectId: id,
      userId,
      genre: project.genre,
    });

    return project;
  }

  async getProject(projectId: string, userId: string): Promise<ProjectSummary> {
    const project = this.inMemoryProjects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID '${projectId}' not found`);
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to access this project');
    }

    return project;
  }

  async listProjects(userId: string, workspaceId?: string): Promise<ProjectSummary[]> {
    return Array.from(this.inMemoryProjects.values()).filter((p) => {
      const matchOwner = p.ownerId === userId;
      const matchWorkspace = workspaceId ? p.workspaceId === workspaceId : true;
      return matchOwner && matchWorkspace;
    });
  }

  async updateProject(projectId: string, userId: string, dto: UpdateProjectDto): Promise<ProjectSummary> {
    const project = await this.getProject(projectId, userId);

    const updated: ProjectSummary = {
      ...project,
      ...(dto.title && { title: dto.title }),
      ...(dto.logline !== undefined && { logline: dto.logline }),
      ...(dto.synopsis !== undefined && { synopsis: dto.synopsis }),
      ...(dto.genre && { genre: dto.genre }),
      ...(dto.targetAudience !== undefined && { targetAudience: dto.targetAudience }),
      ...(dto.primaryLanguage && { primaryLanguage: dto.primaryLanguage }),
      ...(dto.secondaryLanguage !== undefined && { secondaryLanguage: dto.secondaryLanguage }),
      ...(dto.aspectRatio && { aspectRatio: dto.aspectRatio }),
      ...(dto.status && { status: dto.status }),
      updatedAt: new Date(),
    };

    this.inMemoryProjects.set(projectId, updated);
    return updated;
  }

  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    await this.getProject(projectId, userId);
    this.inMemoryProjects.delete(projectId);
    this.logger.info(`Project deleted: ${projectId}`, { projectId, userId });
    return true;
  }
}
