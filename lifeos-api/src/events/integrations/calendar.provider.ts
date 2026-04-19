export interface CalendarEventInput {
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  allDay?: boolean;
  location?: string;
}

export interface CalendarEventRemote {
  externalId: string;
  source: 'google' | 'local';
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  location?: string;
}

export interface CalendarProvider {
  listEvents(userId: string, from: Date, to: Date): Promise<CalendarEventRemote[]>;
  createEvent(userId: string, input: CalendarEventInput): Promise<CalendarEventRemote>;
  updateEvent(userId: string, externalId: string, input: Partial<CalendarEventInput>): Promise<CalendarEventRemote>;
  deleteEvent(userId: string, externalId: string): Promise<void>;
}

export const CALENDAR_PROVIDER = Symbol('CALENDAR_PROVIDER');
