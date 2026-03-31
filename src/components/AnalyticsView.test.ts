import { describe, it, expect } from 'vitest';
import AnalyticsView from './AnalyticsView.svelte';

describe('AnalyticsView Component', () => {
  it('should export the AnalyticsView component', () => {
    expect(AnalyticsView).toBeDefined();
  });

  it('should have the correct component type', () => {
    expect(typeof AnalyticsView).toBe('function');
  });
});
