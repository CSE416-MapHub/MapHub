module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest', // Use 'ts-jest' for TypeScript files
    '^.+\\.js$': 'babel-jest', // Use 'babel-jest' for JavaScript files
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/build/'],
};

