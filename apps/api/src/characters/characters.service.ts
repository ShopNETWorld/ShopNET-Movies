import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateCharacterDto, UpdateCharacterDto } from './dto/character.dto';
import { ProjectsService } from '../projects/projects.service';
import { CharacterSummary } from '@shopnet/types';
import { Logger } from '@shopnet/logger';

@Injectable()
export class CharactersService {
  private readonly logger = new Logger('characters-service');
  private inMemoryCharacters = new Map<string, CharacterSummary>();

  constructor(
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
  ) {}

  async createCharacter(projectId: string, userId: string, dto: CreateCharacterDto): Promise<CharacterSummary> {
    await this.projectsService.getProject(projectId, userId);

    const id = `chr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const character: CharacterSummary = {
      id,
      projectId,
      name: dto.name,
      alias: dto.alias,
      description: dto.description,
      bio: dto.bio,
      ageRange: dto.ageRange,
      gender: dto.gender,
      ethnicBackground: dto.ethnicBackground,
      visualPrompt: dto.visualPrompt,
      voiceProvider: dto.voiceProvider,
      voiceVoiceId: dto.voiceVoiceId,
      voiceCharacteristics: dto.voiceCharacteristics,
      referenceImageUrl: dto.referenceImageUrl,
      referenceAudioUrl: dto.referenceAudioUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryCharacters.set(id, character);
    this.logger.info(`Character created: ${character.name}`, {
      characterId: id,
      projectId,
      ethnicBackground: character.ethnicBackground,
    });

    return character;
  }

  async getCharacter(characterId: string, userId: string): Promise<CharacterSummary> {
    const character = this.inMemoryCharacters.get(characterId);
    if (!character) {
      throw new NotFoundException(`Character with ID '${characterId}' not found`);
    }

    await this.projectsService.getProject(character.projectId, userId);
    return character;
  }

  async listCharacters(projectId: string, userId: string): Promise<CharacterSummary[]> {
    await this.projectsService.getProject(projectId, userId);
    return Array.from(this.inMemoryCharacters.values()).filter((c) => c.projectId === projectId);
  }

  async updateCharacter(characterId: string, userId: string, dto: UpdateCharacterDto): Promise<CharacterSummary> {
    const character = await this.getCharacter(characterId, userId);

    const updated: CharacterSummary = {
      ...character,
      ...(dto.name && { name: dto.name }),
      ...(dto.alias !== undefined && { alias: dto.alias }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.ageRange !== undefined && { ageRange: dto.ageRange }),
      ...(dto.gender !== undefined && { gender: dto.gender }),
      ...(dto.ethnicBackground !== undefined && { ethnicBackground: dto.ethnicBackground }),
      ...(dto.visualPrompt !== undefined && { visualPrompt: dto.visualPrompt }),
      ...(dto.voiceProvider !== undefined && { voiceProvider: dto.voiceProvider }),
      ...(dto.voiceVoiceId !== undefined && { voiceVoiceId: dto.voiceVoiceId }),
      ...(dto.voiceCharacteristics !== undefined && { voiceCharacteristics: dto.voiceCharacteristics }),
      ...(dto.referenceImageUrl !== undefined && { referenceImageUrl: dto.referenceImageUrl }),
      ...(dto.referenceAudioUrl !== undefined && { referenceAudioUrl: dto.referenceAudioUrl }),
      updatedAt: new Date(),
    };

    this.inMemoryCharacters.set(characterId, updated);
    return updated;
  }

  async deleteCharacter(characterId: string, userId: string): Promise<boolean> {
    await this.getCharacter(characterId, userId);
    this.inMemoryCharacters.delete(characterId);
    return true;
  }
}
