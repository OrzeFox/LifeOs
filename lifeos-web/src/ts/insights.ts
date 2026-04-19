export type InsightCategory =
  | 'health'
  | 'finance'
  | 'productivity'
  | 'lifestyle'
  | 'alert';

export type InsightPriority = 'info' | 'warn' | 'critical';

export interface Insight {
  id: string;
  ruleId: string;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  message: string;
  data: Record<string, any> | null;
  createdAt: string;
  readAt: string | null;
}
