/**
 * Client-side UI Controller
 * Author: Aadhil Rizwan
 */

// Handle tab switching
function switchTab(tabId) {
  const panes = ['auth', 'docs', 'arch'];
  panes.forEach(p => {
    const paneEl = document.getElementById(`pane-${p}`);
    const btnEl = document.getElementById(`tab-${p}-btn`);
    if (p === tabId) {
      paneEl.classList.remove('hidden');
      btnEl.classList.add('active');
      btnEl.setAttribute('aria-selected', 'true');
    } else {
      paneEl.classList.add('hidden');
      btnEl.classList.remove('active');
      btnEl.setAttribute('aria-selected', 'false');
    }
  });

  if (tabId === 'arch') {
    showSource('auth');
  }
}

// Populate test credentials into login form
function fillCredentials(user, pass) {
  document.getElementById('login-username').value = user;
  document.getElementById('login-password').value = pass;
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const resultBox = document.getElementById('login-result');
  const spinner = document.getElementById('btn-login-spinner');

  spinner.classList.remove('hidden');
  resultBox.classList.add('hidden');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    spinner.classList.add('hidden');
    resultBox.classList.remove('hidden');

    if (response.ok && data.status === 'success') {
      resultBox.className = 'result-box success';
      resultBox.innerHTML = `
        <strong>Authentication Successful (HTTP 200)</strong>
        <p>User: <strong>${data.data.fullName}</strong> (${data.data.role})</p>
        <p>Department: ${data.data.department} | User ID: <code>${data.data.userId}</code></p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;
    } else {
      resultBox.className = 'result-box error';
      resultBox.innerHTML = `
        <strong>Authentication Failed (HTTP ${response.status})</strong>
        <p>${data.message || 'Invalid credentials'}</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;
    }
  } catch (err) {
    spinner.classList.add('hidden');
    resultBox.classList.remove('hidden');
    resultBox.className = 'result-box error';
    resultBox.innerHTML = `<strong>Network error:</strong> ${err.message}`;
  }
}

// Document viewing helpers
async function fetchDocument(filename) {
  document.getElementById('custom-file-input').value = filename;
  await fetchCustomDoc();
}

async function fetchCustomDoc() {
  const filename = document.getElementById('custom-file-input').value.trim();
  const titleEl = document.getElementById('current-doc-name');
  const badgeEl = document.getElementById('doc-status-badge');
  const displayEl = document.getElementById('doc-content-display');

  if (!filename) return;

  titleEl.textContent = `Loading: ${filename}...`;
  badgeEl.className = 'badge badge-neutral';
  badgeEl.textContent = 'Fetching';

  try {
    const response = await fetch(`/api/documents/view?file=${encodeURIComponent(filename)}`, {
      headers: { 'Accept': 'application/json' }
    });

    const text = await response.text();
    let isJson = false;
    let jsonData = null;
    try {
      jsonData = JSON.parse(text);
      isJson = true;
    } catch (_) {}

    if (response.ok) {
      badgeEl.className = 'badge badge-info';
      badgeEl.textContent = 'HTTP 200 OK';
      titleEl.textContent = `File: ${filename}`;
      if (isJson && jsonData.content) {
        displayEl.textContent = jsonData.content;
      } else {
        displayEl.textContent = text;
      }
    } else {
      badgeEl.className = 'badge badge-warning';
      badgeEl.textContent = `HTTP ${response.status}`;
      titleEl.textContent = `Error loading: ${filename}`;
      displayEl.textContent = text;
    }
  } catch (err) {
    badgeEl.className = 'badge badge-warning';
    badgeEl.textContent = 'Error';
    displayEl.textContent = `Failed to fetch document: ${err.message}`;
  }
}

// Source code display snippets for tab 3
const SOURCE_SNIPPETS = {
  auth: `// routes/auth.js
// POST /api/auth/login
// Purpose: Authenticates user credentials against MongoDB.
// Security Note: Unvalidated input object passed directly to query.

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === undefined || password === undefined) {
    return res.status(400).json({ message: 'Both fields required' });
  }

  try {
    // Insecure query: req.body.password can be a query object (e.g. {"$ne": ""})
    // instead of a string, allowing authentication bypass.
    const queryFilter = {
      username: username,
      password: password
    };

    const user = await User.findOne(queryFilter);

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    return res.status(200).json({ status: 'success', user: user.username });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});`,

  docs: `// routes/documents.js
// GET /api/documents/view?file=...
// Purpose: Serves permitted audit files from public/documents/.
// Security Note: path.join does not enforce directory containment.

const PERMITTED_DOCUMENT_DIR = path.join(__dirname, '../public/documents');

router.get('/view', (req, res) => {
  const fileName = req.query.file;

  if (!fileName) {
    return res.status(400).json({ message: 'Missing file parameter' });
  }

  // Insecure path resolution: relative paths like '../../config/.env.secrets'
  // escape the permitted base directory.
  const targetFilePath = path.join(PERMITTED_DOCUMENT_DIR, fileName);

  fs.readFile(targetFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ message: 'File not found.' });
    }
    return res.status(200).send(data);
  });
});`
};

function showSource(type) {
  const display = document.getElementById('code-display-area');
  const buttons = document.querySelectorAll('.mini-tab-btn');
  buttons.forEach(b => b.classList.remove('active'));

  if (type === 'auth') {
    display.textContent = SOURCE_SNIPPETS.auth;
    buttons[0].classList.add('active');
  } else {
    display.textContent = SOURCE_SNIPPETS.docs;
    buttons[1].classList.add('active');
  }
}

// Initial health check on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (data.status === 'online') {
      const el = document.getElementById('system-status-indicator');
      el.innerHTML = '<span class="status-dot"></span> System Online';
    }
  } catch (_) {}
  
  // Load default document preview
  fetchDocument('audit_report_2026.txt');
});
