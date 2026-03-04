   Derash Bill Aggregator Backend

This is the central backend system for the Derash Bill Aggregator project. It handles bill management, agent transactions, and administrative reporting.

 Getting Started (For Team Members)
Follow these steps exactly to set up your local development environment.

1. Prerequisites
Ensure you have the following installed:

Node.js (v18 or higher)

PostgreSQL (Running locally or via Docker)

npm (Comes with Node)

2. Installation
First, clone the repository and install the dependencies:

Bash
git clone https://github.com/Derartu3546/derash-bill-aggregator.git
cd derash-bill-aggregator
npm install

3. Environment Setup
Create a .env file in the root directory and add your database connection string:

Plaintext
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/derash_db?schema=public"
(Replace USER and PASSWORD with your local PostgreSQL credentials.)

4. Database Initialization

Run the following commands to sync the database schema and load the test data:

Bash
# Generate the Prisma Client
npx prisma generate

# Apply migrations to create tables
npx prisma migrate dev

# Seed the database with Billers, Agents, and Users
npx prisma db seed

 Team Roles & Workflow
To avoid code conflicts, please follow this workflow:

Never push directly to main.

Create a new branch for your feature: git checkout -b feat/your-feature-name

Commit your changes: git commit -m "Add feature description"

Push to your branch: git push origin feat/your-feature-name

Open a Pull Request (PR) on GitHub for review.

🛠 Tech Stack
Framework: Fastify (Node.js)

Database: PostgreSQL

ORM: Prisma

Language: TypeScript