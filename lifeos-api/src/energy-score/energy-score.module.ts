import { Module } from '@nestjs/common';
import { UserContextModule } from '../user-context/user-context.module';
import { EnergyScoreService } from './energy-score.service';
import { EnergyScoreController } from './energy-score.controller';

@Module({
  imports: [UserContextModule],
  controllers: [EnergyScoreController],
  providers: [EnergyScoreService],
  exports: [EnergyScoreService],
})
export class EnergyScoreModule {}
