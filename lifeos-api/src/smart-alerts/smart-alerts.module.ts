import { Module } from '@nestjs/common';
import { InsightsModule } from '../insights/insights.module';
import { SmartAlertsService } from './smart-alerts.service';

@Module({
  imports: [InsightsModule],
  providers: [SmartAlertsService],
})
export class SmartAlertsModule {}
