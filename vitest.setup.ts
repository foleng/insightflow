import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

// Run cleanup after each test
afterEach(() => {
  cleanup();
});
