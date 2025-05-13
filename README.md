# DevTools

A comprehensive fullstack development toolkit application built with Next.js frontend and Express.js backend.

## Features

- **Authentication System**: Secure login and user management
- **Dashboard**: Centralized overview of your development tools and activities
- **Code Snippets**: Store, organize, and retrieve code snippets
- **Bookmarks & Favorites**: Save and organize important resources
- **Tools Collection**: Access various development utilities in one place
- **Settings**: Customize your experience and preferences

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Components**: 
  - Radix UI primitives
  - Tailwind CSS for styling
  - Framer Motion for animations
- **State Management**: Jotai
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: JWT with HTTP-only cookies
- **Development Mode**: Turbo mode enabled

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT, bcrypt for password hashing
- **API**: RESTful endpoints

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/aghyy/devtools.git
cd devtools
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Setup environment variables
   - Create `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/devtools
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

### Running the Application

1. Start the backend server
```bash
cd backend
npm start
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Access the application at [http://localhost:3000](http://localhost:3000)

## Development

### Frontend

The frontend is built with Next.js and follows a modern project structure:
- `app/`: Contains all page routes and layouts (Next.js App Router)
- `components/`: Reusable UI components
- `contexts/`: React Context providers
- `hooks/`: Custom React hooks
- `lib/`: Utility libraries
- `services/`: API service functions
- `types/`: TypeScript type definitions
- `utils/`: Utility functions

### Backend

The backend follows a modular architecture:
- `controllers/`: Request handlers
- `models/`: Database models
- `routes/`: API route definitions
- `middlewares/`: Express middleware functions
- `utils/`: Utility functions

## Deployment

The application can be deployed using various platforms:

### Frontend
- Vercel (recommended for Next.js applications)
- Netlify
- AWS Amplify

### Backend
- Render
- Railway
- Heroku
- AWS Elastic Beanstalk

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Express.js](https://expressjs.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Sequelize](https://sequelize.org/)
