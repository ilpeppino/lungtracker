Commands to Run Tests

Run All Tests (unit + integration):

'''
cd backend
npm test
'''

This runs Jest and executes all test files in the configured roots (e.g., src and tests).
Run Unit Tests Only, Unit tests are in __tests__
This filters Jest to run only tests in the __tests__ directory

'''
cd backend
npm test -- __tests__
'''

Run Integration Tests Only, Integration tests are in tests/integration/

'''
cd backend
npm test -- tests/integration
'''


If you need to run a specific test file, use: npm test -- path/to/test/file.test.ts

Make sure you're in the backend directory when running these commands. If you encounter any issues (e.g., missing dependencies), run npm install first.