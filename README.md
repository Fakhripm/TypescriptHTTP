# Chirpy - A Chirp Sharing Application

Chirpy is an Express.js in Typescript application that provides a REST API for users to create, read, and delete chirps (short messages). It includes user authentication with JWT tokens and webhook integration with Polka (Fictional) for payment processing.

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm**

## Setup Instructions

### 1. Install Dependencies

```bash/zsh
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash/zsh
cp .env.example .env
```

Edit `rerame .env.example to .env` with your configuration:

```dotenv
DB_URL="postgres://username:password@localhost:5432/chirpy?sslmode=disable"
PLATFORM="dev"
JWT_SECRET="your-random-jwt-secret-here"
POLKA_KEY="f271c81ff7084ee5b99a5091b42d486e"
```

**Environment Variables:**
- `DB_URL`: PostgreSQL connection string
- `PLATFORM`: Environment mode (dev or production)
- `JWT_SECRET`: Secret key for JWT token signing. Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`
- `POLKA_KEY`: API key from Polka for webhook integration

### 3. Set Up Database

Ensure PostgreSQL is running and create a database:

```bash
createdb chirpy
```

The application will automatically run migrations on startup.

## Running the Application

### Development Mode

Compiles TypeScript and runs the application:

```bash
npm run dev
```

The server will start on `http://localhost:8080`

## Project Structure

```
src/
├── index.ts              # Main server setup and routes
├── config.ts             # Configuration and environment variables
├── db/
│   ├── index.ts          # Database connection
│   ├── schema.ts         # Drizzle ORM schema definitions
│   ├── query.ts          # Database query helpers
│   └── migrations/       # SQL migration files
├── api/
│   ├── chirps.ts         # Chirp endpoints
│   ├── users.ts          # User endpoints
│   ├── auth.ts           # JWT authentication
│   ├── middleware.ts     # Error and logging middleware
│   ├── errors.ts         # Custom error classes
│   └── ...               # Other API handlers
└── app/
    └── index.html        # Static frontend
```


## Available API Endpoints

### Health Check
- `GET /api/healthz` - Health check endpoint

### Chirps
- `GET /api/chirps` - Get all chirps (supports filtering and sorting)
- `GET /api/chirps?authorId=<id>` - Get chirps by author
- `GET /api/chirps?sort=asc|desc` - Sort chirps by creation date
- `GET /api/chirps/:chirpID` - Get a specific chirp
- `POST /api/chirps` - Create a new chirp (requires authentication)
- `DELETE /api/chirps/:chirpID` - Delete a chirp (requires authentication)

### Users
- `POST /api/users` - Create a new user
- `PUT /api/users` - Update user information (requires authentication)

### Authentication
- `POST /api/login` - Login with email and password
- `POST /api/refresh` - Refresh JWT token
- `POST /api/revoke` - Revoke refresh token

### Webhooks
- `POST /api/polka/webhooks` - Polka webhook endpoint for payment processing

### Admin
- `GET /admin/metrics` - Get application metrics
- `POST /admin/reset` - Reset application data

## Development Workflow

1. Make changes to TypeScript files in `src/`
2. Run `npm run dev` 
3. Test your changes using an API client (Postman, curl, etc.)
4. Commit your changes to git

## Database Migrations

Migrations are stored in `src/db/migrations/` and are automatically applied on startup. When making schema changes:

1. Update `src/db/schema.ts`
2. Generate migration files using Drizzle Kit
3. Migrations will run automatically when the application starts

## Static Frontend

Static files are served from `src/app/` at the `/app` route. Add HTML, CSS, and client-side JavaScript files there as needed.

## Troubleshooting

**Connection refused to database:**
- Ensure PostgreSQL is running
- Check `DB_URL` is correct in `.env`

**Port 8080 already in use:**
- Change the PORT in `src/index.ts` or kill the process using port 8080

**TypeScript compilation errors:**
- Run `npm install` to ensure all dependencies are installed
- Check that `tsconfig.json` is properly configured

## Dependency

- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Argon2** - Password hashing
- **Vitest** - Testing framework
