# Contributing to DoodleDash

Thank you for contributing to DoodleDash! This guide will help you get set up and explain our development workflow, coding standards, and branch model.

---

## 🛠️ Local Development Setup

DoodleDash is structured as an **npm workspaces monorepo**:

* **`packages/shared`** — Core shared types, socket events, and constants.
* **`packages/server`** — Express + Socket.io game logic server.
* **`packages/client`** — React + Vite client application.

### Prerequisites
* **Node.js** >= 20
* **npm** >= 10

### Installation and Start

1. Install all monorepo dependencies:
   ```bash
   npm install
   ```

2. Compile the shared types contract:
   ```bash
   npm run build:shared
   ```

3. Launch server (`http://localhost:3000`) and client (`http://localhost:5173`) in dev watch mode:
   ```bash
   npm run dev
   ```

---

## 💻 Coding Standards

* **TypeScript**: Strict typechecking is enabled. Do not use `any` unless absolutely necessary (annotate callbacks explicitly).
* **Styles**: We use Tailwind CSS v4. Ensure all custom class rules align with design system variables in `index.css`.
* **Clean Code**: Keep react components focused, reusable, and small. 
* **Relative Coordinate System**: All drawing strokes must travel in logical coordinate ranges of `0..1` to maintain responsiveness across varying device widths.

---

## 🔄 Development Workflow

### 1. Branching Model
* Create feature branches off `main`.
* Branch naming scheme:
  * `feat/feature-name` — for new features.
  * `fix/bug-name` — for bug fixes.
  * `docs/update-name` — for documentation additions.

### 2. Linting & Formatting
We enforce formatting checks before commits are finalized:
* Run linter: `npm run lint`
* Format files: `npm run format`
* Typecheck workspaces: `npm run typecheck`

### 3. Commit Guidelines
* Commits should follow [Conventional Commits](https://www.conventionalcommits.org/):
  * `feat(client): add support for spectator view mode`
  * `fix(server): resolve point budget leak on socket disconnect`
  * `docs: add contribute instructions`

---

## 📝 Pull Request Checklist

Before submitting a Pull Request, ensure that:
- [ ] The shared contract is compiled (`npm run build:shared`).
- [ ] No TypeScript warnings or errors exist (`npm run typecheck`).
- [ ] The whole project builds cleanly (`npm run build`).
- [ ] Images/assets are optimized and placed under `packages/client/public/`.
- [ ] No local configurations (`.env`) or temporary files (`.vscode`) are committed.
