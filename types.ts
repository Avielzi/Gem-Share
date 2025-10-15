// FIX: Replaced incorrect file content with the correct type definitions.
// The previous content was an erroneous copy of `index.tsx`, causing numerous type errors.

export enum GemCategory {
  MUSIC = 'Music',
  CODE = 'Code',
  MARKETING = 'Marketing',
  SALES = 'Sales',
  MISC = 'Misc',
}

export interface LocalizedString {
  en: string;
  he: string;
}

export interface GemInput {
  key: string;
  label: LocalizedString;
  type: 'string' | 'textarea' | 'boolean' | 'number' | 'enum';
  required: boolean;
  options?: string[];
}

export interface EncryptedData {
  enc: true;
  cipher: string;
  kdf: string;
  salt: string;
  iv: string;
  data: string;
}

export interface UnencryptedData {
  enc: false;
  content: string;
}

export interface Gem {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  version: string;
  category: GemCategory;
  icon: string;
  color: string;
  tags: string[];
  inputs: GemInput[];
  prompt: EncryptedData | UnencryptedData;
  models: {
    text: string;
    imageEnabled: boolean;
  };
  meta: {
    createdAt: string;
    updatedAt: string;
    breakingChanges?: string[];
  };
  integrity: string;
}

export interface GemRun {
  id: string;
  gemId: string;
  timestamp: string;
  inputs: Record<string, any>;
  outputs: {
    text?: string;
    image?: string;
  };
}

export interface LibraryManifest {
  version: string;
  lastUpdatedAt: string;
}