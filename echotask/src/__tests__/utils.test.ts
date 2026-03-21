import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  parseTags, 
  capitalize, 
  ensurePunctuation, 
  truncate, 
  isValidApiKey, 
  cleanObject,
  isBlank,
  isEmpty,
  cleanSpaces,
  formatDate,
  relativeTime,
  mergeById
} from '../utils';

describe('Utils Functions', () => {
  
  describe('parseTags', () => {
    it('should parse comma-separated tags and clean them', () => {
      expect(parseTags('urgent, Travail,  ')).toEqual(['urgent', 'travail']);
      expect(parseTags('Tag1,tag2,TAG3')).toEqual(['tag1', 'tag2', 'tag3']);
      expect(parseTags('')).toEqual([]);
      expect(parseTags('  ,  ')).toEqual([]);
    });
  });

  describe('capitalize', () => {
    it('should capitalize the first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
      expect(capitalize('')).toBe('');
    });
  });

  describe('ensurePunctuation', () => {
    it('should add punctuation if missing', () => {
      expect(ensurePunctuation('Hello')).toBe('Hello.');
      expect(ensurePunctuation('Hello', '!')).toBe('Hello!');
    });

    it('should not add punctuation if already present', () => {
      expect(ensurePunctuation('Hello.')).toBe('Hello.');
      expect(ensurePunctuation('Hello!')).toBe('Hello!');
      expect(ensurePunctuation('Hello?')).toBe('Hello?');
    });
  });

  describe('truncate', () => {
    it('should truncate text if longer than maxLength', () => {
      expect(truncate('Hello World', 5)).toBe('He...');
      expect(truncate('Hello World', 8, '!')).toBe('Hello W!');
    });

    it('should not truncate if shorter than maxLength', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });
  });

  describe('isValidApiKey', () => {
    it('should validate OpenAI API key format', () => {
      const validKey = 'sk-' + 'a'.repeat(48);
      expect(isValidApiKey(validKey)).toBe(true);
      expect(isValidApiKey('invalid-key')).toBe(false);
      expect(isValidApiKey('sk-short')).toBe(false);
    });
  });

  describe('cleanObject', () => {
    it('should remove null and undefined values', () => {
      const input = { a: 1, b: null, c: undefined, d: '' };
      expect(cleanObject(input)).toEqual({ a: 1, d: '' });
    });
  });

  describe('isBlank and isEmpty', () => {
    it('should check for blank strings', () => {
      expect(isBlank('')).toBe(true);
      expect(isBlank('  ')).toBe(true);
      expect(isBlank('a')).toBe(false);
    });

    it('should check for empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty(0)).toBe(false);
    });
  });

  describe('cleanSpaces', () => {
    it('should replace multiple spaces with single space', () => {
      expect(cleanSpaces('hello   world  ')).toBe('hello world');
      expect(cleanSpaces('\n hello \t world \n')).toBe('hello world');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date correctly', () => {
      const iso = '2025-10-10T14:30:00.000Z';
      // Use a regex because localestring depends on environment
      expect(formatDate(iso, 'fr-FR')).toMatch(/\d{2}\/\d{2}\/2025/);
    });
  });

  describe('relativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // Set fixed system time: 2026-03-12T12:00:00Z
      const date = new Date('2026-03-12T12:00:00Z');
      vi.setSystemTime(date);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return relative time for French', () => {
      const now = new Date('2026-03-12T12:00:00Z');
      
      const twoMinsAgo = new Date(now.getTime() - 2 * 60000).toISOString();
      expect(relativeTime(twoMinsAgo, 'fr')).toBe('Il y a 2 min');

      const threeHoursAgo = new Date(now.getTime() - 3 * 3600000).toISOString();
      expect(relativeTime(threeHoursAgo, 'fr')).toBe('Il y a 3h');

      const fourDaysAgo = new Date(now.getTime() - 4 * 86400000).toISOString();
      expect(relativeTime(fourDaysAgo, 'fr')).toBe('Il y a 4j');
    });

    it('should return relative time for English', () => {
      const now = new Date('2026-03-12T12:00:00Z');
      
      const twoMinsAgo = new Date(now.getTime() - 2 * 60000).toISOString();
      expect(relativeTime(twoMinsAgo, 'en')).toBe('2 min ago');
    });
  });

  describe('mergeById', () => {
    it('should merge two arrays by ID, removing duplicates', () => {
      const arr1 = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }];
      const arr2 = [{ id: '2', name: 'B2' }, { id: '3', name: 'C' }];
      
      const result = mergeById(arr1, arr2);
      expect(result).toHaveLength(3);
      expect(result.find(i => i.id === '2')?.name).toBe('B2'); // Last one wins in Map
    });
  });
});
