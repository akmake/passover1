// server/jest.config.js
export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  // Add this line:
  setupFilesAfterEnv: ['./jest.setup.js'], 
  
  clearMocks: true,
  coverageDirectory: 'coverage',
};