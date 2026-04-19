import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventCategory } from './entities/event-category.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { CALENDAR_PROVIDER } from './integrations/calendar.provider';
import { LocalCalendarProvider } from './integrations/local-calendar.provider';
import { GoogleCalendarProvider } from './integrations/google-calendar.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventCategory])],
  controllers: [EventsController],
  providers: [
    EventsService,
    LocalCalendarProvider,
    GoogleCalendarProvider,
    {
      provide: CALENDAR_PROVIDER,
      useFactory: (local: LocalCalendarProvider, google: GoogleCalendarProvider) => {
        return process.env.CALENDAR_PROVIDER === 'google' ? google : local;
      },
      inject: [LocalCalendarProvider, GoogleCalendarProvider],
    },
  ],
  exports: [EventsService],
})
export class EventsModule {}
