// Utilitas bersama untuk seluruh halaman EduCapy
const API = {
  token: () => localStorage.getItem('token'),
  user: () => JSON.parse(localStorage.getItem('user') || 'null'),
  async request(method, url, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (API.token()) headers.Authorization = 'Bearer ' + API.token();
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && API.token()) API.logout();
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
    return data;
  },
  get: (url) => API.request('GET', url),
  post: (url, body) => API.request('POST', url, body || {}),
  put: (url, body) => API.request('PUT', url, body || {}),
  del: (url) => API.request('DELETE', url),
  logout() { localStorage.clear(); location.href = '/login.html'; },
};

// Escape teks sebelum disisipkan ke innerHTML
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function showMsg(el, text, type) {
  el.textContent = text;
  el.className = 'msg show ' + (type || 'error');
}

const NAV = {
  student: [['/dashboard.html', 'Beranda'], ['/enroll.html', 'Daftar les'], ['/my-lessons.html', 'Les saya'], ['/calendar.html', 'Kalender']],
  teacher: [['/dashboard.html', 'Beranda'], ['/availability.html', 'Ketersediaan'], ['/teaching.html', 'Mata pelajaran'], ['/my-lessons.html', 'Les saya'], ['/calendar.html', 'Kalender']],
  admin: [['/dashboard.html', 'Beranda'], ['/admin-users.html', 'Pengguna'], ['/calendar.html', 'Kalender dan rekap'], ['/admin-schedule.html', 'Ubah jadwal']],
};

// Wajib dipanggil di halaman yang butuh login. Mengembalikan data pengguna.
function initPage(roles) {
  const user = API.user();
  if (!API.token() || !user) { location.href = '/login.html'; return null; }
  if (roles && !roles.includes(user.role)) { location.href = '/dashboard.html'; return null; }
  const here = location.pathname;
  const links = NAV[user.role].map(([href, label]) =>
    `<a href="${href}" class="${here === href ? 'active' : ''}">${label}</a>`).join('');
  document.getElementById('nav').innerHTML =
    `<nav class="top"><div class="inner"><span class="brand">EduCapy</span>${links}
     <span class="spacer"></span><span>${esc(user.name)}</span>
     <button type="button" id="logout">Keluar</button></div></nav>`;
  document.getElementById('logout').onclick = API.logout;
  return user;
}

const LEVELS = ['SD', 'SMP', 'SMA'];
const DAYS = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const hhmm = (t) => String(t).slice(0, 5);
const STATUS = { scheduled: 'Terjadwal', cancelled: 'Dibatalkan siswa', teacher_withdrawn: 'Guru mundur' };
