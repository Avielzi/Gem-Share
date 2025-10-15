import type { Gem } from './types.ts';

// Helper function to correctly encode Unicode strings to Base64
const utf8_to_b64 = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)));
};

// Helper function to correctly decode Base64 to Unicode strings
const b64_to_utf8 = (str: string): string => {
  return decodeURIComponent(escape(atob(str)));
};


export const calculateHash = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const createShareData = (gem: Gem): string => {
  // Share only non-sensitive metadata for importing.
  const shareableGem = {
    id: gem.id,
    name: gem.name,
    description: gem.description,
    category: gem.category,
    icon: gem.icon,
    color: gem.color,
    inputs: gem.inputs,
    isEncrypted: gem.prompt.enc,
    version: gem.version,
    models: gem.models,
    meta: gem.meta,
  };
  const jsonString = JSON.stringify(shareableGem);
  return utf8_to_b64(jsonString);
};

export const createRunShareData = (gem: Gem): string => {
  // Share the full Gem object for running.
  const jsonString = JSON.stringify(gem);
  return utf8_to_b64(jsonString);
};

export const parseShareData = (data: string): Partial<Gem> | null => {
  try {
    const decoded = b64_to_utf8(data);
    const gemData = JSON.parse(decoded);
    // Basic validation
    if (gemData.id && gemData.name) {
      return gemData as Partial<Gem>;
    }
    return null;
  } catch (e) {
    console.error("Failed to parse share data", e);
    return null;
  }
};

export const parseRunShareData = (data: string): Gem | null => {
  try {
    const decoded = b64_to_utf8(data);
    const gemData = JSON.parse(decoded);
    // Basic validation for a runnable Gem
    if (gemData.id && gemData.name && gemData.prompt) {
      return gemData as Gem;
    }
    return null;
  } catch (e) {
    console.error("Failed to parse run share data", e);
    return null;
  }
};