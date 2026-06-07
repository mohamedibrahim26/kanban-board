/* ═══════════════════════════════════════════
     DATA SCHEMA & SEED
  ═══════════════════════════════════════════ */
  const COLS = [
    { id:'todo',   label:'To Do',       cls:'col-todo',   max:null },
    { id:'prog',   label:'In Progress', cls:'col-prog',   max:5    },
    { id:'review', label:'In Review',   cls:'col-review', max:null },
    { id:'done',   label:'Done',        cls:'col-done',   max:null },
  ];

  const ASSIGNEE_COLORS = {
    IB: 'linear-gradient(135deg,#6c63ff,#a855f7)',
    SM: 'linear-gradient(135deg,#ff6b35,#ffb703)',
    AK: 'linear-gradient(135deg,#00b4d8,#1a936f)',
    JD: 'linear-gradient(135deg,#ec4899,#f43f5e)',
  };

  const LABEL_STYLES = {
    Design:   'background:rgba(108,99,255,0.12);color:#6c63ff',
    Frontend: 'background:rgba(255,107,53,0.12);color:#ff6b35',
    Backend:  'background:rgba(0,180,216,0.12);color:#00b4d8',
    Bug:      'background:rgba(255,59,59,0.12);color:#ff3b3b',
    Feature:  'background:rgba(236,72,153,0.12);color:#ec4899',
    Docs:     'background:rgba(255,183,3,0.15);color:#c68a00',
  };

  const SEED = [
    { id:'t1', col:'todo',   title:'Design new onboarding flow',        desc:'Create wireframes for the 3-step onboarding experience for new users.', priority:'high',   due:'2026-06-10', assignee:'IB', labels:['Design','Feature'], done:false },
    { id:'t2', col:'todo',   title:'Write API documentation',           desc:'Document all REST endpoints with examples and response schemas.',        priority:'medium', due:'2026-06-12', assignee:'AK', labels:['Backend','Docs'],   done:false },
    { id:'t3', col:'todo',   title:'Fix mobile nav overflow bug',        desc:'Navigation breaks on screens smaller than 360px. Needs hotfix.',         priority:'urgent', due:'2026-06-08', assignee:'SM', labels:['Bug','Frontend'],   done:false },
    { id:'t4', col:'prog',   title:'Build reusable button component',   desc:'Design system buttons with variants: primary, ghost, danger, icon.',     priority:'medium', due:'2026-06-09', assignee:'IB', labels:['Frontend','Design'],done:false },
    { id:'t5', col:'prog',   title:'Set up CI/CD pipeline',             desc:'Configure GitHub Actions for automatic testing and deployment to Vercel.',priority:'high',   due:'2026-06-11', assignee:'AK', labels:['Backend'],           done:false },
    { id:'t6', col:'review', title:'User dashboard redesign',           desc:'Updated layout with improved data visualisation and quicker navigation.', priority:'high',   due:'2026-06-07', assignee:'SM', labels:['Design','Frontend'], done:false },
    { id:'t7', col:'review', title:'Accessibility audit',               desc:'WCAG 2.1 AA audit across all major user flows. Log issues in Linear.',    priority:'medium', due:'2026-06-13', assignee:'JD', labels:['Frontend'],           done:false },
    { id:'t8', col:'done',   title:'Logo & brand identity',             desc:'Final logo, colour palette and typography guide approved by stakeholders.',priority:'low',    due:'2026-05-30', assignee:'IB', labels:['Design'],             done:true  },
    { id:'t9', col:'done',   title:'Database schema v2 migration',      desc:'Migrate production DB to new schema with zero downtime using blue/green.', priority:'high',   due:'2026-06-01', assignee:'AK', labels:['Backend'],            done:true  },
  ];

  /* ═══════════════════════════════════════════
     STATE
  ═══════════════════════════════════════════ */
  let tasks = JSON.parse(localStorage.getItem('flowboard_tasks') || 'null') || SEED;
  let editingId = null;
  let activeFilter = 'all';
  let searchQuery = '';
  let selectedLabels = [];
  let draggedId = null;
  let clone = null;

  function save() { localStorage.setItem('flowboard_tasks', JSON.stringify(tasks)); }

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  function render() {
    const board = document.getElementById('board');
    const addColBtn = board.querySelector('.add-col-btn');

    // remove old columns, keep add button
    board.querySelectorAll('.column').forEach(c => c.remove());

    COLS.forEach(colDef => {
      const colTasks = tasks.filter(t => {
        if(t.col !== colDef.id) return false;
        if(activeFilter !== 'all' && t.priority !== activeFilter) return false;
        if(searchQuery && !t.title.toLowerCase().includes(searchQuery) && !(t.desc||'').toLowerCase().includes(searchQuery)) return false;
        return true;
      });

      const total  = tasks.filter(t => t.col === colDef.id).length;
      const pct    = colDef.max ? Math.min(100, Math.round((total/colDef.max)*100)) : (total > 0 ? 100 : 0);

      const col = document.createElement('div');
      col.className = `column ${colDef.cls}`;
      col.dataset.col = colDef.id;
      col.innerHTML = `
        <div class="col-header">
          <div class="col-header-top">
            <div class="col-title-row">
              <div class="col-dot"></div>
              <span class="col-title">${colDef.label}</span>
              <span class="col-count">${total}</span>
            </div>
            <button class="col-menu-btn" onclick="openModal('${colDef.id}')" title="Add task">+</button>
          </div>
          <div class="col-progress"><div class="col-progress-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="cards" id="cards-${colDef.id}" data-col="${colDef.id}">
          ${colTasks.length === 0 ? `<div class="col-empty"><div class="col-empty-icon">${colDef.id==='done'?'✅':'📋'}</div><div>${colDef.id==='done'?'Nothing completed yet':'No tasks here yet'}</div></div>` : ''}
          ${colTasks.map(t => renderCard(t)).join('')}
          <div class="drop-placeholder" id="ph-${colDef.id}"></div>
        </div>
        <button class="add-card-btn" onclick="openModal('${colDef.id}')">
          <span>+</span> Add a task
        </button>
      `;
      board.insertBefore(col, addColBtn);
    });

    initDragDrop();
    renderStats();
    updateBoardTitle();
  }

  function renderCard(t) {
    const dueStr  = t.due ? formatDue(t.due) : null;
    const dueClass = t.due ? getDueClass(t.due) : '';
    const assigneeStyle = t.assignee ? ASSIGNEE_COLORS[t.assignee] || '' : '';
    const labelsHtml = (t.labels||[]).map(l => `<span class="card-label" style="${LABEL_STYLES[l]||''}">${l}</span>`).join('');
    return `
      <div class="card ${t.done?'done-card':''}" id="card-${t.id}" draggable="true" data-id="${t.id}">
        <div class="card-top">
          <div class="card-labels">${labelsHtml}</div>
          <div class="card-actions">
            <button class="card-action-btn" onclick="openEditModal('${t.id}')" title="Edit">✏️</button>
            <button class="card-action-btn del" onclick="deleteTask('${t.id}')" title="Delete">🗑</button>
          </div>
        </div>
        <div class="card-title">${escHtml(t.title)}</div>
        ${t.desc ? `<div class="card-desc">${escHtml(t.desc)}</div>` : ''}
        <div class="card-footer">
          <div class="card-meta">
            <span class="priority-badge p-${t.priority}">${t.priority}</span>
            ${dueStr ? `<span class="card-due ${dueClass}">📅 ${dueStr}</span>` : ''}
          </div>
          ${t.assignee ? `<div class="card-assignee" style="background:${assigneeStyle}" title="${t.assignee}">${t.assignee}</div>` : ''}
        </div>
      </div>
    `;
  }

  function renderStats() {
    const total  = tasks.length;
    const done   = tasks.filter(t => t.col === 'done').length;
    const prog   = tasks.filter(t => t.col === 'prog').length;
    const urgent = tasks.filter(t => t.priority === 'urgent' && t.col !== 'done').length;
    document.getElementById('statsRow').innerHTML = `
      <div class="stat-pill"><div class="stat-dot" style="background:var(--todo)"></div><span class="stat-num">${total}</span><span class="stat-lbl">Total tasks</span></div>
      <div class="stat-pill"><div class="stat-dot" style="background:var(--done)"></div><span class="stat-num">${done}</span><span class="stat-lbl">Completed</span></div>
      <div class="stat-pill"><div class="stat-dot" style="background:var(--prog)"></div><span class="stat-num">${prog}</span><span class="stat-lbl">In progress</span></div>
      <div class="stat-pill"><div class="stat-dot" style="background:var(--p-urgent)"></div><span class="stat-num">${urgent}</span><span class="stat-lbl">Urgent</span></div>
      <div class="stat-pill" style="cursor:pointer" onclick="clearDone()" title="Clear completed">
        <div class="stat-dot" style="background:#ccc"></div>
        <span class="stat-lbl" style="color:var(--text3)">Clear done</span>
      </div>
    `;
  }

  function updateBoardTitle() {
    const name = document.getElementById('boardName').value || 'My Board';
    document.getElementById('boardTitle').textContent = name;
  }

  function saveBoardName() {
    localStorage.setItem('flowboard_name', document.getElementById('boardName').value);
    updateBoardTitle();
  }

  /* ═══════════════════════════════════════════
     DRAG AND DROP
  ═══════════════════════════════════════════ */
  function initDragDrop() {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('dragstart', onDragStart);
      card.addEventListener('dragend',   onDragEnd);
    });
    document.querySelectorAll('.cards').forEach(zone => {
      zone.addEventListener('dragover',  onDragOver);
      zone.addEventListener('dragleave', onDragLeave);
      zone.addEventListener('drop',      onDrop);
    });
  }

  function onDragStart(e) {
    draggedId = e.currentTarget.dataset.id;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedId);
    setTimeout(() => { e.currentTarget.style.opacity = '0.3'; }, 0);
  }

  function onDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    e.currentTarget.style.opacity = '';
    draggedId = null;
    document.querySelectorAll('.drop-placeholder').forEach(p => p.classList.remove('show'));
    document.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const col = e.currentTarget.closest('.column');
    if(col) col.classList.add('drag-over');
    const ph = document.getElementById('ph-' + e.currentTarget.dataset.col);
    if(ph) ph.classList.add('show');
  }

  function onDragLeave(e) {
    if(!e.currentTarget.contains(e.relatedTarget)) {
      const col = e.currentTarget.closest('.column');
      if(col) col.classList.remove('drag-over');
      const ph = document.getElementById('ph-' + e.currentTarget.dataset.col);
      if(ph) ph.classList.remove('show');
    }
  }

  function onDrop(e) {
    e.preventDefault();
    const targetCol = e.currentTarget.dataset.col;
    if(!draggedId || !targetCol) return;
    const task = tasks.find(t => t.id === draggedId);
    if(!task) return;

    const fromCol = task.col;
    task.col = targetCol;
    if(targetCol === 'done') { task.done = true; }
    else if(fromCol === 'done') { task.done = false; }

    save();
    render();

    if(targetCol === 'done' && fromCol !== 'done') {
      fireConfetti();
      showToast('🎉 Task completed! Amazing work!', 'success');
    } else if(fromCol !== targetCol) {
      const colLabel = COLS.find(c => c.id === targetCol)?.label || targetCol;
      showToast(`Moved to ${colLabel}`, 'info');
    }
  }

  /* ═══════════════════════════════════════════
     MODAL
  ═══════════════════════════════════════════ */
  function openModal(colId) {
    editingId = null;
    selectedLabels = [];
    document.getElementById('modalTitle').textContent = 'Add Task';
    document.getElementById('fTitle').value = '';
    document.getElementById('fDesc').value = '';
    document.getElementById('fPriority').value = 'medium';
    document.getElementById('fDue').value = '';
    document.getElementById('fColumn').value = colId || 'todo';
    document.getElementById('fAssignee').value = '';
    document.querySelectorAll('.label-opt').forEach(o => o.classList.remove('selected'));
    document.getElementById('modalOverlay').classList.add('open');
    setTimeout(() => document.getElementById('fTitle').focus(), 300);
  }

  function openEditModal(id) {
    const t = tasks.find(x => x.id === id);
    if(!t) return;
    editingId = id;
    selectedLabels = [...(t.labels||[])];
    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('fTitle').value = t.title;
    document.getElementById('fDesc').value = t.desc || '';
    document.getElementById('fPriority').value = t.priority;
    document.getElementById('fDue').value = t.due || '';
    document.getElementById('fColumn').value = t.col;
    document.getElementById('fAssignee').value = t.assignee || '';
    document.querySelectorAll('.label-opt').forEach(o => {
      o.classList.toggle('selected', selectedLabels.includes(o.dataset.label));
    });
    document.getElementById('modalOverlay').classList.add('open');
    setTimeout(() => document.getElementById('fTitle').focus(), 300);
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
    editingId = null; selectedLabels = [];
  }

  function saveTask() {
    const title = document.getElementById('fTitle').value.trim();
    if(!title) { showToast('Please enter a task title', 'error'); document.getElementById('fTitle').focus(); return; }

    if(editingId) {
      const t = tasks.find(x => x.id === editingId);
      t.title    = title;
      t.desc     = document.getElementById('fDesc').value.trim();
      t.priority = document.getElementById('fPriority').value;
      t.due      = document.getElementById('fDue').value;
      t.col      = document.getElementById('fColumn').value;
      t.assignee = document.getElementById('fAssignee').value;
      t.labels   = [...selectedLabels];
      t.done     = t.col === 'done';
      showToast('✓ Task updated', 'info');
    } else {
      tasks.push({
        id:       'task_' + Date.now(),
        col:      document.getElementById('fColumn').value,
        title,
        desc:     document.getElementById('fDesc').value.trim(),
        priority: document.getElementById('fPriority').value,
        due:      document.getElementById('fDue').value,
        assignee: document.getElementById('fAssignee').value,
        labels:   [...selectedLabels],
        done:     false,
      });
      showToast('✓ Task added!', 'success');
    }
    save(); closeModal(); render();
  }

  function deleteTask(id) {
    const t = tasks.find(x => x.id === id);
    if(!t) return;
    const card = document.getElementById('card-' + id);
    if(card) {
      card.style.transition = 'all 0.25s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      setTimeout(() => {
        tasks = tasks.filter(x => x.id !== id);
        save(); render();
      }, 220);
    }
    showToast('Task deleted', 'warning');
  }

  function clearDone() {
    const count = tasks.filter(t => t.col === 'done').length;
    if(count === 0) { showToast('No completed tasks to clear', 'info'); return; }
    tasks = tasks.filter(t => t.col !== 'done');
    save(); render();
    showToast(`🗑 Cleared ${count} completed task${count>1?'s':''}`, 'warning');
  }

  /* ═══════════════════════════════════════════
     FILTERS & SEARCH
  ═══════════════════════════════════════════ */
  function filterByPriority(p, btn) {
    activeFilter = p;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    render();
  }

  function handleSearch() {
    searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
    render();
  }

  function toggleLabel(el) {
    const l = el.dataset.label;
    if(selectedLabels.includes(l)) {
      selectedLabels = selectedLabels.filter(x => x !== l);
      el.classList.remove('selected');
    } else {
      selectedLabels.push(l);
      el.classList.add('selected');
    }
  }

  /* ═══════════════════════════════════════════
     UTILS
  ═══════════════════════════════════════════ */
  function formatDue(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    const diff = Math.round((d - today) / 86400000);
    if(diff < 0)  return `${Math.abs(diff)}d overdue`;
    if(diff === 0) return 'Today';
    if(diff === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
  }

  function getDueClass(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    const diff = Math.round((d - today) / 86400000);
    if(diff < 0) return 'overdue';
    if(diff <= 2) return 'soon';
    return '';
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ═══════════════════════════════════════════
     TOAST
  ═══════════════════════════════════════════ */
  function showToast(msg, type='info') {
    const wrap = document.getElementById('toastWrap');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 350); }, 3000);
  }

  /* ═══════════════════════════════════════════
     CONFETTI
  ═══════════════════════════════════════════ */
  function fireConfetti() {
    const colors = ['#6c63ff','#a855f7','#ec4899','#ff6b35','#ffb703','#1a936f','#00b4d8','#ff3b3b'];
    for(let i = 0; i < 80; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.cssText = `
        left:${20 + Math.random()*60}vw;
        top:-10px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        width:${6+Math.random()*8}px;
        height:${6+Math.random()*8}px;
        border-radius:${Math.random()>0.5?'50%':'2px'};
        animation-duration:${1.5+Math.random()*2}s;
        animation-delay:${Math.random()*0.5}s;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3500);
    }
  }

  /* ═══════════════════════════════════════════
     KEYBOARD SHORTCUTS
  ═══════════════════════════════════════════ */
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') closeModal();
    if((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('searchInput').focus();
    }
    if((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if(document.getElementById('modalOverlay').classList.contains('open')) saveTask();
    }
    if(e.key === 'n' && !e.target.matches('input,textarea,select')) openModal();
  });

  // close modal on overlay click
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if(e.target === document.getElementById('modalOverlay')) closeModal();
  });

  /* ═══════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════ */
  const savedName = localStorage.getItem('flowboard_name');
  if(savedName) {
    document.getElementById('boardName').value = savedName;
  }

  render();
  showToast('💡 Press N to add a task · ⌘K to search', 'info');