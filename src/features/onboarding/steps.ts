import type { StepId } from '../../lib/validation';

export interface StepConfig {
  id: StepId;
  title: string;
  hint: string;
  optional: boolean;
}

export const STEPS: StepConfig[] = [
  { id: 'names', title: 'Who lives in this universe?', hint: 'Your names, written the way you like them.', optional: false },
  { id: 'nicknames', title: 'What do you call each other?', hint: 'Pet names are welcome. Skip it if you like.', optional: true },
  { id: 'story', title: 'A few small details', hint: 'Both are optional and can be skipped.', optional: true },
  { id: 'theme', title: 'Choose your sky', hint: 'You can change this later.', optional: false },
];
