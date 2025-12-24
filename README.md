# What Do You Learn Today? (WDYLT)

A personal learning tracker focused on consistency, reflection, and growth.

![Clean UI](https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=2072&ixlib=rb-4.0.3)

## Features

- **Daily Learning Entry**: Record what you learned with Markdown support.
- **Progress Tracking**: Visualize your learning consistency with weekly charts.
- **Streaks & Stats**: Keep track of your learning streak and total topics covered.
- **Reflection**: Simple history timeline to review your journey.
- **Clean & Minimal**: Distraction-free interface with Dark Mode support.
- **Local Privacy**: Data is stored in your browser's LocalStorage.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4, Lucide Icons
- **State**: Zustand + Persistence (LocalStorage)
- **Charts**: Recharts
- **Components**: Custom minimal UI (Radix UI compatible)

## Getting Started

1.  **Install dependencies**:

    ```bash
    npm install
    ```

2.  **Run the development server**:

    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `src/app`: Pages and layouts
- `src/components/features`: Core business logic components (Entry, History, Chart)
- `src/components/ui`: Reusable UI components
- `src/lib`: Utilities and State Management (Store)
