#!/usr/bin/env bash
set -e

if ! command -v git >/dev/null 2>&1; then
  echo "git is not installed or not in PATH. Install Git first."
  exit 1
fi

REMOTE_URL="$1"
BRANCH="main"

if [ -z "$REMOTE_URL" ]; then
  echo "Usage: ./scripts/deploy.sh <remote-url>"
  exit 1
fi

if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "Initial commit: prepare for deploy"
else
  git add .
  git commit -m "Update deploy files" || echo "No changes to commit"
fi

git branch -M "$BRANCH"
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"
git push -u origin "$BRANCH" --force

if command -v docker >/dev/null 2>&1; then
  echo "Docker found, building luxdrive image..."
  docker build -t luxdrive .
else
  echo "Docker not found; skipping local image build."
fi
