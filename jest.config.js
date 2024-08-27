const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)$',
  moduleNameMapper: {
    '^@www778878net/koa78-upinfo$': path.resolve(__dirname, 'node_modules/@www778878net/koa78-upinfo/dist/src/index.js')
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};