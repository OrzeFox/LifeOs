export const DomainEvents = {
  ExpenseCreated: 'expense.created',
  SleepLogged: 'sleep.logged',
  JournalUpserted: 'journal.upserted',
  HabitLogged: 'habit.logged',
  GymLogged: 'gym.logged',
} as const;

export type DomainEvent = (typeof DomainEvents)[keyof typeof DomainEvents];

export interface DomainEventPayload {
  userId: string;
  event: DomainEvent;
  at: string;
  meta?: Record<string, any>;
}
