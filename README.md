# Bracket — Real-time Tournament Manager

A full-stack application to create and manage tournaments in real time, built as a portfolio project.

## Why this project?

I wanted to build something that covers technical concepts I care about (authentication, scalable architecture) while discovering real-time communication around a topic I enjoy: competitive games. Bracket lets players organize tournaments, track matches, and see results update live without refreshing the page.

## Features

TBD

## Stack

**Backend**
- Node.js + Express
- Socket.io — real-time updates
- Prisma ORM + PostgreSQL
- JWT authentication
- Zod — request validation
- Pino — logging

**Frontend**
- Next.js (App Router)
- TBD

## Getting started

### Prerequisites
- Node.js 20+
- Docker

### Installation

```bash
git clone https://github.com/your-username/bracket.git
cd bracket/backend
npm install
```

### Configuration

```bash
cp backen/.env.example backend/.env
```

Fill in the `backend/.env` file with your values.

### Start the database

```bash
npm run db:up
```

### Run migrations

```bash
npm run migrate
```

### Start the server

```bash
npm run dev
```
