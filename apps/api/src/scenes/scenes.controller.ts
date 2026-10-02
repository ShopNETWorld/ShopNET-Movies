import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { ScenesService } from './scenes.service';
import { CreateSceneDto, UpdateSceneDto } from './dto/scene.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/v1/projects/:projectId/scenes')
@UseGuards(AuthGuard)
export class ScenesController {
  constructor(@Inject(ScenesService) private readonly scenesService: ScenesService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Param('projectId') projectId: string,
    @Body() dto: CreateSceneDto,
  ) {
    return this.scenesService.createScene(projectId, user.id, dto);
  }

  @Get()
  async list(@CurrentUser() user: any, @Param('projectId') projectId: string) {
    return this.scenesService.listScenes(projectId, user.id);
  }

  @Get(':id')
  async get(@CurrentUser() user: any, @Param('id') id: string) {
    return this.scenesService.getScene(id, user.id);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateSceneDto,
  ) {
    return this.scenesService.updateScene(id, user.id, dto);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.scenesService.deleteScene(id, user.id);
    return { success: true, message: `Scene ${id} deleted successfully` };
  }
}
