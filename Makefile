.PHONY: help install dev build test lint format clean docker-up docker-down db-push db-migrate db-studio ios android

# Default target
help:
	@echo "CareBow Development Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Development:"
	@echo "  install      Install all dependencies"
	@echo "  dev          Start all development servers"
	@echo "  dev-api      Start API server only"
	@echo "  dev-mobile   Start Metro bundler only"
	@echo ""
	@echo "Mobile:"
	@echo "  ios          Build and run iOS app"
	@echo "  android      Build and run Android app"
	@echo "  pod-install  Install iOS CocoaPods"
	@echo ""
	@echo "Quality:"
	@echo "  build        Build all apps"
	@echo "  test         Run all tests"
	@echo "  test-watch   Run tests in watch mode"
	@echo "  lint         Run linting"
	@echo "  lint-fix     Fix linting issues"
	@echo "  format       Format code"
	@echo "  typecheck    Run TypeScript checks"
	@echo ""
	@echo "Database:"
	@echo "  db-push      Push Prisma schema"
	@echo "  db-migrate   Create migration"
	@echo "  db-studio    Open Prisma Studio"
	@echo "  db-seed      Seed the database"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up    Start Docker containers"
	@echo "  docker-down  Stop Docker containers"
	@echo "  docker-build Build Docker images"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean        Clean all build artifacts"
	@echo "  update       Update dependencies"

# Installation
install:
	pnpm install

# Development
dev:
	pnpm dev

dev-api:
	pnpm dev:api

dev-mobile:
	pnpm dev:mobile

# Mobile
ios:
	pnpm ios

android:
	pnpm android

pod-install:
	pnpm pod-install

# Build
build:
	pnpm build

build-api:
	pnpm build:api

# Testing
test:
	pnpm test

test-watch:
	pnpm test -- --watch

test-coverage:
	pnpm test -- --coverage

# Quality
lint:
	pnpm lint

lint-fix:
	pnpm lint -- --fix

format:
	pnpm format

typecheck:
	pnpm typecheck

# Database
db-push:
	pnpm db:push

db-migrate:
	pnpm db:migrate

db-studio:
	pnpm db:studio

db-seed:
	cd apps/api && pnpm db:seed

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

docker-logs:
	docker-compose logs -f

# Maintenance
clean:
	pnpm clean
	rm -rf .turbo
	rm -rf coverage
	rm -rf apps/api/.next
	rm -rf apps/mobile/android/app/build

update:
	pnpm update --interactive --latest
