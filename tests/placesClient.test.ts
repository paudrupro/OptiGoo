import { describe, expect, it } from 'vitest';
import { inferCity } from '@/lib/services/placesClient';

describe('inferCity', () => {
  it('extracts city from address_components when available', () => {
    const city = inferCity('12 Rue X, France', 'Lyon', [
      { long_name: 'Lyon', short_name: 'Lyon', types: ['locality', 'political'] }
    ]);
    expect(city).toBe('Lyon');
  });

  it('extracts city from french postal format', () => {
    expect(inferCity('12 Rue X, 69001 Lyon, France', 'Lyon')).toBe('Lyon');
  });

  it('falls back to previous useful segment when country is present', () => {
    expect(inferCity('Main Street, Annecy, France', 'Annecy')).toBe('Annecy');
  });

  it('uses fallback when address is empty', () => {
    expect(inferCity(undefined, 'Bondy')).toBe('Bondy');
  });
});
