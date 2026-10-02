import { Controller, Get, Post, Body, UseGuards, Inject } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { GrantCreditsDto, DeductCreditsDto } from './dto/credit.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/v1/credits')
@UseGuards(AuthGuard)
export class CreditsController {
  constructor(@Inject(CreditsService) private readonly creditsService: CreditsService) {}

  @Get('balance')
  async getBalance(@CurrentUser() user: any) {
    const account = await this.creditsService.getOrCreateAccount(user.id);
    return {
      userId: user.id,
      balanceCredits: account.balanceCredits,
      lifetimeGrantedCredits: account.lifetimeGrantedCredits,
      lifetimeConsumedCredits: account.lifetimeConsumedCredits,
    };
  }

  @Get('ledger')
  async getLedger(@CurrentUser() user: any) {
    return this.creditsService.getLedger(user.id);
  }

  @Post('deduct')
  async deduct(@CurrentUser() user: any, @Body() dto: DeductCreditsDto) {
    return this.creditsService.deductCredits(user.id, dto);
  }

  @Post('grant')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async grant(@CurrentUser() user: any, @Body() dto: GrantCreditsDto) {
    return this.creditsService.grantCredits(user.id, dto);
  }
}
