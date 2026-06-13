# Update Guide for AWS and Vercel

Since your application is already deployed, follow these steps to apply the recent changes (new users, Admin roles, and Login page cleanup).

---

## 1. Update the Frontend (Vercel)

Vercel usually deploys automatically when you push changes to your main branch.

1.  **Push the changes:** Push the updated code to your GitHub repository.
2.  **Verify Build:** Go to your Vercel Dashboard, select your project, and ensure the latest deployment is successful.
3.  **Check:** Visit your site. The "Demo accounts" section should now be gone from the Login page.

---

## 2. Update the Backend (AWS EC2)

You need to pull the new code onto your EC2 instance and restart the Docker container.

1.  **SSH into your EC2 instance:**
    ```bash
    ssh -i your-key.pem ec2-user@your-instance-public-ip
    ```
2.  **Pull the latest changes:**
    ```bash
    cd Team_Tasks_progress
    git pull origin main  # or your specific branch
    ```
3.  **Rebuild and Restart the Container:**
    ```bash
    cd backend
    docker stop backend
    docker rm backend
    docker build -t taskflow-backend .
    docker run -d --name backend -p 5000:5000 --env-file .env taskflow-backend
    ```

---

## 3. Apply the New User Data (Seeding)

To replace the old demo users with the new ones in your production database, you need to run the seed script. You can do this from your local machine (if you have Node.js installed) or directly on the EC2 instance.

### Option A: From your Local Machine (Recommended)
Run this command from the `backend/` folder on your computer:
```bash
MONGO_URI="your_mongodb_atlas_connection_string" npm run seed
```
*(Replace `your_mongodb_atlas_connection_string` with your actual Atlas URI, including the password and database name).*

### Option B: On the EC2 Instance
Run this command inside the running Docker container:
```bash
docker exec -it backend npm run seed
```

---

## 4. Final Credentials

After seeding, the new login details will be:

| Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| Ankit | Ankit@showtimeconsulting.in | `employee123` | Employee |
| Hari Krishna | HariKrishna@showtimeconsulting.in | `employee123` | Employee |
| Vidya Kolati | Vidya@showtimeconsulting.in | `employee123` | Employee |
| Faisal | Faisal@showtimeconsulting.in | `employee123` | Employee |
| Pardhasaradhi | pardhasaradhi@showtimeconsulting.in | `admin123` | **Admin** |
