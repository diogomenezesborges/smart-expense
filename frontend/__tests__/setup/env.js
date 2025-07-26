// Environment setup for tests
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_APP_ENV = 'test'

// Mock environment variables for testing
process.env.GEMINI_API_KEY = 'test-gemini-api-key'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/smartexpense_test'
process.env.REDIS_URL = 'redis://localhost:6379/1'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'