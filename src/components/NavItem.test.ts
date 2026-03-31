import { describe, it, expect } from 'vitest';
import NavItem from './NavItem.svelte';

describe('NavItem Component', () => {
  it('should export the NavItem component', () => {
    expect(NavItem).toBeDefined();
  });

  it('should have the correct component type', () => {
    expect(typeof NavItem).toBe('function');
  });
});
