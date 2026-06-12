# Deployment Guide

This guide provides instructions for deploying the TaskFlow system with the frontend on Vercel and the backend on AWS.

## Prerequisites

- An [AWS Account](https://aws.amazon.com/)
- A [Vercel Account](https://vercel.com/)
- Your MongoDB Atlas connection string (updated in the previous step)

---

## 1. Backend Deployment (AWS App Runner)

AWS App Runner is the easiest way to deploy a containerized Node.js application.

### Steps:

1.  **Push to GitHub:** Ensure your code is pushed to a GitHub repository.
2.  **AWS App Runner Console:** Go to the App Runner service in the AWS Management Console.
3.  **Create Service:**
    - **Source:** Source code repository.
    - **Connect to GitHub:** Select your repository and the branch.
    - **Deployment settings:** Automatic.
4.  **Configure Build:**
    - **Runtime:** `Python 3` (Select "Node.js 18" or "Corretto 17" if available, but since we have a Dockerfile, select **"Container image"** as the source instead of source code if you prefer, or let App Runner use the Dockerfile).
    - **Best approach with Dockerfile:**
        - Choose **Source code repository**.
        - Select your repo and branch.
        - Under **Build settings**, choose **Use a configuration file** or **Configure all settings here**.
        - Since we have `backend/Dockerfile`, it's recommended to build the image first and push to **Amazon ECR**, then point App Runner to that ECR image.
5.  **Environment Variables:** Add the following in the App Runner configuration:
    - `MONGO_URI`: `mongodb+srv://poori420:<PASSWORD>@cluster0.53oeybd.mongodb.net/Team_Tasks?retryWrites=true&w=majority&appName=Cluster0`
    - `JWT_SECRET`: A long random string.
    - `PORT`: `5000`
    - `NODE_ENV`: `production`
    - `CLIENT_URL`: The URL of your Vercel deployment (you'll get this after the next step).
6.  **Networking:** Ensure the port is set to `5000`.

---

## 2. Frontend Deployment (Vercel)

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

## 3. Post-Deployment

1.  **Update CORS:** Once you have your Vercel URL (e.g., `https://taskflow-frontend.vercel.app`), go back to your AWS App Runner service configuration and update the `CLIENT_URL` environment variable to match this URL.
2.  **Verify:** Open your Vercel URL and check if the dashboard loads data from the backend.
