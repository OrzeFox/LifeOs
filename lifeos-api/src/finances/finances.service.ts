import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Expense, ExpenseType } from './entities/expense.entity';
import { MonthlyIncome } from './entities/monthly-income.entity';
import { ExpenseCategory } from './entities/expense-category.entity';

@Injectable()
export class FinancesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepo: Repository<Expense>,
    @InjectRepository(MonthlyIncome)
    private readonly incomeRepo: Repository<MonthlyIncome>,
    @InjectRepository(ExpenseCategory)
    private readonly categoriesRepo: Repository<ExpenseCategory>,
  ) { }
  createExpense(userId: string, data: Partial<Expense>) {
    const expense = this.expensesRepo.create({ ...data, user: { id: userId } });
    return this.expensesRepo.save(expense);
  }

  getExpensesByMonth(userId: string, year: number, month: number) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().split('T')[0];
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

  // --- Categories ---
  getCategories(userId: string) {
    return this.categoriesRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' },
    });
  }

  async createCategory(userId: string, name: string) {
    const existing = await this.categoriesRepo.findOne({
      where: { user: { id: userId }, name },
    });
    if (existing) return existing;
    const cat = this.categoriesRepo.create({ name, user: { id: userId } });
    return this.categoriesRepo.save(cat);
  }

  // --- Summary ---
  async getMonthlySummary(userId: string, year: number, month: number) {
    const monthStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const expenses = await this.getExpensesByMonth(userId, year, month);
    const income = await this.getMonthlyIncome(userId, monthStr);

    const totalSpent = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const totalIncome = income ? Number(income.amount) : 0;
    const remaining = totalIncome - totalSpent;

    const today = new Date();
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayOfMonth = today.getMonth() + 1 === month ? today.getDate() : daysInMonth;
    const dailyAvg = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;
    const daysLeft = daysInMonth - dayOfMonth;
    const projectedSpend = totalSpent + dailyAvg * daysLeft;
    const projectedRemaining = totalIncome - projectedSpend;

    const byCategory: Record<string, number> = {};
    for (const e of expenses) {
      const key = e.category?.trim() || 'Sin categoría';
      byCategory[key] = (byCategory[key] ?? 0) + Number(e.amount);
    }

    return {
      totalIncome,
      totalSpent,
      remaining,
      projectedRemaining: Math.round(projectedRemaining * 100) / 100,
      byType: {
        fixed: expenses.filter(e => e.type === ExpenseType.FIXED).reduce((a, e) => a + Number(e.amount), 0),
        variable: expenses.filter(e => e.type === ExpenseType.VARIABLE).reduce((a, e) => a + Number(e.amount), 0),
      },
      byCategory,
    };
  }
}
