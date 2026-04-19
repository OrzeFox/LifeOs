import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InsightsService } from '../insights/insights.service';
import { DomainEvents, type DomainEventPayload } from './events';

@Injectable()
export class SmartAlertsService {
  private readonly logger = new Logger(SmartAlertsService.name);
  private readonly debounce = new Map<string, number>();
  private readonly DEBOUNCE_MS = 5_000;
  private readonly DEBOUNCE_TTL_MS = 60_000;
  private readonly DEBOUNCE_MAX = 10_000;

  constructor(private readonly insights: InsightsService) {}

  @OnEvent(DomainEvents.ExpenseCreated)
  @OnEvent(DomainEvents.SleepLogged)
  @OnEvent(DomainEvents.JournalUpserted)
  @OnEvent(DomainEvents.HabitLogged)
  @OnEvent(DomainEvents.GymLogged)
  async onDomainEvent(payload: DomainEventPayload) {
    if (!payload?.userId) return;

    const key = `${payload.userId}:${payload.event}`;
    const now = Date.now();
    const last = this.debounce.get(key) ?? 0;
    if (now - last < this.DEBOUNCE_MS) return;
    this.debounce.set(key, now);
    if (this.debounce.size > this.DEBOUNCE_MAX) this.pruneDebounce(now);

    try {
      const created = await this.insights.runForUser(payload.userId);
      if (created.length > 0) {
        this.logger.log(
          `SmartAlerts [${payload.event}] user=${payload.userId} created=${created.length}`,
        );
      }
    } catch (err: any) {
      this.logger.warn(`SmartAlerts failed [${payload.event}]: ${err.message}`);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  pruneDebounceCron() {
    this.pruneDebounce(Date.now());
  }

  private pruneDebounce(now: number) {
    for (const [k, ts] of this.debounce) {
      if (now - ts > this.DEBOUNCE_TTL_MS) this.debounce.delete(k);
    }
  }
}
