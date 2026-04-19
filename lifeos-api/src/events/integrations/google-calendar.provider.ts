import { Injectable, Logger } from '@nestjs/common';
import { CalendarEventInput, CalendarEventRemote, CalendarProvider } from './calendar.provider';

// Stub: requiere integración real con Google Calendar API.
// Pasos pendientes:
// 1. Guardar accessToken+refreshToken de Google en User (scopes: calendar.readonly/events)
// 2. Usar googleapis SDK: `npm i googleapis`
// 3. Implementar cada método con oauth2Client.setCredentials(tokens) + calendar.events.*
@Injectable()
export class GoogleCalendarProvider implements CalendarProvider {
  private readonly logger = new Logger(GoogleCalendarProvider.name);

  async listEvents(userId: string, from: Date, to: Date): Promise<CalendarEventRemote[]> {
    this.logger.warn(`GoogleCalendarProvider.listEvents not implemented (user: ${userId}, ${from}-${to})`);
    return [];
  }

  async createEvent(userId: string, input: CalendarEventInput): Promise<CalendarEventRemote> {
    this.logger.warn(`GoogleCalendarProvider.createEvent not implemented (user: ${userId})`);
    return {
      externalId: `google-pending-${Date.now()}`,
      source: 'google',
      title: input.title,
      description: input.description,
      startAt: input.startAt,
      endAt: input.endAt,
      allDay: input.allDay ?? false,
      location: input.location,
    };
  }

  async updateEvent(userId: string, externalId: string, input: Partial<CalendarEventInput>): Promise<CalendarEventRemote> {
    this.logger.warn(`GoogleCalendarProvider.updateEvent not implemented (user: ${userId})`);
    return {
      externalId,
      source: 'google',
      title: input.title ?? '',
      description: input.description,
      startAt: input.startAt!,
      endAt: input.endAt!,
      allDay: input.allDay ?? false,
      location: input.location,
    };
  }

  async deleteEvent(userId: string, externalId: string): Promise<void> {
    this.logger.warn(`GoogleCalendarProvider.deleteEvent not implemented (user: ${userId}, ${externalId})`);
  }
}
