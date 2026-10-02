import { Controller, Get, Post, Put, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateGenerationJobDto, UpdateJobStatusDto } from './dto/job.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/v1/projects/:projectId/jobs')
@UseGuards(AuthGuard)
export class JobsController {
  constructor(@Inject(JobsService) private readonly jobsService: JobsService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Param('projectId') projectId: string,
    @Body() dto: CreateGenerationJobDto,
  ) {
    return this.jobsService.createJob(projectId, user.id, dto);
  }

  @Get()
  async list(@CurrentUser() user: any, @Param('projectId') projectId: string) {
    return this.jobsService.listJobs(projectId, user.id);
  }

  @Get(':id')
  async get(@CurrentUser() user: any, @Param('id') id: string) {
    return this.jobsService.getJob(id, user.id);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateJobStatusDto) {
    return this.jobsService.updateJobStatus(id, dto);
  }
}
