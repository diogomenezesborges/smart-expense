# SmartExpense

> Intelligent family expense management with automated transaction categorization and multi-channel access

## 🎯 Vision

Transform manual expense tracking from a tedious, error-prone chore into an automated, intelligent system that provides actionable insights into family financial patterns.

## ✨ Key Features

- **🤖 Automation First**: Eliminate manual data entry through bank API integration
- **🧠 Intelligent Categorization**: ML-powered expense classification that learns from user corrections  
- **📱 Multi-Channel Access**: Dashboard for deep analysis + WhatsApp bot for quick queries
- **👨‍👩‍👧‍👦 Family-Centric**: Multi-user support for household expense management
- **📈 Continuous Learning**: Algorithm improves accuracy over time through user feedback

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/diogomenezesborges/smart-expense.git
   cd smart-expense
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database setup**
   ```bash
   # Create database and run migrations
   npm run db:migrate
   ```

5. **Development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
smart-expense/
├── frontend/                   # Next.js application
│   ├── app/                   # App Router (Next.js 14)
│   │   ├── api/              # API routes (serverless)
│   │   └── (auth)/           # Route groups
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base components (shadcn/ui)
│   │   └── feature/         # Feature-specific components
│   ├── lib/                 # Utilities and services
│   │   ├── auth/           # Authentication logic
│   │   ├── backend/        # Server-side utilities
│   │   └── types/          # Type definitions
│   └── __tests__/          # Test files
├── docs/                   # Documentation
└── data/                  # Data files and migrations
```

## 🛠️ Development

### Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:e2e     # Run E2E tests
```

### Code Quality Standards

- **TypeScript**: Strict mode enabled, zero `any` types
- **Testing**: Minimum 80% code coverage
- **Linting**: ESLint + Prettier configured
- **Security**: Automated security scanning

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Custom hooks
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + React Testing Library + Playwright

### Backend  
- **API**: Next.js API routes (serverless)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Validation**: Zod schemas
- **Logging**: Structured logging with Winston

### External Services
- **Banking API**: GoCardless for transaction data
- **ML/AI**: OpenAI API for categorization enhancement
- **Messaging**: WhatsApp Business API
- **Monitoring**: Sentry for error tracking

## 📋 Development Phases

### Phase 1: MVP (8 weeks)
- [x] Project setup and configuration
- [ ] GoCardless integration
- [ ] Basic categorization engine  
- [ ] Simple web dashboard
- [ ] Manual review interface

### Phase 2: Enhanced (6 weeks)
- [ ] ML-powered categorization
- [ ] WhatsApp bot integration
- [ ] Advanced analytics dashboard
- [ ] Multi-user support

### Phase 3: Optimization (4 weeks)
- [ ] Performance optimization
- [ ] Advanced reporting features
- [ ] Mobile app (optional)
- [ ] Third-party integrations

## 🤝 Contributing

Please read our [Contributing Guidelines](./docs/CONTRIBUTING.md) and [Development Guidelines](./docs/ENTERPRISE_DEVELOPMENT_GUIDELINES.md) before contributing.

### Git Workflow
1. Create feature branch from `main`
2. Follow conventional commit format
3. Submit pull request with detailed description
4. Ensure all checks pass (tests, lint, build)
5. Code review by team member required

## 📚 Documentation

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)
- [Development Guidelines](./docs/ENTERPRISE_DEVELOPMENT_GUIDELINES.md)
- [AI Assistant Usage](./docs/AI_ASSISTANT_USAGE_GUIDELINES.md)

## 🔒 Security

- JWT authentication with bcrypt password hashing
- Input validation on all user inputs (Zod schemas)
- HTTPS/SSL enforced in production
- Environment variables for all secrets
- Regular security audits and dependency updates

## 📊 Performance Targets

- **Frontend**: Core Web Vitals scores > 90
- **API**: Response times < 500ms (95th percentile)
- **Availability**: > 99.9% uptime
- **Test Coverage**: > 80% code coverage

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/diogomenezesborges/smart-expense/issues)
- **Discussions**: [GitHub Discussions](https://github.com/diogomenezesborges/smart-expense/discussions)
- **Documentation**: [Project Wiki](https://github.com/diogomenezesborges/smart-expense/wiki)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for families who want to take control of their finances**