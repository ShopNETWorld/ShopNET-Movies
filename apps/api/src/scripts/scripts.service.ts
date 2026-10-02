import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateScriptDto, UpdateScriptDto } from './dto/script.dto';
import { ProjectsService } from '../projects/projects.service';
import { ScriptSummary } from '@shopnet/types';
import { Logger } from '@shopnet/logger';

@Injectable()
export class ScriptsService {
  private readonly logger = new Logger('scripts-service');
  private inMemoryScripts = new Map<string, ScriptSummary>();

  constructor(
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
  ) {}

  async createScript(projectId: string, userId: string, dto: CreateScriptDto): Promise<ScriptSummary> {
    await this.projectsService.getProject(projectId, userId);

    const existingScripts = await this.listScripts(projectId, userId);
    const nextVersion = dto.version || existingScripts.length + 1;

    for (const s of existingScripts) {
      if (s.isCurrent) {
        s.isCurrent = false;
        this.inMemoryScripts.set(s.id, s);
      }
    }

    const id = `scr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const script: ScriptSummary = {
      id,
      projectId,
      version: nextVersion,
      title: dto.title,
      content: dto.content,
      rawText: dto.rawText,
      isCurrent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryScripts.set(id, script);
    this.logger.info(`Script created: ${script.title} (v${nextVersion})`, {
      scriptId: id,
      projectId,
      version: nextVersion,
    });

    return script;
  }

  async getScript(scriptId: string, userId: string): Promise<ScriptSummary> {
    const script = this.inMemoryScripts.get(scriptId);
    if (!script) {
      throw new NotFoundException(`Script with ID '${scriptId}' not found`);
    }

    await this.projectsService.getProject(script.projectId, userId);
    return script;
  }

  async listScripts(projectId: string, userId: string): Promise<ScriptSummary[]> {
    await this.projectsService.getProject(projectId, userId);
    return Array.from(this.inMemoryScripts.values())
      .filter((s) => s.projectId === projectId)
      .sort((a, b) => b.version - a.version);
  }

  async updateScript(scriptId: string, userId: string, dto: UpdateScriptDto): Promise<ScriptSummary> {
    const script = await this.getScript(scriptId, userId);

    const updated: ScriptSummary = {
      ...script,
      ...(dto.title && { title: dto.title }),
      ...(dto.content && { content: dto.content }),
      ...(dto.rawText !== undefined && { rawText: dto.rawText }),
      ...(dto.isCurrent !== undefined && { isCurrent: dto.isCurrent }),
      updatedAt: new Date(),
    };

    this.inMemoryScripts.set(scriptId, updated);
    return updated;
  }
}
