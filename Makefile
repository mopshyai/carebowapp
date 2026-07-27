.PHONY: help install dev build test lint format clean ios android

# Default target
help:
	@echo "CareBow Development Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Development:"
	@echo "  install      Install all dependencies"
	@echo "  dev          Start all development servers"
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
	@echo "Maintenance:"
	@echo "  clean        Clean all build artifacts"
	@echo "  update       Update dependencies"

# Installation
install:
	pnpm install

# Development
dev:
	pnpm dev

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

# Maintenance
clean:
	pnpm clean
	rm -rf .turbo
	rm -rf coverage
	rm -rf apps/mobile/android/app/build

update:
	pnpm update --interactive --latest
