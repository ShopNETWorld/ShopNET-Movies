import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CreateCharacterDto, UpdateCharacterDto } from './dto/character.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/v1/projects/:projectId/characters')
@UseGuards(AuthGuard)
export class CharactersController {
  constructor(@Inject(CharactersService) private readonly charactersService: CharactersService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Param('projectId') projectId: string,
    @Body() dto: CreateCharacterDto,
  ) {
    return this.charactersService.createCharacter(projectId, user.id, dto);
  }

  @Get()
  async list(@CurrentUser() user: any, @Param('projectId') projectId: string) {
    return this.charactersService.listCharacters(projectId, user.id);
  }

  @Get(':id')
  async get(@CurrentUser() user: any, @Param('id') id: string) {
    return this.charactersService.getCharacter(id, user.id);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCharacterDto,
  ) {
    return this.charactersService.updateCharacter(id, user.id, dto);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.charactersService.deleteCharacter(id, user.id);
    return { success: true, message: `Character ${id} deleted successfully` };
  }
}
