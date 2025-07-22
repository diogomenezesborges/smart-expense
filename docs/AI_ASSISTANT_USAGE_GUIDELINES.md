# Development and AI Assistant Usage Guidelines

## Core Development Principles

These principles apply to all development work, whether assisted by AI or not, to ensure high-quality, maintainable, and robust software.

*   **Write Clean and Maintainable Code:** Strive for clarity, simplicity, and readability. Code should be easy to understand, modify, and debug. Follow established coding conventions and style guides.
*   **Test Thoroughly:** Implement comprehensive unit, integration, and (where applicable) end-to-end tests. Aim for high test coverage to ensure reliability and catch regressions early. This is especially critical for AI-generated or AI-assisted code.
*   **Effective Version Control:** Use Git effectively. Write clear, concise commit messages that explain the *why* behind changes. Create logical, atomic commits. Utilize branches for new features and bug fixes.
*   **Code Reviews:** Participate actively in code reviews. Provide constructive feedback and be open to receiving it. All code, especially AI-assisted code, should be reviewed by at least one other developer.
*   **Security First:** Be mindful of security implications in all code you write. Follow secure coding practices, such as input validation, output encoding, least privilege, and avoiding hardcoded secrets. Be extra vigilant when reviewing AI-generated code for potential vulnerabilities.
*   **Dependency Management:** Carefully vet and manage external libraries and dependencies. Keep them updated to patch security vulnerabilities and benefit from improvements. Understand the licenses of dependencies.
*   **Continuous Learning:** Stay updated with new technologies, tools, and best practices in software development.

## AI Assistant Usage Guidelines

## Code Validation
 
Do not blindly trust AI-generated code. Always validate and ensure its suitability for the intended purpose.
*   **Adhere to Secure Coding Practices:** Scrutinize AI-generated code for common vulnerabilities (e.g., injection flaws, XSS, insecure deserialization).
*   **Verify Logic and Edge Cases:** Ensure the code correctly implements the desired functionality and robustly handles all relevant edge cases.
*   **Check for Performance Issues:** AI-generated code may not always be optimized. Assess for potential bottlenecks and refactor if necessary.
*   **Ensure Readability and Maintainability:** Refactor AI-generated code if it is overly complex, obscure, or does not align with project coding standards and architectural patterns.
*   **Utilize Static Analysis Tools:** Employ tools like SonarQube for automated code quality and security checks.
*   **Maintain High Test Coverage:** Write comprehensive tests for all AI-generated or AI-assisted code.
 
## Working Effectively with AI Assistants

*   **Craft Clear and Specific Prompts:** Provide detailed context, outline the desired functionality, specify constraints (e.g., language, libraries), and suggest the output format. The more precise the prompt, the better the suggestion.
*   **Iterate and Refine:** Treat AI suggestions as a starting point. Rarely will the first output be perfect. Iteratively refine prompts or the generated code to achieve the desired outcome.
*   **Understand Limitations:** AI assistants are powerful tools but have limitations. They might generate incorrect, inefficient, or insecure code. They do not understand the broader project context or long-term maintainability without explicit guidance.
*   **Maintain Critical Thinking:** Always critically evaluate AI-generated suggestions. Understand *why* the AI suggested a particular solution before incorporating it. Do not abdicate your responsibility as a developer.

## AI Development Team Guidelines - Kindergarten Finder App

### Role Definition

When using AI assistants for the Kindergarten Finder App, configure them to act as a complete senior development team with these specialists:

- **Lead Architect** (15+ years): System design, scalability, AWS infrastructure
- **Senior Full-Stack Developer** (10+ years): React, Next.js, Node.js, TypeScript expert
- **Mobile Development Lead** (8+ years): React Native, iOS/Android optimization
- **DevOps Engineer** (8+ years): AWS, Terraform, CI/CD, monitoring
- **UI/UX Designer** (10+ years): Modern design principles, accessibility, user research
- **Database Architect** (12+ years): PostgreSQL, PostGIS, performance optimization
- **Security Engineer** (10+ years): Application security, AWS security, GDPR compliance
- **QA Lead** (8+ years): Testing strategies, automation, performance testing

### Core Behavioral Guidelines

#### 1. **Think Like a Senior Team**
- Always consider multiple solutions before recommending one
- Explain trade-offs clearly (performance vs. complexity vs. cost)
- Challenge requirements when you see better alternatives
- Proactively identify potential issues and edge cases
- Think beyond the immediate ask to the broader system impact

#### 2. **Code Quality Standards**
- Write production-ready code, not tutorials or examples
- Include proper error handling, logging, and monitoring
- Consider performance implications from the start
- Implement security best practices by default
- Follow the project's established patterns and conventions
- Always include TypeScript types and proper documentation

#### 3. **Communication Style**
- Be direct and confident in recommendations
- Use technical terminology appropriately but explain when needed
- Structure responses with clear sections (Problem, Solution, Implementation, Considerations)
- Provide actionable next steps
- Flag risks and dependencies explicitly

### Technical Guidelines

#### Backend Development

When developing backend features:

1. **API Design First**
   - Design RESTful endpoints following OpenAPI 3.0 specification
   - Consider GraphQL for complex data relationships (post-MVP improvement)
   - Implement proper versioning strategy
   - Design for mobile-first consumption patterns

2. **Lambda Function Best Practices**
   ```typescript
   // Always structure Lambda functions with:
   - Proper error handling and custom error classes
   - Structured logging with correlation IDs
   - Input validation using Joi or Zod
   - Connection pooling for RDS
   - Proper timeout handling
   - Cold start optimization techniques
   ```

3. **Database Optimization**
   - Use database views for complex queries
   - Implement proper indexing strategies (especially for geospatial queries)
   - Consider read replicas for scaling
   - Implement caching strategies with Redis
   - Use database migrations with proper rollback procedures

4. **Security Implementation**
   - Implement rate limiting at API Gateway level
   - Use AWS WAF for additional protection
   - Implement proper CORS policies
   - Sanitize all inputs
   - Use parameterized queries
   - Implement audit logging

#### Frontend Development

When developing frontend features:

1. **Component Architecture**
   ```typescript
   // Follow this structure:
   - Presentational components (pure, testable)
   - Container components (data fetching, state management)
   - Custom hooks for business logic
   - Proper TypeScript interfaces for all props
   - Accessibility attributes from the start
   ```

2. **State Management Strategy**
   - Local state for component-specific data
   - Zustand for global app state (user, preferences)
   - React Query for server state (with proper caching strategies)
   - Consider Redux Toolkit for complex state (post-MVP)

3. **Performance Optimization**
   - Implement code splitting by route
   - Use React.lazy() for heavy components
   - Optimize images with next/image or React Native FastImage
   - Implement virtual scrolling for long lists
   - Monitor and optimize bundle size
   - Use Web Workers for heavy computations

4. **Mobile-Specific Considerations**
   - Implement offline-first architecture
   - Use platform-specific components when needed
   - Optimize for different screen sizes and orientations
   - Handle app states (background, foreground)
   - Implement proper deep linking

#### Infrastructure & DevOps

1. **Terraform Best Practices**
   ```hcl
   # Always include:
   - Proper module structure
   - Environment-specific variables
   - State management with S3 backend
   - Resource tagging strategy
   - Cost allocation tags
   ```

2. **Monitoring & Observability**
   - Implement distributed tracing from day one
   - Set up proper alerting thresholds
   - Create custom CloudWatch dashboards
   - Implement real user monitoring (RUM)
   - Set up error tracking with Sentry

3. **CI/CD Pipeline**
   - Automated testing gates
   - Security scanning (SAST/DAST)
   - Performance regression testing
   - Automated rollback procedures
   - Blue-green deployments

### MVP Improvement Suggestions

#### Immediate Enhancements

1. **Search Experience**
   - Implement Elasticsearch for better text search
   - Add fuzzy matching for names
   - Implement search suggestions/autocomplete
   - Add recent searches functionality

2. **Data Quality**
   - Implement automated data validation pipeline
   - Add data freshness indicators
   - Create user-reported update mechanism
   - Implement data versioning

3. **User Experience**
   - Add progressive disclosure for complex information
   - Implement smart defaults based on user behavior
   - Add comparison feature (compare 2-3 kindergartens side-by-side)
   - Implement saved searches with notifications

#### Architecture Improvements

1. **Microservices Consideration**
   - Separate search service
   - Independent review/rating service
   - Notification service (post-MVP)
   - Consider event-driven architecture with SNS/SQS

2. **Performance Enhancements**
   - Implement edge caching with CloudFront
   - Use Lambda@Edge for personalization
   - Implement database query optimization
   - Add Redis caching layer

3. **Scalability Preparations**
   - Design for multi-region deployment
   - Implement proper data partitioning strategy
   - Plan for CDN asset delivery
   - Design for 100x current load

### Technology Evolution Mindset

#### Core Principle: Technology Agility
**We are NOT bound to our current technology stack.** Every technical decision should be evaluated based on:
- Current and projected needs
- Cost efficiency at scale
- Developer productivity
- User experience impact
- Maintenance burden

#### Technology Evaluation Framework

When considering technology changes, always evaluate:

1. **Cost Analysis**
   ```
   - Current monthly/annual cost
   - Projected cost at 10x, 100x scale
   - Hidden costs (maintenance, training, migration)
   - Cost per transaction/user
   ```

2. **Performance Comparison**
   - Benchmark against current solution
   - Real-world performance metrics
   - Resource efficiency
   - User-perceived improvements

3. **Migration Path**
   - Effort required for migration
   - Can we run both in parallel?
   - Rollback strategy
   - Data migration complexity

#### Proactive Technology Suggestions

Always be scanning for better alternatives:

1. **Database Evolution**
   - Current: AWS RDS PostgreSQL
   - Consider: 
     - Supabase (PostgreSQL with built-in auth, realtime, and edge functions)
     - PlanetScale (MySQL with better scaling)
     - MongoDB Atlas (if document model fits better)
     - DynamoDB (for specific use cases)
     - Neon (serverless PostgreSQL)

2. **Backend Infrastructure**
   - Current: AWS Lambda + API Gateway
   - Consider:
     - Vercel Edge Functions (better cold starts)
     - Cloudflare Workers (global edge computing)
     - Fly.io (better WebSocket support)
     - Railway/Render (simpler deployment)
     - Bun.js runtime (faster than Node.js)

3. **Frontend Technologies**
   - Current: React/Next.js + React Native
   - Consider:
     - Remix (better data loading patterns)
     - SvelteKit (smaller bundle sizes)
     - Flutter (single codebase for mobile)
     - Expo (better React Native DX)
     - Tauri (desktop apps from web code)

4. **Search Infrastructure**
   - Current: Basic PostgreSQL queries
   - Consider:
     - Typesense (easier than Elasticsearch)
     - Meilisearch (great UX, easy setup)
     - Algolia (managed search)
     - Pinecone (vector search for AI features)

5. **Authentication**
   - Current: AWS Cognito
   - Consider:
     - Clerk (better UX, easier integration)
     - Auth0 (more features)
     - Supabase Auth (if using Supabase)
     - Lucia Auth (full control)

#### When to Recommend Technology Changes

Actively suggest technology changes when:

1. **Cost Triggers**
   - Current solution cost exceeds $X/month
   - Cost per user is not sustainable
   - Free tier limits are consistently hit

2. **Performance Triggers**
   - Response times exceed targets
   - Cold starts impact user experience
   - Scaling requires significant rearchitecture

3. **Developer Experience Triggers**
   - Team velocity is impacted
   - Common tasks require boilerplate
   - Testing is difficult
   - Debugging is complex

4. **Feature Enablement**
   - Current tech blocks needed features
   - Workarounds become common
   - Third-party integrations are difficult

#### Technology Migration Principles

1. **Incremental Migration**
   - Never "big bang" migrations
   - Run old and new in parallel
   - Migrate by feature, not all at once
   - Maintain backwards compatibility

2. **Proof of Concept First**
   - Build small POC before committing
   - Measure actual benefits
   - Test with real data/load
   - Get team buy-in

3. **Cost-Benefit Documentation**
   ```markdown
   ## Technology Change Proposal: [Old] → [New]
   
   ### Benefits
   - Performance: X% improvement
   - Cost: $Y monthly savings
   - Developer Experience: [specific improvements]
   
   ### Migration Effort
   - Developer days: X
   - Risk level: Low/Medium/High
   - Rollback complexity: Simple/Moderate/Complex
   
   ### Recommendation
   [Proceed/Wait/Reject] with reasoning
   ```

#### Continuous Technology Review

Every sprint/month, evaluate:
- Are we paying for unused features?
- Have better alternatives emerged?
- Are we hitting scaling limits?
- Is technical debt from tool choice growing?

#### Example Technology Evolution Path

```
Phase 1 (Current MVP):
- AWS Lambda + RDS + React
- Focus: Time to market

Phase 2 (1K users):
- Add Redis caching
- Consider Vercel for frontend
- Evaluate search solutions

Phase 3 (10K users):
- Migrate to edge functions
- Implement proper search (Typesense/Meilisearch)
- Consider auth migration

Phase 4 (100K users):
- Full microservices architecture
- Consider database sharding or migration
- Evaluate multi-region deployment
```

Remember: **The best technology choice today might not be the best choice in 6 months.** Stay flexible, measure everything, and optimize for the current and next phase of growth, not an imaginary end state.

### Decision Framework

When making technical decisions, consider:

1. **Immediate vs. Long-term**
   - Will this decision limit future scaling?
   - Can we migrate away from this easily?
   - What's the technical debt cost?

2. **Build vs. Buy**
   - Total cost of ownership
   - Time to market impact
   - Maintenance burden
   - Vendor lock-in risks

3. **Performance Impact**
   - User-perceived performance
   - System resource utilization
   - Cost implications at scale
   - Mobile data usage

### Code Review Checklist

Always review code for:

- [ ] Security vulnerabilities
- [ ] Performance bottlenecks
- [ ] Accessibility compliance
- [ ] Mobile compatibility
- [ ] Error handling completeness
- [ ] Test coverage (aim for >80%)
- [ ] Documentation quality
- [ ] Scalability concerns
- [ ] Cost optimization opportunities

### Communication Protocol

When responding to requests:

1. **Start with understanding**
   - Clarify requirements if ambiguous
   - Identify the underlying problem
   - Consider the business impact

2. **Provide structured solutions**
   ```
   ## Problem Analysis
   [Clear problem statement]
   
   ## Proposed Solution
   [Primary recommendation with reasoning]
   
   ## Alternative Approaches
   [2-3 alternatives with trade-offs]
   
   ## Implementation Steps
   [Numbered, actionable steps]
   
   ## Risks & Mitigations
   [Potential issues and how to handle them]
   ```

3. **Include code examples**
   - Production-ready, not pseudocode
   - Include error handling
   - Add helpful comments
   - Provide unit test examples

### Continuous Improvement Mindset

- Regularly suggest optimizations
- Identify technical debt for future sprints
- Propose A/B testing opportunities
- Recommend new technologies when beneficial
- Challenge existing patterns when better alternatives exist

### Special Considerations

#### GDPR & Privacy
- Always implement privacy by design
- Suggest data minimization strategies
- Implement proper consent mechanisms
- Design for data portability

#### Accessibility
- WCAG 2.1 AA compliance minimum
- Mobile accessibility testing
- Screen reader optimization
- Keyboard navigation support

#### Internationalization
- Design for multiple languages from the start
- Consider RTL language support
- Implement proper date/time/currency formatting
- Plan for content translation workflow

### Red Flags to Always Address

- Hardcoded values that should be configurable
- Missing error handling
- Synchronous operations that should be async
- N+1 query problems
- Missing indexes on frequently queried fields
- Unvalidated user input
- Missing rate limiting
- Lack of monitoring/logging
- Single points of failure
- Missing backup strategies

Remember: You're not just writing code; you're building a product that real parents will depend on to make important decisions about their children's education. Every decision should reflect that responsibility.

## Documenting Gemini Usage for Indemnification

### Why Document
Indemnification: To leverage the indemnification provisions agreed upon with Google. If the code generated by Gemini infringes on third-party rights, Google will indemnify Diogo Borges against legal action, such as copyright infringement claims. To substantiate these claims, we must prove that the infringing code was generated by Gemini.

### Scope of This Guideline
This guideline applies exclusively to **product code** (code shipped as part of a product or service). It does not cover test code, internal scripts, or documentation.

### Monitoring and Adaptation
In collaboration with the Legal team and other stakeholders, we continually monitor and assess this guideline. It will be adapted as necessary, based on court decisions, evolving industry practices, etc. We are also exploring technical solutions to capture relevant information automatically, to the extent possible.

### Marking Gemini-Generated Code in Source Files

This applies to code generated or significantly suggested by Gemini, whether through autocomplete or pasted from chat interactions.

**Start of Generated Code:** Comment at the beginning of the code generated by Gemini with "Gemini generated - start" (e.g., for Python: `# Gemini generated - start`).

**End of Generated Code:** Comment at the end of the code generated by Gemini with "Gemini generated - end" (e.g., for Python: `# Gemini generated - end`).

### Option 2: Log File with Commit (Alternative)
(only applicable if you sign / have signed Terms of Use from June 2024)

*   **Directory Creation**: Create a directory in the root of your repository, named something like `_ai-log`, `gemini-history`, or `_chat-record`.
*   **Naming Scheme**: Choose a naming scheme that avoids merge conflicts.
*   **Log File Updates**: Create new log files as needed. When pasting code from Gemini Chat into your product source code, immediately paste it into the log file.
*   **Commit Log Files**: Commit the log files whenever you commit source changes, allowing for cross-referencing of where the generated code is used.