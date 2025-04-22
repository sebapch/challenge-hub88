# Next.js Challenge

This project is a web application built with Next.js (App Router) that allows users to explore a list of countries fetched from the public Trevor Blades Countries GraphQL API. It features real-time filtering by country code and includes a test suite using Jest and React Testing Library.

## Core Features

*   Fetches and displays country names and codes.
*   Real-time filtering by country code (case-insensitive).
*   Handles loading and error states during data fetching.
*   Responsive design using Tailwind CSS.

## Main Technologies Used

*   Next.js (v15+ App Router)
*   React (v19+)
*   TypeScript
*   Tailwind CSS (v4+)
*   Apollo Client (for GraphQL)
*   Jest & React Testing Library (for testing)
*   SWC (Compiler for Next.js and Jest)

## Getting Started

### Prerequisites

*   Node.js (v18.17 or later recommended)
*   npm or yarn package manager

### 1. Installation

* First, clone the repository to your local machine and navigate into the project directory.
*(Assuming you have already cloned or created the project)*

* Then, install the project dependencies:


# Using npm
npm install

# Or using yarn
yarn install
*
### 2. Running the Development Server

* To start the application locally in development mode:

# Using npm
npm run dev

# Or using yarn
yarn dev

* This command will start the Next.js development server (typically on http://localhost:3000). Open this URL in your web browser to view the application. The server will automatically reload if you make changes to the code.

### 3. Running Tests

* The project includes automated tests to verify component behavior. To run the test suite:

# Using npm
npm test

# Or using yarn
yarn test

### Project Structure Highlights

- /app: Contains the core application code using Next.js App Router conventions (layout.tsx, page.tsx, components/, etc.).
- /lib: Utility modules, including the Apollo Client setup (apolloClient.ts).
- /app/page.test.tsx: Tests for the main page component.
- jest.config.js & jest.setup.js: Configuration files for the Jest testing framework, set up to use SWC for code transformation.