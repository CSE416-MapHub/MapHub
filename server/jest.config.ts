module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest' // Use 'ts-jest' for TypeScript files
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/build/'],
};

