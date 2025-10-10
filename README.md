# Voice Authentication Frontend

A Vite + React frontend for the Group 2 Voice Technology project. It provides voice and password-based authentication along with a chatbot experience powered by voice interactions.

## 🛠 Tech Stack

- [Vite](https://vitejs.dev/) for fast dev tooling and build pipeline
- [React 18](https://react.dev/) with TypeScript for UI development
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Axios](https://axios-http.com/) for API communication
- [React Router](https://reactrouter.com/) for client-side routing

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+ and npm installed

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root if it does not exist:

```bash
echo "VITE_API_URL=http://localhost:8000" > .env
```

This URL should point to the backend service. Update it when running against a different environment.

### 4. Run the development server

```bash
npm run dev
```

The app is available at `http://localhost:5173` by default. Hot reloading is enabled for rapid development.

### 5. Build for production

```bash
npm run build
```

The production-ready output is generated in the `dist/` directory.

## 📂 Project Structure

```
FrontEnd/
├─ public/            # Static assets
├─ src/
│  ├─ api/            # API clients
│  ├─ components/     # Reusable UI components
│  ├─ features/       # Page-level features
│  ├─ hooks/          # Custom hooks
│  ├─ layouts/        # Layout components
│  ├─ routes/         # Route definitions
│  └─ styles/         # Global styles
├─ package.json       # Scripts and dependencies
├─ tsconfig.json      # TypeScript configuration
└─ vite.config.ts     # Vite configuration
```
