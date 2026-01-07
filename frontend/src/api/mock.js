const LS_DB_KEY = "__mock_db__";
const LS_TOKEN_KEY = "token";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const id = () => Math.random().toString(36).slice(2, 10);
const nowISO = () => new Date().toISOString();

function loadDB() {
  const raw = localStorage.getItem(LS_DB_KEY);
  if (raw) return JSON.parse(raw);
  const seed = {
    users: [
      { _id: "u_mac", email: "mac12@gmail.com", username: "mac", password: "Test12345" },
    ],
    posts: [
      {
        _id: "p1",
        text: "Вітання з Базілки! Це демо-пост без бекенда 😉",
        authorId: "u_mac",
        authorName: "mac",
        createdAt: nowISO(),
        comments: [],
        likedBy: [],
      },
    ],
    notes: [],
  };
  localStorage.setItem(LS_DB_KEY, JSON.stringify(seed));
  return seed;
}
function saveDB(db) { localStorage.setItem(LS_DB_KEY, JSON.stringify(db)); }

function getTokenUserId() { return localStorage.getItem(LS_TOKEN_KEY) || null; }
function requireAuth() {
  const uid = getTokenUserId();
  if (!uid) { const e = new Error("Неавторизовано"); e.status = 401; throw e; }
  return uid;
}
function match(url, pattern) {
  const re = new RegExp("^" + pattern.replace(":id", "([^/]+)") + "$");
  const m = url.match(re); return m ? m[1] : null;
}

async function handleGET(url) {
  const db = loadDB();

  if (url === "/auth/me") {
    const uid = requireAuth();
    const u = db.users.find((x) => x._id === uid);
    if (!u) { const e = new Error("Сесія невалідна"); e.status = 401; throw e; }
    return { id: u._id, username: u.username, email: u.email };
  }

  if (url === "/bazilka/posts") {
    return [...db.posts].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  if (url === "/notes") {
    const uid = requireAuth();
    return db.notes.filter((n) => n.userId === uid);
  }

  const e = new Error("Not Found"); e.status = 404; throw e;
}

async function handlePOST(url, body = {}) {
  const db = loadDB();

  
  if (url === "/auth/login") {
    const raw = String(body.email || "").trim().toLowerCase();
    const pass = String(body.password || "");
    const u =
      db.users.find((x) => String(x.email).toLowerCase().trim() === raw) ||
      db.users.find((x) => String(x.username).toLowerCase().trim() === raw);
    if (!u || u.password !== pass) { const e = new Error("Невірні дані"); e.status = 401; throw e; }
    localStorage.setItem(LS_TOKEN_KEY, u._id);
    return { token: u._id, user: { id: u._id, username: u.username, email: u.email } };
  }

  if (url === "/auth/register") {
    const email = String(body.email || "").toLowerCase().trim();
    const username = String(body.username || "").trim() || email.split("@")[0];
    const password = String(body.password || "");
    if (!email || !password) { const e = new Error("Email і пароль обовʼязкові"); e.status = 400; throw e; }
    if (db.users.some((x) => String(x.email).toLowerCase().trim() === email)) {
      const e = new Error("Email вже зайнятий"); e.status = 409; throw e;
    }
    const u = { _id: "u_" + id(), email, username, password };
    db.users.push(u); saveDB(db);
    localStorage.setItem(LS_TOKEN_KEY, u._id);
    return { token: u._id, user: { id: u._id, username: u.username, email: u.email } };
  }

  if (url === "/auth/logout") { localStorage.removeItem(LS_TOKEN_KEY); return { ok: true }; }

  
  if (url === "/bazilka/posts") {
    const uid = requireAuth();
    const text = String(body.text || "").trim();
    if (!text) { const e = new Error("Текст обовʼязковий"); e.status = 400; throw e; }
    const u = loadDB().users.find((x) => x._id === uid);
    const post = {
      _id: "p_" + id(),
      text,
      authorId: uid,
      authorName: u?.username || u?.email?.split("@")[0] || "Користувач",
      createdAt: nowISO(),
      comments: [],
      likedBy: [],
    };
    db.posts.unshift(post); saveDB(db); return post;
  }

  {
    const pid = match(url, "/bazilka/posts/:id/comments");
    if (pid) {
      const uid = requireAuth();
      const post = db.posts.find((p) => p._id === pid);
      if (!post) { const e = new Error("Пост не знайдено"); e.status = 404; throw e; }
      const u = db.users.find((x) => x._id === uid);
      const text = String(body.text || "").trim();
      if (!text) { const e = new Error("Порожній коментар"); e.status = 400; throw e; }
      post.comments.push({ _id: "c_" + id(), text, authorId: uid, authorName: u?.username || "Користувач", createdAt: nowISO() });
      saveDB(db); return post;
    }
  }

  {
    const pid = match(url, "/bazilka/posts/:id/like");
    if (pid) {
      const uid = requireAuth();
      const post = db.posts.find((p) => p._id === pid);
      if (!post) { const e = new Error("Пост не знайдено"); e.status = 404; throw e; }
      post.likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
      const i = post.likedBy.indexOf(uid);
      const liked = i === -1;
      if (liked) post.likedBy.push(uid); else post.likedBy.splice(i, 1);
      saveDB(db);
      return { liked, likes: post.likedBy.length };
    }
  }

  
  if (url === "/notes") {
    const uid = requireAuth();
    const note = { _id: "n_" + id(), userId: uid, text: String(body.text || "").trim(), createdAt: nowISO() };
    const db2 = loadDB(); db2.notes.push(note); saveDB(db2); return note;
  }

  const e = new Error("Not Found"); e.status = 404; throw e;
}

const mock = {
  interceptors: { response: { use: () => {} } },
  async get(url) {
    await sleep(200);
    try { const data = await handleGET(url); return { data, status: 200 }; }
    catch (err) { return Promise.reject({ message: err.message, response: { status: err.status || 500, data: { message: err.message } } }); }
  },
  async post(url, body) {
    await sleep(200);
    try { const data = await handlePOST(url, body); return { data, status: 200 }; }
    catch (err) { return Promise.reject({ message: err.message, response: { status: err.status || 500, data: { message: err.message } } }); }
  },
  put: async (url, body) => mock.post(url, body),
  delete: async (url) => mock.post(url, {}),
};

export default mock;
