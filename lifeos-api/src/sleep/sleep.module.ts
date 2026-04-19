import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SleepLog } from './entities/sleep-log.entity';
import { SleepService } from './sleep.service';
import { SleepController } from './sleep.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SleepLog])],
  controllers: [SleepController],
  providers: [SleepService],
  exports: [SleepService],
})
export class SleepModule {}
