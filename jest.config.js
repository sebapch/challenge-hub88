
const nextJest = require('next/jest')({
    dir: './',
  });
  
  /** @type {import('jest').Config} */
  const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    testEnvironment: 'jsdom',
    moduleNameMapper: {
       '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
       '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
     },
  };
  
  module.exports = nextJest(customJestConfig);