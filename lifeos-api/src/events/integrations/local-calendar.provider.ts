import { Injectable } from '@nestjs/common';
import { CalendarEventInput, CalendarEventRemote, CalendarProvider } from './calendar.provider';

@Injectable()
export class LocalCalendarProvider implements CalendarProvider {
  async listEvents(): Promise<CalendarEventRemote[]> {
    return [];
  }

  async createEvent(_userId: string, input: CalendarEventInput): Promise<CalendarEventRemote> {
    return {
      externalId: `local-${Date.now()}`,
      source: 'local',
      title: input.title,
      description: input.description,
      startAt: input.startAt,
      endAt: input.endAt,
      allDay: input.allDay ?? false,
      location: input.location,
    };
  }

  async updateEvent(_userId: string, externalId: string, input: Partial<CalendarEventInput>): Promise<CalendarEventRemote> {
    return {
      externalId,
      source: 'local',
      title: input.title ?? '',
      description: input.description,
      startAt: input.startAt!,
      endAt: input.endAt!,
      allDay: input.allDay ?? false,
      location: input.location,
    };
  }

  async deleteEvent(): Promise<void> {
    return;
  }
}
