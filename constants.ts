import { GemCategory } from './types.ts';

export const API_KEY_STORAGE_KEY = 'gem_share_api_key';

export const ICONS = [
  'Sparkles', 'Code', 'FileText', 'Megaphone', 'Briefcase', 'Gamepad2', 
  'Bot', 'BrainCircuit', 'Feather', 'Lightbulb', 'Rocket', 'Languages',
  'Paintbrush', 'Music', 'Camera', 'Film', 'BookOpen', 'Globe',
  'SlidersHorizontal', 'ShieldAlert', 'GitMerge', 'FileBarChart', 'Mail', 
  'ClipboardCheck', 'Image', 'DollarSign', 'Settings2'
];

export const COLORS: { [key in GemCategory]: string } = {
  [GemCategory.MUSIC]: '#ff914d',
  [GemCategory.CODE]: '#3b82f6',
  [GemCategory.MARKETING]: '#a855f7',
  [GemCategory.SALES]: '#22c55e',
  [GemCategory.MISC]: '#94a3b8',
};

export const CATEGORIES: GemCategory[] = [
    GemCategory.MUSIC, GemCategory.CODE, GemCategory.MARKETING, GemCategory.SALES, GemCategory.MISC
];

export const SortOptions = {
  UPDATED_DESC: 'updatedAt_desc',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  CREATED_AT_ASC: 'createdAt_asc',
  CATEGORY: 'category',
} as const;
