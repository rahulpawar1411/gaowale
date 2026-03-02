# Gao0.2 – Full-Stack App

React (client) + Express (server) + MySQL (database **gao0.2**), following an **MVC** structure.

## Project structure

```
Gao0.2/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI
│   │   ├── views/         # Page components
│   │   ├── services/      # API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                 # Express backend (MVC)
│   ├── config/            # Database config
│   ├── controllers/       # Request handlers
│   ├── models/            # Data access (MySQL)
│   ├── routes/            # API routes
│   ├── middleware/        # Error handler, etc.
│   ├── app.js
│   ├── server.js
│   └── package.json
└── package.json           # Root scripts
```

## Prerequisites

- **Node.js** (v18+)
- **MySQL** (local or remote) with a database named `gao0.2`

Create the database:

```sql
CREATE DATABASE IF NOT EXISTS `gao0.2`;
```

## Setup

1. **Install dependencies**

   From project root:

   ```bash
   npm run install:all
   ```

   Or manually:

   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. **Configure the server**

   In `server/`, copy the example env and set your MySQL credentials:

   ```bash
   cd server
   copy .env.example .env
   ```

   Edit `server/.env`:

   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=gao0.2
   ```

   The `items` table is created automatically on first server start.

## Run

- **Backend** (Express on http://localhost:5000):

  ```bash
  npm run server
  ```

- **Frontend** (Vite on http://localhost:3000):

  ```bash
  npm run client
  ```

  Open http://localhost:3000. The client is proxied to the API at `/api`.

- **Production:** build the client (`npm run build`), then run the server with `npm start` and serve the `client/dist` folder with your preferred static server or from Express.

## API (MVC)

- **Models** (`server/models/`): MySQL queries (e.g. `Item.model.js`).
- **Controllers** (`server/controllers/`): Logic and response (e.g. `itemController.js`).
- **Routes** (`server/routes/`): Map URLs to controllers (e.g. `itemRoutes.js`).

Example resource: **Items**

| Method | Path        | Description   |
|--------|-------------|---------------|
| GET    | /api/items  | List all      |
| GET    | /api/items/:id | Get one    |
| POST   | /api/items  | Create        |
| PUT    | /api/items/:id | Update     |
| DELETE | /api/items/:id | Delete     |

Health check: `GET /api/health`.

## Tech stack

- **Client:** React 18, React Router, Vite
- **Server:** Express, mysql2, cors, dotenv
- **DB:** MySQL (database: `gao0.2`)
