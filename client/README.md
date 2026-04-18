# Rick and Morty — Frontend

React app that connects to a GraphQL backend and displays Rick and Morty characters. Users can search, filter, sort, mark favorites, add comments, and delete characters. The layout adapts between desktop (side-by-side panels) and mobile (full-screen views).

## Features

- **Character list** — scrollable sidebar with character cards showing name, species, and favorite status
- **Search** — filter the list by name or species as you type
- **Filters** — filter by favorites (Starred / Others) and by species (Human / Alien). On desktop, filters appear as a dropdown panel. On mobile, they open as a full-screen view.
- **Sorting** — toggle between A–Z and Z–A. Sorting is handled server-side via the GraphQL `sortOrder` variable.
- **Favorites** — click the heart icon on any character to toggle favorite status
- **Comments** — view existing comments and add new ones from the character detail panel
- **Soft delete** — remove a character from the list via a button in the detail view
- **Responsive layout** — on desktop, the character list and detail panel sit side by side. On mobile, each takes the full screen with navigation between them.
- **URL routing** — character detail is accessible at `/character/:id`

## Tech Stack

| Dependency         | Version  |
| ------------------ | -------- |
| React              | ^18.2    |
| TypeScript         | ~6.0     |
| Apollo Client      | ^4.1     |
| GraphQL            | ^16.13   |
| React Router DOM   | ^6.20    |
| Tailwind CSS       | ^4.2     |
| Vite               | ^8.0     |
| Vitest             | ^4.1     |

## Getting Started

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Set the GraphQL endpoint:

```env
VITE_GRAPHQL_URL=http://localhost:4001/graphql
```

### 3. Start the dev server

```bash
npm run dev
```

The app runs at **http://localhost:3000**.

## Available Scripts

| Script               | Description                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start Vite dev server (port 3000)   |
| `npm run build`      | Type-check and build for production |
| `npm run preview`    | Preview the production build        |
| `npm run lint`       | Run ESLint                          |
| `npm run test`       | Run tests once with Vitest          |
| `npm run test:watch` | Run tests in watch mode             |

## Project Structure

```
src/
├── components/
│   ├── CharacterCard.tsx        # Card in the sidebar list
│   ├── CharacterDetail.tsx      # Detail panel (info, comments, favorite)
│   ├── FilterPanel.tsx          # Desktop filter dropdown
│   ├── HeartIcon.tsx            # Favorite toggle icon
│   ├── MobileDetailScreen.tsx   # Full-screen detail (mobile)
│   ├── MobileFilterScreen.tsx   # Full-screen filters (mobile)
│   ├── Sidebar.tsx              # Character list, search, sort, filters
│   └── __tests__/               # Component tests
├── graphql/
│   ├── client.ts                # Apollo Client setup
│   ├── queries.ts               # GetCharacters, GetCharacter, GetFavorites
│   ├── mutations.ts             # ToggleFavorite, AddComment, SoftDelete
│   └── types.ts                 # Response types for queries/mutations
├── hooks/
│   └── useIsMobile.ts           # Responsive breakpoint detection
├── types/
│   └── index.ts                 # Character, Comment, filter types
├── test/
│   └── setup.ts                 # Vitest setup
├── App.tsx                      # Routing and main state management
├── main.tsx                     # Entry point (ApolloProvider, BrowserRouter)
└── index.css                    # Global styles
```

## Notes

- State is managed with Apollo Client cache and local `useState` — no external state library.
- Filtering by favorites and species is client-side. Sorting is server-side.
- The `useIsMobile` hook controls which layout renders (split-panel vs full-screen).
- There is no pages directory. The app uses a single `CharacterPage` component with React Router params.