import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, Inject } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/v1/projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(@Inject(ProjectsService) private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateProjectDto) {
    return this.projectsService.createProject(user.id, dto);
  }

  @Get()
  async list(@CurrentUser() user: any, @Query('workspaceId') workspaceId?: string) {
    return this.projectsService.listProjects(user.id, workspaceId);
  }

  @Get(':id')
  async get(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectsService.getProject(id, user.id);
  }

  @Put(':id')
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.updateProject(id, user.id, dto);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.projectsService.deleteProject(id, user.id);
    return { success: true, message: `Project ${id} deleted successfully` };
  }
}
