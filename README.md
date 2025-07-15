# Fetch AI

Fetch is an AI-powered document recall system that can save/read your docs/files and can fetch info from them across chats based on semantic querying.

## Getting Started

### Cloning the Repository

To clone the repository with the submodules, use the following command:

```bash
git clone https://github.com/tinyfish-io/catfish.git
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
