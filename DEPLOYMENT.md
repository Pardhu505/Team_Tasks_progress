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

## 2. Backend Deployment (AWS EC2)

Deploying to an EC2 instance using Docker is a robust and flexible method for the backend.

### Steps:

1.  **Launch an EC2 Instance:**
    - Go to the **EC2 Dashboard** in AWS.
    - Click **Launch Instance**.
    - **Name:** `taskflow-backend`.
    - **AMI:** Amazon Linux 2023 (Free tier eligible).
    - **Instance Type:** `t2.micro` or `t3.micro`.
    - **Key Pair:** Create or select an existing one to SSH into the instance.
    - **Security Group:** Create a new one and allow:
        - SSH (Port 22) from your IP.
        - Custom TCP (Port 5000) from Anywhere (or just your Vercel URL).

2.  **Install Docker on EC2:**
    SSH into your instance: `ssh -i your-key.pem ec2-user@your-instance-public-ip`
    Run the following commands:
    ```bash
    sudo yum update -y
    sudo yum install docker -y
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ec2-user
    # Log out and log back in for group changes to take effect
    exit
    ```

3.  **Deploy the Backend:**
    Log back in and run:
    ```bash
    # Clone the repository
    git clone https://github.com/Pardhu505/Team_Tasks_progress.git
    cd Team_Tasks_progress/backend

    # Create a .env file
    nano .env
    ```
    Paste the following into the `.env` file (updating with your real values):
    ```env
    PORT=5000
    NODE_ENV=production
    MONGO_URI=mongodb+srv://poori420:your_password@cluster0.53oeybd.mongodb.net/Team_Tasks?retryWrites=true&w=majority&appName=Cluster0
    JWT_SECRET=your_long_random_secret
    JWT_EXPIRES_IN=7d
    CLIENT_URL=https://your-vercel-frontend-url.vercel.app
    ```
    Press `Ctrl+O`, `Enter`, `Ctrl+X` to save.

4.  **Run with Docker:**
    ```bash
    # Build the image
    docker build -t taskflow-backend .

    # Run the container
    docker run -d --name backend -p 5000:5000 --env-file .env taskflow-backend
    ```

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
    - `VITE_API_URL`: The public URL of your EC2 instance (e.g., `http://3.123.45.67:5000/api`).
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

1.  **Update CORS:** Once you have your Vercel URL (e.g., `https://taskflow-frontend.vercel.app`), go back to your EC2 instance, update the `.env` file's `CLIENT_URL`, and restart the docker container:
    ```bash
    docker stop backend
    docker rm backend
    docker run -d --name backend -p 5000:5000 --env-file .env taskflow-backend
    ```
2.  **Verify:** Open your Vercel URL and check if the dashboard loads data from the backend.
3.  **EC2 IP Changes:** If you restart your EC2 instance, its public IP might change. Consider using an **Elastic IP** in the AWS console to keep your backend URL permanent.
