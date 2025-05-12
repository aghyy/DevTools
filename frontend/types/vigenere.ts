// Vigenere cipher request types
export type VigenereVariant = 'vigenère' | 'autokey' | 'beaufort' | 'gronsfeld' | 'porta';
export type VigenereOperation = 'encrypt' | 'decrypt';

export interface VigenereRequest {
  message: string;
  key: string;
  variant: VigenereVariant;
  alphabet: string;
  operation: VigenereOperation;
}

export interface VigenereResponse {
  result: string;
}

export interface VigenereErrorResponse {
  error: string;
} 