# QualGent - AI-Powered Mobile App Testing Platform

QualGent is a modern SaaS platform that revolutionizes mobile app testing through AI-driven autonomous agents. The platform enables teams to write tests in natural language and execute them on real physical devices, eliminating the need for brittle script-based testing.

## Live Demo

**Deployed Application:** [https://qualgent.vercel.app](https://qualgent-redesigned.vercel.app/)

**Demo Video:** [Watch Product Demo](https://www.loom.com/share/af115107adba4d43a0e062708eff51b7?sid=aa17f7e7-7e21-4960-a379-0a4dc648c4a2)

## Features

### Core Testing Capabilities
- **Natural Language Test Creation**: Write tests in plain English without coding knowledge
- **AI-Driven Test Generation**: Automatically generate comprehensive test cases from feature descriptions
- **Real Device Testing**: Execute tests on actual iOS and Android physical devices
- **Vision-Based AI Agents**: Autonomous agents that interact with apps like real users
- **Self-Healing Scripts**: Automatic adaptation to UI changes without manual maintenance

### Test Management
- **Project Organization**: Create and manage multiple testing projects
- **Test Suite Management**: Organize tests into logical suites and categories
- **Test Run Queue**: Monitor and manage test execution with real-time status updates
- **Comprehensive Reporting**: Detailed results with screenshots, videos, and performance metrics
- **Collaboration Tools**: Share tests, add comments, and version control

### Advanced Features
- **Parallel Execution**: Run multiple tests simultaneously on cloud devices
- **Multi-Language Support**: Test apps in various languages including right-to-left scripts
- **System Integration**: Test push notifications, camera, GPS, Bluetooth, and other device features
- **End-to-End Flows**: Complete user journeys including OTP, payments, and backend integration
- **CI/CD Integration**: Seamless integration with Jenkins, GitHub Actions, GitLab CI, and CircleCI

### AI Assistant
- **Intelligent Chat Interface**: AI-powered assistant for test case generation and guidance
- **Context-Aware Responses**: Understands project context and provides relevant suggestions
- **Automated Test Creation**: Generate test cases from natural language descriptions
- **Smart Categorization**: Automatically categorize tests by type and priority

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library

### Backend & Database
- **Next.js API Routes**: Server-side API endpoints
- **Supabase**: PostgreSQL database with real-time features
- **Row Level Security**: Database-level access control
- **Authentication**: Supabase Auth with JWT tokens

### AI Integration
- **Google Gemini 1.5 Flash**: Primary AI model for test generation and assistance
- **Custom Prompt Engineering**: Optimized prompts for testing domain expertise
- **Context-Aware Responses**: Product-specific knowledge base integration

### Infrastructure
- **Vercel**: Hosting and deployment platform
- **Supabase Cloud**: Managed PostgreSQL database
- **Environment Variables**: Secure configuration management

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Dashboard
- `GET /api/dashboard/projects` - Fetch user projects
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/test-cases` - Retrieve test cases
- `POST /api/dashboard/test-cases` - Create new test case
- `GET /api/dashboard/queue` - Get test run queue
- `GET /api/dashboard/runs` - Fetch test runs
- `GET /api/dashboard/comments` - Get test comments

### AI Services
- `POST /api/assistant` - AI chat assistant
- `POST /api/dashboard/ai-test-cases` - Generate AI test cases

### Test Management
- `GET /api/dashboard/test-cases/{id}` - Get specific test case
- `PUT /api/dashboard/test-cases/{id}` - Update test case
- `DELETE /api/dashboard/test-cases/{id}` - Delete test case
- `POST /api/dashboard/runs` - Create test run
- `GET /api/dashboard/runs/{id}` - Get test run details

## AI Model Information

### Primary Model: Google Gemini 1.5 Flash
- **Model Type**: Large Language Model
- **Use Cases**: Test case generation, natural language processing, context-aware responses
- **Integration**: REST API with custom prompt engineering
- **Features**: Multi-modal capabilities, context window optimization

### AI Capabilities
- **Test Case Generation**: Convert natural language descriptions to structured test cases
- **Smart Categorization**: Automatically classify tests by type and priority
- **Context Understanding**: Maintain conversation context across sessions
- **Product Knowledge**: Deep understanding of testing methodologies and best practices

### Prompt Engineering
- **Domain-Specific Prompts**: Optimized for software testing scenarios
- **Structured Output**: Consistent test case format with required fields
- **Error Handling**: Graceful fallbacks for edge cases
- **Multi-language Support**: Handles various natural language inputs

## Database Schema

### Core Tables
- **projects**: User projects and metadata
- **test_suites**: Test organization and grouping
- **test_cases**: Individual test definitions
- **test_runs**: Test execution instances
- **test_steps**: Detailed test execution steps
- **profiles**: User profile information

### Security Features
- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **User Isolation**: Complete data separation between users
- **Audit Logging**: Track all data modifications

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm or npm
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/qualgent-redesign.git
   cd qualgent-redesign
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Database Setup**
   ```bash
   # Run the database migration scripts
   psql -h your_db_host -U your_db_user -d your_db_name -f scripts/001-initial-schema.sql
   psql -h your_db_host -U your_db_user -d your_db_name -f scripts/002-seed-data.sql
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GEMINI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Architecture

### Frontend Architecture
- **App Router**: Next.js 14 App Router for routing
- **Component Library**: Reusable UI components with Radix UI
- **State Management**: React hooks and context for state
- **Authentication**: Supabase Auth integration
- **Real-time Updates**: Supabase real-time subscriptions

### Backend Architecture
- **API Routes**: Next.js API routes for backend logic
- **Database Layer**: Supabase client for data operations
- **AI Integration**: Gemini API for intelligent features
- **Authentication Middleware**: JWT token validation
- **Error Handling**: Comprehensive error logging and responses


## Performance Optimization

- **Static Generation**: Optimized page loading with Next.js
- **Image Optimization**: Automatic image compression and optimization
- **Code Splitting**: Dynamic imports for better performance
- **Caching**: Strategic caching for API responses
- **Database Indexing**: Optimized queries with proper indexing



## License

This project is proprietary software. All rights reserved. 
