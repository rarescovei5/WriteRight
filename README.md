# ✍️ WriteRight – Lightweight Markdown Lesson Organizer

**WriteRight** is a local-first desktop application for creating and organizing markdown-based lesson content. It’s designed for speed, simplicity, and structured note-taking in a familiar folder/file interface.

---

## ✅ What It Does

- **📁 Visual File & Folder Explorer**
  Browse, create, rename, and delete markdown files and folders in a workspace tree, directly reflecting the structure on your disk.

- **📝 Minimal Markdown Editor**
  Edit any text files with live updates. Supports core markdown syntax including:

  - Headings, lists, bold/italic
  - Code blocks
  - Links and inline images

- **🧭 Sidebar Navigation**
  Quickly switch between files, organize folders, and manage workspace structure visually.

- **🌙 Local-First, No Account Required**
  All your notes are stored as plain text markdown files in a folder of your choosing—no databases, no cloud, no lock-in.

---

## 🧰 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS

- **Desktop Runtime**: [Tauri](https://tauri.app)

  - Lightweight, fast, and secure native desktop shell
  - Bridges the frontend with system-level file APIs via Rust

- **State Management**: Redux Toolkit

- **Routing**: React Router

- **Icons/UI**: Lucide + shadcn/ui + Radix UI

---

## ⚙️ How It Works

1. When you launch WriteRight, you select a folders (your “vaults”).
2. The selected folder is scanned and shown as a sidebar tree of markdown files and subfolders.
3. Clicking on a file opens it in the main editor pane.
4. You can right-click items to rename, delete, or create new files/folders.
5. All edits are saved directly to disk—nothing is stored elsewhere.
