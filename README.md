# 📋 FlowBoard — Kanban Task Manager

🔗 **Live Demo:** [mohamedibrahim26.github.io/flowboard-kanban](https://mohamedibrahim26.github.io/flowboard-kanban)

---

## ✨ Features

### 🗂 Board & Columns

- 4 workflow columns — **To Do, In Progress, In Review, Done**
- Per-column **task count badges** and animated **progress bars**
- Editable **board name** saved to localStorage
- **Add Column** placeholder for extensibility

### 🃏 Task Cards

- Full **CRUD** — create, read, update, and delete tasks
- **Priority badges** — Urgent 🔴 / High 🟠 / Medium 🟡 / Low 🟢
- **Color-coded labels** — Design, Frontend, Backend, Bug, Feature, Docs
- **Due dates** with dynamic status — overdue (red), due soon (amber), upcoming (grey)
- **Assignee avatars** with gradient color coding
- Smooth **slide-in card animation** on creation
- Smooth **fade-out animation** on deletion

### 🖱 Drag & Drop

- Full **HTML5 drag-and-drop** between all columns
- Visual **drag ghost** with rotation effect
- **Drop zone highlight** on hover
- **Confetti explosion** 🎉 when a card lands in Done

### 🔍 Search & Filter

- **Live search** — filters cards across all columns as you type
- **Priority filter chips** — filter the entire board by priority level instantly

### 💾 Persistence

- All tasks, board name, and state saved to **`localStorage`**
- Survives page refresh, tab close, and browser restart

### ⌨️ Keyboard Shortcuts

| Shortcut       | Action              |
| -------------- | ------------------- |
| `N`            | Open add task modal |
| `Esc`          | Close modal         |
| `⌘ / Ctrl + K` | Focus search        |
| `⌘ / Ctrl + ↵` | Save task           |

---

## 🛠 Tech Stack

| Layer     | Technology                                         |
| --------- | -------------------------------------------------- |
| Structure | HTML5 (semantic)                                   |
| Styling   | CSS3 — Grid, Flexbox, Variables, Animations        |
| Logic     | Vanilla JavaScript (ES6+)                          |
| Fonts     | Google Fonts — Plus Jakarta Sans, Playfair Display |
| Storage   | Web localStorage API                               |
| Hosting   | GitHub Pages                                       |

> No frameworks. No libraries. No build tools. Pure fundamentals.

---

## 📁 Project Structure

```
KanbanBoard/
├── index.html      # HTML structure, modals & board layout
├── styles.css      # All styling, light theme, animations & responsive design
└── script.js       # Drag-drop logic, CRUD, filters, search & localStorage
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/mohamedibrahim26/flowboard-kanban.git

# Open in browser
cd flowboard-kanban
open index.html
```

No npm install. No build step. Just open and run.

---

## 🎯 Key Concepts Demonstrated

- **Drag & Drop API** — `dragstart`, `dragover`, `dragleave`, `drop` events with live visual feedback
- **DOM Manipulation** — dynamic board rendering, card CRUD, column state updates
- **Event Delegation** — efficient event handling across dynamically created elements
- **CSS Architecture** — custom properties, light theme, glassmorphism modals, keyframe animations
- **Web APIs** — `localStorage`, `IntersectionObserver`, `Date` for due-date logic
- **UX Patterns** — toast notifications, confetti, keyboard shortcuts, empty states
- **Data Management** — in-memory state synced to localStorage on every change

---

## 📸 Sections

1. **Navbar** — board name editor, live search, team avatars, add task button
2. **Board Header** — sprint label, priority filter chips, live stats pills
3. **Kanban Board** — 4 drag-and-drop columns with progress indicators
4. **Task Modal** — full form with title, description, priority, due date, assignee, labels
5. **Toast System** — bottom-center notification stack for all actions
6. **Confetti** — celebration animation when tasks are completed
