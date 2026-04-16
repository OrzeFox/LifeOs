import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FinancesService } from './finances.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { SetIncomeDto } from './dto/set-income.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@UseGuards(JwtAuthGuard)
@Controller('finances')
export class FinancesController {
  private readonly logger = new Logger(FinancesController.name);

  constructor(private readonly financesService: FinancesService) { }

  @Post('expenses')
  createExpense(@CurrentUser() user, @Body() dto: CreateExpenseDto) {
    this.logger.log(`POST /finances/expenses — user: ${user.id} | "${dto.name}" $${dto.amount} [${dto.type}]`);
    return this.financesService.createExpense(user.id, dto);
  }

  @Get('expenses')
  getExpenses(
    @CurrentUser() user,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = parseInt(month) || now.getMonth() + 1;
    this.logger.log(`GET /finances/expenses — user: ${user.id} | ${y}-${m}`);
    return this.financesService.getExpensesByMonth(user.id, y, m);
  }

  @Delete('expenses/:id')
  deleteExpense(@CurrentUser() user, @Param('id') id: string) {
    this.logger.log(`DELETE /finances/expenses/${id} — user: ${user.id}`);
    return this.financesService.deleteExpense(id, user.id);
  }

  @Post('income')
  setIncome(@CurrentUser() user, @Body() dto: SetIncomeDto) {
    this.logger.log(`POST /finances/income — user: ${user.id} | $${dto.amount} month: ${dto.month}`);
    return this.financesService.setMonthlyIncome(user.id, dto.amount, dto.month);
  }

  @Get('summary')
  getSummary(
    @CurrentUser() user,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = parseInt(month) || now.getMonth() + 1;
    this.logger.log(`GET /finances/summary — user: ${user.id} | ${y}-${m}`);
    return this.financesService.getMonthlySummary(user.id, y, m);
  }

  @Get('categories')
  getCategories(@CurrentUser() user) {
    return this.financesService.getCategories(user.id);
  }

  @Post('categories')
  createCategory(@CurrentUser() user, @Body() dto: CreateCategoryDto) {
    this.logger.log(`POST /finances/categories — user: ${user.id} | "${dto.name}"`);
    return this.financesService.createCategory(user.id, dto.name);
  }
}
