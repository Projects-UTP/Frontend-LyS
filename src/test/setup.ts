import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
afterEach(cleanup);
