import { useCallback } from 'react';
import type { EncryptedData } from '../types.ts';

const useEncryption = () => {
  const getPasswordKey = (password: string) => {
    const enc = new TextEncoder();
    return window.crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  };

  const deriveEncryptionKey = (passwordKey: CryptoKey, salt: Uint8Array) => {
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 250000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };
  
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  const encrypt = useCallback(async (text: string, password: string): Promise<EncryptedData> => {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encodedText = enc.encode(text);

    const passwordKey = await getPasswordKey(password);
    const aesKey = await deriveEncryptionKey(passwordKey, salt);

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encodedText
    );

    return {
        enc: true,
        cipher: 'AES-GCM',
        kdf: 'PBKDF2-SHA256',
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        data: arrayBufferToBase64(encryptedContent),
    }
  }, []);

  const decrypt = useCallback(async (encryptedPayload: EncryptedData, password: string): Promise<string> => {
    const salt = base64ToArrayBuffer(encryptedPayload.salt);
    const iv = base64ToArrayBuffer(encryptedPayload.iv);
    const data = base64ToArrayBuffer(encryptedPayload.data);
    
    const passwordKey = await getPasswordKey(password);
    const aesKey = await deriveEncryptionKey(passwordKey, salt as Uint8Array);
    
    const decryptedContent = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        data
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedContent);
  }, []);

  return { encrypt, decrypt };
};

export default useEncryption;
