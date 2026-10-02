import { Controller, Get, Post, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { MediaService } from './media.service';
import { RegisterMediaAssetDto } from './dto/media.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/v1/projects/:projectId/media')
@UseGuards(AuthGuard)
export class MediaController {
  constructor(@Inject(MediaService) private readonly mediaService: MediaService) {}

  @Post()
  async register(
    @CurrentUser() user: any,
    @Param('projectId') projectId: string,
    @Body() dto: RegisterMediaAssetDto,
  ) {
    return this.mediaService.registerAsset(projectId, user.id, dto);
  }

  @Get()
  async list(@CurrentUser() user: any, @Param('projectId') projectId: string) {
    return this.mediaService.listAssets(projectId, user.id);
  }

  @Get(':id')
  async get(@CurrentUser() user: any, @Param('id') id: string) {
    return this.mediaService.getAsset(id, user.id);
  }
}
