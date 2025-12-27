import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server/tests'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'server/tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/server/$1',
  },
  verbose: true,
};

export default config;
