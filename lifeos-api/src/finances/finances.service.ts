import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Expense, ExpenseType } from './expense.entity';
import { MonthlyIncome } from './monthly-income.entity';

@Injectable()
export class FinancesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepo: Repository<Expense>,
    @InjectRepository(MonthlyIncome)
    private readonly incomeRepo: Repository<MonthlyIncome>,
  ) {}

  // --- Expenses ---
  createExpense(userId: string, data: Partial<Expense>) {
    const expense = this.expensesRepo.create({ ...data, user: { id: userId } });
    return this.expensesRepo.save(expense);
  }

  getExpensesByMonth(userId: string, year: number, month: number) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().split('T')[0]; // último día
    return this.expensesRepo.find({
      where: { user: { id: userId }, date: Between(start, end) },
      order: { date: 'DESC' },
    });
  }

  deleteExpense(id: string, userId: string) {
    return this.expensesRepo.delete({ id, user: { id: userId } });
  }

  // --- Income ---
  async setMonthlyIncome(userId: string, amount: number, month: string) {
    let income = await this.incomeRepo.findOne({
      where: { user: { id: userId }, month },
    });
    if (income) {
      income.amount = amount;
    } else {
      income = this.incomeRepo.create({ amount, month, user: { id: userId } });
    }
    return this.incomeRepo.save(income);
  }

  getMonthlyIncome(userId: string, month: string) {
    return this.incomeRepo.findOne({ where: { user: { id: userId }, month } });
  }

  // --- Summary: dinero disponible ---
  async getMonthlySummary(userId: string, year: number, month: number) {
    const monthStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const expenses = await this.getExpensesByMonth(userId, year, month);
    const income = await this.getMonthlyIncome(userId, monthStr);

    const totalSpent = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const totalIncome = income ? Number(income.amount) : 0;
    const remaining = totalIncome - totalSpent;

    // Predicción simple: gasto promedio diario * días restantes del mes
    const today = new Date();
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayOfMonth = today.getMonth() + 1 === month ? today.getDate() : daysInMonth;
    const dailyAvg = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;
    const daysLeft = daysInMonth - dayOfMonth;
    const projectedSpend = totalSpent + dailyAvg * daysLeft;
    const projectedRemaining = totalIncome - projectedSpend;

    return {
      totalIncome,
      totalSpent,
      remaining,
      projectedRemaining: Math.round(projectedRemaining * 100) / 100,
      byType: {
        fixed: expenses.filter(e => e.type === ExpenseType.FIXED).reduce((a, e) => a + Number(e.amount), 0),
        variable: expenses.filter(e => e.type === ExpenseType.VARIABLE).reduce((a, e) => a + Number(e.amount), 0),
      },
    };
  }
}
