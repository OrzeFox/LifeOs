import type { InsightRule } from './rule.interface';
import { lowSleepWithWorkoutRule } from './low-sleep-with-workout.rule';
import { habitsMissedStreakRule } from './habits-missed-streak.rule';
import { overSpendingRule } from './over-spending.rule';
import { noWorkoutStreakRule } from './no-workout-streak.rule';
import { lowMoodStreakRule } from './low-mood-streak.rule';
import { journalGapRule } from './journal-gap.rule';

export const RULE_REGISTRY: InsightRule[] = [
  lowSleepWithWorkoutRule,
  habitsMissedStreakRule,
  overSpendingRule,
  noWorkoutStreakRule,
  lowMoodStreakRule,
  journalGapRule,
];
