/**
 * Client-side UI Controller — Path Traversal App
 * Author: Aadhil Rizwan
 */

async function fetchDocument(filename) {
  document.getElementById('custom-file-input').value = filename;
}

async function fetchCustomDoc() {
  const filename = document.getElementById('custom-file-input').value.trim();
  const nameEl = document.getElementById('current-doc-name');
  const badgeEl = document.getElementById('doc-status-badge');
  const displayEl = document.getElementById('doc-content-display');

  if (!filename) {
    nameEl.textContent = 'No filename entered.';
    badgeEl.className = 'badge badge-neutral';
    badgeEl.textContent = 'Standby';
    displayEl.textContent = 'Please enter a filename to retrieve.';
    return;
  }

  nameEl.textContent = `Loading: ${filename}...`;
  badgeEl.className = 'badge badge-neutral';
  badgeEl.textContent = 'Fetching';

  try {
    const response = await fetch(`/api/documents/view?file=${encodeURIComponent(filename)}`, {
      headers: { 'Accept': 'application/json' }
    });

    const text = await response.text();
    let jsonData = null;
    try { jsonData = JSON.parse(text); } catch (_) {}

    if (response.ok) {
      badgeEl.className = 'badge badge-info';
      badgeEl.textContent = 'Loaded';
      nameEl.textContent = filename;
      displayEl.textContent = (jsonData && jsonData.content) ? jsonData.content : text;
    } else if (response.status === 404) {
      badgeEl.className = 'badge badge-warning';
      badgeEl.textContent = 'Not Found';
      nameEl.textContent = `File not found: ${filename}`;
      displayEl.textContent = `The file "${filename}" could not be found. Please check the filename and try again.`;
    } else {
      badgeEl.className = 'badge badge-warning';
      badgeEl.textContent = `Error ${response.status}`;
      nameEl.textContent = `Could not load: ${filename}`;
      displayEl.textContent = (jsonData && jsonData.message) ? jsonData.message : `An error occurred while retrieving the file (HTTP ${response.status}).`;
    }
  } catch (err) {
    badgeEl.className = 'badge badge-warning';
    badgeEl.textContent = 'Error';
    nameEl.textContent = 'Request failed';
    displayEl.textContent = `Unable to connect to the server: ${err.message}`;
  }
}

// Health check on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (data.status === 'online') {
      const el = document.getElementById('system-status-indicator');
      if (el) el.innerHTML = '<span class="status-dot"></span> System Online';
    }
  } catch (_) {}
});
