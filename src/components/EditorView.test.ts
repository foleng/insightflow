import { describe, it, expect } from 'vitest';
import EditorView from './EditorView.svelte';

describe('EditorView Component', () => {
  it('should export the EditorView component', () => {
    expect(EditorView).toBeDefined();
  });

  it('should have the correct component type', () => {
    expect(typeof EditorView).toBe('function');
  });
});
