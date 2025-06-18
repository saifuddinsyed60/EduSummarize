import { cn } from '../utils';

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    expect(cn('base', 'additional')).toBe('base additional');
  });

  it('handles conditional classes', () => {
    expect(cn('base', { conditional: true, hidden: false })).toBe('base conditional');
  });

  it('handles Tailwind classes correctly', () => {
    const result = cn('p-4 bg-blue-500', 'p-6');
    expect(result).toContain('p-6');
    expect(result).toContain('bg-blue-500');
    expect(result).not.toContain('p-4');
  });

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'valid')).toBe('base valid');
  });

  it('handles empty strings', () => {
    expect(cn('base', '', 'valid')).toBe('base valid');
  });
}); 