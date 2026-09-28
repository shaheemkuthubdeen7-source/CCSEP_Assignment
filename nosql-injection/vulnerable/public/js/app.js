/**
 * Client-side UI Controller — NoSQL Injection App
 * Author: Aadhil Rizwan
 */

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    spinner.classList.add('hidden');
    resultBox.classList.remove('hidden');

    if (response.ok && data.status === 'success') {
      resultBox.className = 'result-box success';
      resultBox.innerHTML = `
        <strong>Login successful</strong>
        <p>Welcome, <strong>${data.data.fullName}</strong></p>
      `;
    } else {
      resultBox.className = 'result-box error';
      resultBox.innerHTML = `
        <strong>Login failed</strong>
        <p>${data.message || 'Invalid username or password.'}</p>
      `;
    }
  } catch (err) {
    spinner.classList.add('hidden');
    resultBox.classList.remove('hidden');
    resultBox.className = 'result-box error';
    resultBox.innerHTML = `<strong>Network error:</strong> ${err.message}`;
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
