import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventCategory } from './entities/event-category.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventCategoryDto } from './dto/create-category.dto';
import { CALENDAR_PROVIDER } from './integrations/calendar.provider';
import type { CalendarProvider } from './integrations/calendar.provider';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventsRepo: Repository<Event>,
    @InjectRepository(EventCategory) private readonly categoriesRepo: Repository<EventCategory>,
    @Inject(CALENDAR_PROVIDER) private readonly calendar: CalendarProvider,
  ) {}

  async create(userId: string, dto: CreateEventDto) {
    const event = this.eventsRepo.create({
      user: { id: userId } as any,
      category: dto.categoryId ? ({ id: dto.categoryId } as any) : null,
      title: dto.title,
      description: dto.description,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      allDay: dto.allDay ?? false,
      location: dto.location,
      externalSource: 'local',
    });
    const saved = await this.eventsRepo.save(event);

    try {
      const remote = await this.calendar.createEvent(userId, {
        title: dto.title, description: dto.description,
        startAt: saved.startAt, endAt: saved.endAt,
        allDay: saved.allDay, location: dto.location,
      });
      saved.externalId = remote.externalId;
      saved.externalSource = remote.source;
      await this.eventsRepo.save(saved);
    } catch { /* ignore remote sync failure */ }

    return saved;
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const event = await this.eventsRepo.findOne({ where: { id, user: { id: userId } as any } });
    if (!event) throw new NotFoundException('Event not found');

    if (dto.title !== undefined) event.title = dto.title;
    if (dto.description !== undefined) event.description = dto.description;
    if (dto.startAt) event.startAt = new Date(dto.startAt);
    if (dto.endAt) event.endAt = new Date(dto.endAt);
    if (dto.allDay !== undefined) event.allDay = dto.allDay;
    if (dto.location !== undefined) event.location = dto.location;
    if (dto.categoryId !== undefined) event.category = { id: dto.categoryId } as any;

    return this.eventsRepo.save(event);
  }

  async delete(id: string, userId: string) {
    const event = await this.eventsRepo.findOne({ where: { id, user: { id: userId } as any } });
    if (!event) throw new NotFoundException('Event not found');
    await this.eventsRepo.remove(event);
    if (event.externalId && event.externalSource === 'google') {
      try { await this.calendar.deleteEvent(userId, event.externalId); } catch {}
    }
    return { deleted: true };
  }

  list(userId: string, from?: string, to?: string, categoryId?: string) {
    const where: any = { user: { id: userId } };
    if (from && to) where.startAt = Between(new Date(from), new Date(to));
    if (categoryId) where.category = { id: categoryId };
    return this.eventsRepo.find({
      where, relations: ['category'], order: { startAt: 'ASC' },
    });
  }

  upcoming(userId: string, limit = 5) {
    return this.eventsRepo.find({
      where: { user: { id: userId } as any, startAt: MoreThanOrEqual(new Date()) },
      relations: ['category'],
      order: { startAt: 'ASC' },
      take: limit,
    });
  }

  listCategories(userId: string) {
    return this.categoriesRepo.find({
      where: { user: { id: userId } as any },
      order: { name: 'ASC' },
    });
  }

  createCategory(userId: string, dto: CreateEventCategoryDto) {
    const category = this.categoriesRepo.create({
      user: { id: userId } as any,
      name: dto.name,
      color: dto.color ?? '#4EDEA3',
    });
    return this.categoriesRepo.save(category);
  }

  async syncFromGoogle(userId: string, from: Date, to: Date) {
    const remote = await this.calendar.listEvents(userId, from, to);
    const imported: Event[] = [];
    for (const r of remote) {
      const existing = await this.eventsRepo.findOne({
        where: { user: { id: userId } as any, externalId: r.externalId },
      });
      if (existing) continue;
      const event = this.eventsRepo.create({
        user: { id: userId } as any,
        title: r.title,
        description: r.description,
        startAt: r.startAt,
        endAt: r.endAt,
        allDay: r.allDay,
        location: r.location,
        externalId: r.externalId,
        externalSource: r.source,
      });
      imported.push(await this.eventsRepo.save(event));
    }
    return { imported: imported.length };
  }
}
