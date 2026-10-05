# CampusConnect🎓

This is the frontend application for the **CampusConnect Placement Management & Recruitment Portal**. It provides dedicated, role-based dashboards for Students, Recruiters, and Administrators to interact with the CampusConnect backend API.

## 🌟 Key Features

*   **Student Portal**: Complete your profile, upload your resume (PDF), browse active job postings, apply for jobs, and track your application and interview statuses.
*   **Recruiter Portal**: Post job openings, review student applications, shortlist candidates, and schedule interviews.
*   **Admin Dashboard**: Approve new recruiter accounts, moderate and approve pending job postings, and view overall placement statistics.
*   **Skill-Match UI**: View color-coded match percentages on job cards, powered by the backend's Resume-Based Skill Matching Engine.

## 🛠️ Tech Stack

*   **Core**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for rapid, responsive UI development.
*   **Routing**: [React Router](https://reactrouter.com/) for client-side navigation.
*   **HTTP Client**: [Axios](https://axios-http.com/) for interacting with the Spring Boot REST API.
*   **Visualizations**: [Recharts](https://recharts.org/) (used in the Admin dashboard for placement statistics).

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   The CampusConnect Backend server must be running locally (usually on port `8080`).

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will typically be available at `http://localhost:5173`.

### Connecting to the Backend
By default, the frontend is configured to communicate with the local Spring Boot backend. If you need to change the API base URL (e.g., for production deployment), you can update the Axios base URL configuration or use environment variables (`.env`).

## 📦 Available Scripts

*   `npm run dev` - Starts the Vite development server with Hot Module Replacement (HMR).
*   `npm run build` - Builds the app for production to the `dist` folder.
*   `npm run lint` - Runs ESLint to check for code quality issues.
*   `npm run preview` - Locally previews the production build.

## 🐳 Docker Support

This frontend can be easily containerized. A `Dockerfile` is provided that builds the React application and serves the static assets using an NGINX web server. When running the full stack, you can simply use the `docker-compose.yml` located in the root of the project.
