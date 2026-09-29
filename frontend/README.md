# Devfolio OS Frontend

This is the frontend application for Devfolio OS, built with Next.js.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: Tailwind CSS

## Setup & Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env.local` file in the root directory (or copy from an example if provided) and set up the required variables:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## State Management

We use **Zustand** for state management. Our stores are located in the `src/store` (or `store`) directory, separating concerns for authentication, user profile, and other global states.
