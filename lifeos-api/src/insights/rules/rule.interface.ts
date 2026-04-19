import type { UserContext } from '../../user-context/types';
import type { InsightCategory, InsightPriority } from '../entities/insight.entity';

export interface InsightDraft {
  ruleId: string;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface InsightRule {
  id: string;
  evaluate(ctx: UserContext): InsightDraft | null;
}
