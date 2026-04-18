# Rick and Morty — Backend

GraphQL API that stores Rick and Morty characters in PostgreSQL and exposes them through queries and mutations. Characters are fetched from the public [Rick and Morty API](https://rickandmortyapi.com/) via a seeder and kept up to date with a cron job. Redis is used as an optional cache layer.

## What is implemented

- Characters query with pagination, filtering (name, status, species, gender, origin), and sorting
- Single character query by ID
- Favorites — toggle and list
- Comments — add to any character
- Soft delete (Sequelize paranoid mode)
- Redis caching with automatic invalidation
- Cron job — syncs characters from external API every 12 hours
- Health check at `GET /health`

## Tech Stack

Node.js, TypeScript, Express, Apollo Server Express, GraphQL, Sequelize, PostgreSQL, Redis

## Prerequisites

- Node.js ≥ 18
- Docker and Docker Compose

## Getting Started

```bash
cd server
docker compose up -d
npm install
cp .env.example .env
npm run build
npm run migrate
npm run seed
npm start
```

The GraphQL playground will be available at **http://localhost:4001/graphql**.

### Environment variables

The `.env.example` includes safe defaults that match `docker-compose.yml`. After copying, no changes should be needed for local development:

```env
PORT=4001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=rickmorty_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

RICK_AND_MORTY_API_URL=https://rickandmortyapi.com/api
```

## Available Scripts

| Script                     | Description                                     |
| -------------------------- | ----------------------------------------------- |
| `npm run build`            | Compile TypeScript to `dist/`                   |
| `npm start`                | Run compiled build from `dist/index.js`         |
| `npm test`                 | Run tests with Jest                             |
| `npm run test:watch`       | Run tests in watch mode                         |
| `npm run lint`             | Lint `src/**/*.ts` with ESLint                  |
| `npm run lint:fix`         | Lint and auto-fix                               |
| `npm run migrate`          | Run Sequelize migrations                        |
| `npm run migrate:undo`     | Undo last migration                             |
| `npm run migrate:undo:all` | Undo all migrations                             |
| `npm run seed`             | Run all seeders                                 |
| `npm run seed:undo`        | Undo all seeders                                |
| `npm run db:reset`         | Undo all → migrate → seed                       |

> **Note:** `npm run build` must run before `npm run migrate` or `npm run seed`. Sequelize CLI reads compiled files from `dist/`.

## GraphQL API

### Queries

**characters** — paginated, filterable, sortable:

```graphql
query {
  characters(
    filter: { name: "Rick", status: Alive, species: "Human", gender: Male, origin: "Earth" }
    page: 1
    limit: 20
    sortBy: "name"
    sortOrder: ASC
  ) {
    data {
      id
      name
      status
      species
      gender
      origin
      image
      isFavorite
      comments { id content createdAt updatedAt }
    }
    total
    page
    totalPages
    hasNextPage
  }
}
```

**character** — single character by ID:

```graphql
query {
  character(id: 1) {
    id name status species gender origin image isFavorite
    comments { id characterId content createdAt updatedAt }
  }
}
```

**favorites** — all favorited characters:

```graphql
query {
  favorites {
    id name status species gender origin image isFavorite
    comments { id characterId content createdAt updatedAt }
  }
}
```

### Mutations

**toggleFavorite:**

```graphql
mutation {
  toggleFavorite(characterId: 1) { id name isFavorite }
}
```

**addComment:**

```graphql
mutation {
  addComment(input: { characterId: 1, content: "Great character!" }) {
    id characterId content createdAt updatedAt
  }
}
```

**softDeleteCharacter:**

```graphql
mutation {
  softDeleteCharacter(id: 1) { id name }
}
```

## Project Structure

```
src/
├── config/          # Database, Redis, and CLI config
├── cron/            # Scheduled character sync
├── database/
│   ├── migrations/  # Table creation scripts
│   └── seeders/     # Initial data (15 characters from external API)
├── decorators/      # @LogExecutionTime decorator
├── middleware/      # Request logger and error handler
├── models/          # Character, Comment, Favorite (Sequelize)
├── resolvers/       # GraphQL query and mutation resolvers
├── schema/          # GraphQL type definitions
├── services/        # Business logic and external API client
├── types/           # Shared TypeScript interfaces and enums
└── index.ts         # Entry point (Express + Apollo Server)
```

## Notes

- Redis is optional. If unavailable, the server logs a warning and continues without caching.
- Soft delete uses Sequelize's `paranoid: true`. Deleted characters remain in the database but are excluded from queries.
- The seeder fetches 15 characters from the external Rick and Morty API. Internet access is required during seeding.