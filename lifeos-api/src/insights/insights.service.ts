import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Insight } from './entities/insight.entity';
import { User } from '../users/entities/user.entity';
import { UserContextService } from '../user-context/user-context.service';
import { RULE_REGISTRY } from './rules';

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    @InjectRepository(Insight) private readonly repo: Repository<Insight>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly context: UserContextService,
  ) {}

  async runForUser(userId: string): Promise<Insight[]> {
    const ctx = await this.context.build(userId);
    const today = new Date().toISOString().split('T')[0];

    const drafts = RULE_REGISTRY
      .map((rule) => rule.evaluate(ctx))
      .filter((d): d is NonNullable<typeof d> => !!d);
    if (!drafts.length) return [];

    const dedupeKeys = drafts.map((d) => `${d.ruleId}:${userId}:${today}`);
    const existing = await this.repo.find({
      where: { dedupeKey: In(dedupeKeys) },
      select: { dedupeKey: true },
    });
    const existingKeys = new Set(existing.map((e) => e.dedupeKey));

    const entities = drafts
      .filter((_, i) => !existingKeys.has(dedupeKeys[i]))
      .map((draft) => {
        const dedupeKey = `${draft.ruleId}:${userId}:${today}`;
        return this.repo.create({
          user: { id: userId } as any,
          ruleId: draft.ruleId,
          category: draft.category,
          priority: draft.priority,
          title: draft.title,
          message: draft.message,
          data: draft.data ?? null,
          dedupeKey,
        });
      });

    const saved = entities.length ? await this.repo.save(entities) : [];
    this.logger.log(`runForUser(${userId}): ${saved.length} new insight(s)`);
    return saved;
  }

  async runForAll(): Promise<{ users: number; created: number }> {
    const users = await this.usersRepo.find({ select: { id: true } });
    let created = 0;
    for (const u of users) {
      try {
        const list = await this.runForUser(u.id);
        created += list.length;
      } catch (err: any) {
        this.logger.warn(`Insight run failed for ${u.id}: ${err.message}`);
      }
    }
    return { users: users.length, created };
  }

  list(userId: string, opts: { unreadOnly?: boolean; limit?: number } = {}) {
    return this.repo.find({
      where: {
        user: { id: userId },
        ...(opts.unreadOnly ? { readAt: IsNull() } : {}),
      },
      order: { createdAt: 'DESC' },
      take: opts.limit ?? 50,
    });
  }

  async markRead(id: string, userId: string) {
    const item = await this.repo.findOne({ where: { id, user: { id: userId } } });
    if (!item) throw new NotFoundException('Insight not found');
    item.readAt = new Date();
    return this.repo.save(item);
  }

  async markAllRead(userId: string) {
    const res = await this.repo.update(
      { user: { id: userId }, readAt: IsNull() },
      { readAt: new Date() },
    );
    return { updated: res.affected ?? 0 };
  }

  async delete(id: string, userId: string) {
    const res = await this.repo.delete({ id, user: { id: userId } });
    if (!res.affected) throw new NotFoundException('Insight not found');
    return { deleted: true };
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailyRun() {
    this.logger.log('Daily insights cron starting…');
    const { users, created } = await this.runForAll();
    this.logger.log(`Daily insights cron done — users=${users} created=${created}`);
  }
}
