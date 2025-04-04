# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

- Install dependencies: `npm install`
- Start development server: `npm run serve`
- Build for production: `npm run build`
- Lint: `eslint src/ --ext .js,.vue`

## Code Style and Conventions

- **Framework**: Vue.js 2 with Vue Router and Vuex
- **Formatting**: Uses ESLint with Vue Standard preset
- **Component Naming**: PascalCase for component files (e.g., `AccountAvatar.vue`)
- **Component Structure**: Template first, then script, then style
- **Props**: Use kebab-case in templates, camelCase in script section
- **State Management**: Use Vuex for global state, computed properties for local state
- **Imports**: Group imports by type - Vue core, components, utilities
- **Error Handling**: Use try/catch for async operations with appropriate fallbacks
- **Build System**: Vite.js with plugins for Vue 2 support

This project is an explorer for the Aleph.im network that displays messages and data in real-time.
