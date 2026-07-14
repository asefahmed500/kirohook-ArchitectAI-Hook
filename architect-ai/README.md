# ArchitectAI Hook

> Automatically maintain software documentation, architecture diagrams, API docs, changelogs, and testing recommendations whenever source code changes — powered by Kiro Hooks.

## How It Works

1. **Developer saves a file** in `src/`, `app/`, `components/`, `lib/`, or `services/`
2. **Kiro Hook triggers** automatically via `PostToolUse` on `fs_write` events
3. **Code is analyzed** — components, services, API routes, and models are extracted
4. **Docs are regenerated** and saved to the `docs/` folder

No manual steps required.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

| Feature | Output |
|---|---|
| Architecture docs | `docs/architecture.md` |
| API documentation | `docs/api.md` |
| Mermaid diagrams | `docs/system-diagram.mmd` |
| Changelog | `docs/changelog.md` |
| Testing recommendations | `docs/testing.md` |

## Kiro Hook

The hook lives at `.kiro/hooks/hooks.json` and triggers on every `fs_write` to code files.

To test it manually, click **"Trigger Demo Hook"** or **"Scan Codebase"** on the Dashboard.

## Supported Languages

- TypeScript / TSX
- JavaScript / JSX
- React / Next.js components
- Node.js services and API routes

## Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · Mermaid · Zustand
