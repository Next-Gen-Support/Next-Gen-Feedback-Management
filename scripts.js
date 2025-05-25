const listURL = 'https://next-gen-feedback-server.vercel.app/api/list.js';
const addURL = 'https://next-gen-feedback-server.vercel.app/api/add.js';
const deleteURL = 'https://next-gen-feedback-server.vercel.app/api/delete.js';

const listContainer = document.getElementById('feedback-list');
const notifBtn = document.getElementById('notif-btn');
const notifBadge = document.getElementById('notif-badge');
const deleteBtn = document.getElementById('delete-selected');
const selectAllBtn = document.getElementById('select-all');
const deselectAllBtn = document.getElementById('deselect-all');
const downloadBtn = document.getElementById('download-all');
const themeToggle = document.getElementById('theme-toggle');
const addFeedbackBtn = document.getElementById('add-feedback');

let storedIDs = JSON.parse(localStorage.getItem('feedbacks') || '[]');

function decodeBase64(b64) {
  try {
    return JSON.parse(atob(b64));
  } catch (e) {
    return null;
  }
}

function updateList() {
  fetch(listURL)
    .then(res => res.json())
    .then(data => {
      listContainer.innerHTML = '';
      let newCount = 0;
      const ids = data.ids || [];
      const unique = new Set(storedIDs);

      ids.forEach(encoded => {
        const decoded = decodeBase64(encoded);
        if (!decoded) return;
        const displayName = Object.keys(decoded)[0] || 'Feedback';
        const displayText = decoded[displayName];

        const li = document.createElement('li');
        li.className = 'feedback-item';
        li.innerHTML = `
          <input type="checkbox" data-id="${encoded}">
          <div>
            <strong>${displayName}</strong><br>
            <small>${displayText.replace(/\n/g, '<br>')}</small>
          </div>
        `;

        listContainer.appendChild(li);

        if (!unique.has(encoded)) {
          newCount++;
          storedIDs.push(encoded);
        }
      });

      localStorage.setItem('feedbacks', JSON.stringify(storedIDs));
      notifBadge.style.display = newCount > 0 ? 'inline' : 'none';
      notifBadge.textContent = newCount;
    });
}

function deleteSelected() {
  const checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
  checkboxes.forEach(cb => {
    const id = cb.getAttribute('data-id');
    fetch(deleteURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(() => updateList());
  });
}

deleteBtn.addEventListener('click', deleteSelected);

selectAllBtn.onclick = () => {
  document.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = true);
  deleteBtn.disabled = false;
};

deselectAllBtn.onclick = () => {
  document.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
  deleteBtn.disabled = true;
};

listContainer.addEventListener('change', () => {
  const selected = document.querySelectorAll('input[type=checkbox]:checked').length;
  deleteBtn.disabled = selected === 0;
});

themeToggle.addEventListener('click', () => {
  const themes = ['theme-dark', 'theme-light', 'theme-galaxy'];
  const current = document.body.className;
  const index = themes.indexOf(current);
  document.body.className = themes[(index + 1) % themes.length];
});

addFeedbackBtn.onclick = () => {
  const id = prompt("Enter feedback content:");
  if (id) {
    fetch(addURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(res => res.json()).then(() => updateList());
  }
};

downloadBtn.onclick = () => {
  const decoded = storedIDs.map(decodeBase64).filter(Boolean);
  const blob = new Blob([JSON.stringify(decoded, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'feedbacks.json';
  a.click();
  URL.revokeObjectURL(url);
};

notifBtn.onclick = () => {
  notifBadge.textContent = '0';
  notifBadge.style.display = 'none';
};

updateList();