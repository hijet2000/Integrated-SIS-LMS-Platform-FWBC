# Integrated SIS + LMS Platform

A comprehensive, integrated School Information System (SIS) and Learning Management System (LMS) for modern educational institutions. Manage students, academics, fees, and attendance, alongside courses, assignments, and educational resources.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **API:** Mock API (designed for future integration with a Laravel backend)
- **AI Features:** Google Gemini API

---

## Getting Started

There are two primary ways to run this application: using Vite for development or a simple static server for a quick preview.

### Option A: Vite (Recommended for Development)

This method provides a full-featured development environment with Hot Module Replacement (HMR) for a fast and efficient workflow.

**Prerequisites:**
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- `npm`, `pnpm`, or `yarn`

**Steps:**

1.  **Install Dependencies:**
    Open a terminal in the project root and run:
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

3.  **Open the App:**
    Vite will print a local URL in your terminal (usually `http://localhost:5173`). Open this URL in your browser.

### Option B: Static Server (Zero Install)

This method is great for a quick, zero-install preview. It relies on the browser's native ES Module support and the import map defined in `index.html`.

**Steps:**

1.  **Start any static server from the project root.** Here are a couple of examples:

    **Using Python:**
    ```bash
    python -m http.server 5173
    ```

    **Using Node.js `http-server`:**
    ```bash
    npx http-server . -p 5173
    ```

2.  **Open the App:**
    Visit the appropriate URL in your browser. If you started the server in the project root, the URL will likely be `http://localhost:5173/index.html`. *Note: The exact path may vary depending on your server's root directory.*

---

## Available Scripts

-   `npm run dev`: Starts the Vite development server.
-   `npm run build`: Compiles and bundles the application for production.
-   `npm run preview`: Serves the production build locally for previewing.
-   `npm run lint`: Runs ESLint to check for code quality issues across all `.ts` and `.tsx` files.
-   `npm run typecheck`: Runs the TypeScript compiler to check for type errors without emitting files.

---

## Backend Integration Note

This project currently uses a mock API located in the `services/` directory to simulate backend interactions.

When connecting to a live backend (e.g., the planned Laravel multi-tenant system), you will need to:
1.  Replace the mock API calls in `services/*.ts` with `fetch` or `axios` calls to your live endpoints.
2.  Implement a centralized way to handle authentication headers/tokens for all API requests.

---

## API Key Configuration

The application uses the Google Gemini API for AI-powered features. The API key is sourced **exclusively** from the environment variable `process.env.API_KEY`. This is handled externally by the hosting environment and **must not** be configured or managed within the application's UI or frontend code.