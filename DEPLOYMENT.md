# Deployment Guide

This guide provides instructions for deploying the TaskFlow system with the frontend on Vercel and the backend on AWS, using MongoDB Atlas for the database.

## Prerequisites

- An [AWS Account](https://aws.amazon.com/)
- A [Vercel Account](https://vercel.com/)
- A [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)

---

## 1. MongoDB Atlas Setup

Before deploying the backend, ensure your database is ready.

1.  **Create a Cluster:** If you haven't already, create a free-tier cluster.
2.  **Network Access:**
    - Go to **Network Access** in the Atlas sidebar.
    - Click **Add IP Address**.
    - For initial setup/deployment to AWS, select **Allow Access from Anywhere** (`0.0.0.0/0`) or add the specific CIDR of your AWS VPC if you know it. *Note: 0.0.0.0/0 is required for App Runner unless you set up a VPC Connector.*
3.  **Database Access:**
    - Create a database user (e.g., `poori420`) with **Read and Write to any database** permissions.
4.  **Get Connection String:**
    - Click **Connect** > **Connect your application**.
    - Copy the connection string. It should look like: `mongodb+srv://poori420:<password>@cluster0.53oeybd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    - **Crucial:** Add `Team_Tasks` before the `?` to specify the database: `...mongodb.net/Team_Tasks?retryWrites...`

---

## 2. Backend Deployment (AWS App Runner)

AWS App Runner is the easiest way to deploy a containerized Node.js application.

### Steps:

1.  **Push to GitHub:** Ensure your code is pushed to a GitHub repository.
2.  **AWS App Runner Console:** Go to the App Runner service in the AWS Management Console.
3.  **Create Service:**
    - **Source:** Source code repository.
    - **Connect to GitHub:** Select your repository and the branch.
    - **Deployment settings:** Automatic.
4.  **Configure Build:**
    - **Runtime:** Select **Node.js 18**.
    - **Build command:** `cd backend && npm install`.
    - **Start command:** `cd backend && node server.js`.
    - **Port:** `5000`.
5.  **Environment Variables:** Add the following in the App Runner configuration:
    - `MONGO_URI`: `mongodb+srv://poori420:<PASSWORD>@cluster0.53oeybd.mongodb.net/Team_Tasks?retryWrites=true&w=majority&appName=Cluster0`
    - `JWT_SECRET`: A long random string.
    - `PORT`: `5000`
    - `NODE_ENV`: `production`
    - `CLIENT_URL`: The URL of your Vercel deployment (you'll get this after the next step).
6.  **Networking:** Ensure the port is set to `5000`.

---

## 3. Frontend Deployment (Vercel)

Vercel is optimized for React/Vite applications.

### Steps:

1.  **Vercel Dashboard:** Click **"Add New"** > **"Project"**.
2.  **Import Repository:** Select your GitHub repository.
3.  **Configure Project:**
    - **Framework Preset:** Vite.
    - **Root Directory:** `frontend`.
    - **Build Command:** `npm run build`.
    - **Output Directory:** `dist`.
    - **Important:** Ensure the "Build Command" is exactly `npm run build` and NOT `npm run built`.
4.  **Environment Variables:** Add the following:
    - `VITE_API_URL`: The URL of your AWS App Runner service (e.g., `https://xxxxxx.us-east-1.awsapprunner.com/api`).
5.  **Deploy:** Click **"Deploy"**.

---

## 4. Seeding the Production Database

To populate your production database with demo accounts and sample tasks:

1.  **Locally:** Open your terminal in the `backend/` folder.
2.  **Run Seed:** Use the production connection string:
    ```bash
    MONGO_URI="your_atlas_connection_string_with_password" npm run seed
    ```
    *Example:*
    ```bash
    MONGO_URI="mongodb+srv://poori420:your_password@cluster0.53oeybd.mongodb.net/Team_Tasks?retryWrites=true&w=majority" npm run seed
    ```

## 5. Post-Deployment

1.  **Update CORS:** Once you have your Vercel URL (e.g., `https://taskflow-frontend.vercel.app`), go back to your AWS App Runner service configuration and update the `CLIENT_URL` environment variable to match this URL.
2.  **Verify:** Open your Vercel URL and check if the dashboard loads data from the backend.
