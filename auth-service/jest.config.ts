import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  testMatch: ['**/__tests__/**/*.test.ts'],
  clearMocks: true,
};

export default config;
