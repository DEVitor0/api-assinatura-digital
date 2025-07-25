import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/.jest/env.ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
};

export default config;
