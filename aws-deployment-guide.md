# CampusConnect - AWS Deployment Guide

This guide outlines the steps to deploy CampusConnect to Amazon Web Services (AWS) using EC2 for compute and RDS for the database.

## Prerequisites
- An active AWS Account
- AWS CLI installed and configured locally
- SSH Key Pair created in AWS EC2

## Architecture Overview
- **Database:** Amazon RDS (MySQL 8.0)
- **Backend & Frontend:** Amazon EC2 (Ubuntu 22.04) running Docker Compose

---

## Step 1: Provision the Database (RDS)

1. Go to the **Amazon RDS Console**.
2. Click **Create database**.
3. Select **MySQL** (Version 8.0).
4. Choose the **Free tier** template (or Dev/Test if you prefer).
5. Set the DB instance identifier to `campusconnect-db`.
6. Set the Master username to `ccuser` and set a strong password.
7. Under **Connectivity**, ensure "Public access" is set to **No**.
8. Ensure the VPC Security Group allows inbound traffic on port `3306` from your EC2 instance's Security Group.
9. Click **Create database**. Note the **Endpoint URL** once it becomes available.

---

## Step 2: Provision the App Server (EC2)

1. Go to the **Amazon EC2 Console**.
2. Click **Launch Instance**.
3. Choose **Ubuntu Server 22.04 LTS (AMI)**.
4. Choose **t2.micro** (or larger).
5. Select your existing Key Pair.
6. Under **Network settings**, create a Security Group allowing:
   - SSH (Port 22) from your IP
   - HTTP (Port 80) from anywhere
   - Custom TCP (Port 8080) from anywhere (for backend API access)
7. Click **Launch Instance**.

---

## Step 3: Server Setup & Deployment

1. SSH into your EC2 instance:
   ```bash
   ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
   ```

2. Install Docker and Docker Compose:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo usermod -aG docker ubuntu
   # Log out and log back in for group changes to take effect
   ```

3. Clone your repository:
   ```bash
   git clone https://github.com/Aryan07175/CampusConnect-Placement-Recruitment-Portal.git
   cd CampusConnect-Placement-Recruitment-Portal
   ```

4. Modify the `docker-compose.yml` file to point to your RDS database instead of the local MySQL container. Update the backend environment variables:
   ```yaml
   environment:
     - SPRING_DATASOURCE_URL=jdbc:mysql://<RDS-ENDPOINT-URL>:3306/campusconnect
     - SPRING_DATASOURCE_USERNAME=ccuser
     - SPRING_DATASOURCE_PASSWORD=<YOUR-RDS-PASSWORD>
   ```

5. Build and run the containers:
   ```bash
   docker-compose up -d --build
   ```

## Step 4: Verification

- Visit `http://<EC2-PUBLIC-IP>` in your browser to see the React frontend.
- Visit `http://<EC2-PUBLIC-IP>:8080/swagger-ui.html` to see the backend API documentation.
