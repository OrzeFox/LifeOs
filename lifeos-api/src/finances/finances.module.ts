import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './expense.entity';
import { MonthlyIncome } from './monthly-income.entity';
import { FinancesController } from './finances.controller';
import { FinancesService } from './finances.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, MonthlyIncome])],
  controllers: [FinancesController],
  providers: [FinancesService],
  exports: [FinancesService],
})
export class FinancesModule {}
