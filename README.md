# FlowBoard - Kanban Task Manager

A Kanban board I built from scratch using only HTML, CSS, and JavaScript. Inspired by tools like Trello. The goal was to build something actually useful, not just a demo.

No libraries, no frameworks, no build tools.

Live demo: https://mohamedibrahim26.github.io/kanban-board/

---

## Why I built this

I use task boards a lot for personal projects and wanted to understand how drag and drop actually works under the hood. Building one yourself is a completely different experience from just using one. It helped me understand state management, DOM updates, and event handling much better than any tutorial did.

---

## What it does

**The board**
- Four columns: To Do, In Progress, In Review, Done
- Each column shows a task count and a progress bar
- The board title is editable and gets saved to localStorage

**Task cards**
- You can add, edit, and delete tasks
- Each card can have a priority level (Urgent, High, Medium, Low), a due date, an assignee, and labels like Design, Frontend, Bug etc.
- Due dates change colour based on how close they are. Red if overdue, amber if within two days
- Cards animate in when added and fade out when deleted

**Drag and drop**
- Cards can be dragged between any column
- When you drop a card into Done, confetti fires across the screen
- The column highlights as you drag over it so you know where it will land

**Search and filter**
- The search bar filters cards across all columns as you type
- The priority chips at the top let you filter the whole board to one priority level

**Persistence**
- Everything saves to localStorage automatically
- Tasks, board name, all of it survives a refresh

**Keyboard shortcuts**
- `N` to open the add task form
- `Escape` to close it
- `Ctrl + K` (or Cmd + K) to jump to search
- `Ctrl + Enter` to save a task from the keyboard

---

## File structure

```
KanbanBoard/
├── index.html    - board layout, columns, modal markup
├── styles.css    - light theme, card styles, animations
└── script.js     - drag-drop, CRUD, filters, search, localStorage
```

---

## Tech used

- HTML5
- CSS3 (custom properties, keyframes, flexbox, grid)
- Vanilla JavaScript (ES6+)
- HTML5 Drag and Drop API
- localStorage for data persistence
- Google Fonts (Plus Jakarta Sans, Playfair Display)
- Hosted on GitHub Pages

---

## Running it locally

```bash
git clone https://github.com/mohamedibrahim26/flowboard-kanban.git
cd flowboard-kanban
```

Open `index.html` in your browser. That is it.

---

## Things I learnt

Drag and drop was the hardest part. The browser fires `dragleave` when the cursor moves over a child element inside the drop zone, which breaks the highlight effect. It took me a while to figure out how to handle that correctly using `relatedTarget`. Managing state as a plain array and re-rendering the whole board on every change also taught me a lot about how frameworks like React actually earn their value.
