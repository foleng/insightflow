import { describe, it, expect } from 'vitest';
import SettingsView from './SettingsView.svelte';

describe('SettingsView Component', () => {
  it('should export the SettingsView component', () => {
    expect(SettingsView).toBeDefined();
  });

  it('should have the correct component type', () => {
    expect(typeof SettingsView).toBe('function');
  });
});
