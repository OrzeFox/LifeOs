export interface EventCategory {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface AppEvent {
  id: string;
  title: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location?: string | null;
  externalId?: string | null;
  externalSource?: 'google' | 'local' | null;
  category?: EventCategory | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  location?: string;
  categoryId?: string;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

export interface CreateCategoryPayload {
  name: string;
  color?: string;
}
