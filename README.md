# Fetch AI

Fetch is an AI-powered document recall system that can save/read your docs/files and can fetch info from them across chats based on semantic querying.

## Getting Started

### Cloning the Repository

To clone the repository with the submodules, use the following command:

```bash
git clone https://github.com/joshkung25/fetch-ai.git
```

### Backend (Python fastapi)

#### Setup Virtual Environment

It is recommended to use Python virtual environment, so you don't pollute your system Python environment.

```bash
# Install dependencies
poetry install
```

```bash
# Update/upgrade dependencies
poetry update
```

```bash
# Activate Python virtual environment
eval $(poetry env activate)
```

Create an .env file

```bash
cp .env.example .env
```

Run the following command to start the backend. It will be hosted on http://0.0.0.0:8001

```bash
uvicorn main:app --reload --port 8001

```

Docker

```bash
docker compose up --build

```

### Frontend (Next.js)

cd into front-end folder

```bash
npm install
npm run dev

```
