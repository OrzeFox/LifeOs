import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { MonthlyIncome } from './entities/monthly-income.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { FinancesController } from './finances.controller';
import { FinancesService } from './finances.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, MonthlyIncome, ExpenseCategory])],
  controllers: [FinancesController],
  providers: [FinancesService],
  exports: [FinancesService],
})
export class FinancesModule {}
