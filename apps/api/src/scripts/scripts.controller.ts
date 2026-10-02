import { Controller, Get, Post, Put, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { CreateScriptDto, UpdateScriptDto } from './dto/script.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/v1/projects/:projectId/scripts')
@UseGuards(AuthGuard)
export class ScriptsController {
  constructor(@Inject(ScriptsService) private readonly scriptsService: ScriptsService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Param('projectId') projectId: string,
    @Body() dto: CreateScriptDto,
  ) {
    return this.scriptsService.createScript(projectId, user.id, dto);
  }

  @Get()
  async list(@CurrentUser() user: any, @Param('projectId') projectId: string) {
    return this.scriptsService.listScripts(projectId, user.id);
  }

  @Get(':id')
  async get(@CurrentUser() user: any, @Param('id') id: string) {
    return this.scriptsService.getScript(id, user.id);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateScriptDto,
  ) {
    return this.scriptsService.updateScript(id, user.id, dto);
  }
}
