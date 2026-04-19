import { Module } from '@nestjs/common';
import { AI_SERVICE } from './ai.service';
import { GroqProvider } from './providers/groq.provider';

@Module({
  providers: [
    GroqProvider,
    { provide: AI_SERVICE, useExisting: GroqProvider },
  ],
  exports: [AI_SERVICE],
})
export class AiModule {}
