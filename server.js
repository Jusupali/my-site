const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err.message);
    process.exit(1);
  }
});

function hashPassword(password) {
  return crypto.createHash('sha256').update(password.toString()).digest('hex');
}

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getTokenFromHeader(req) {
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
}

function simpleBotReply(message) {
  const m = (message || '').toLowerCase();
  if (!m) return 'Пожалуйста, задайте вопрос.';
  if (m.includes('продаж') || m.includes('цена') || m.includes('сколько')) {
    return 'Цены указаны в карточке автомобиля. Хотите, я помогу рассчитать кредит для выбранной модели?';
  }
  if (m.includes('кредит') || m.includes('рассроч')) {
    return 'Кредит: 3–10 лет; Рассрочка: 1–3 года. Откройте карточку модели для расчёта.';
  }
  if (m.includes('привет') || m.includes('здравств')) return 'Привет! Я бот поддержки. Чем помогу?';
  if (m.includes('контакт') || m.includes('телефон')) return 'Номера: +7 (777) 456-98-12 и +7 (701) 123-45-67.';
  if (m.includes('адрес') || m.includes('где')) return 'Наш офис: ул. Абая, 125, Алматы. Могу открыть карту.';
  if (m.length < 6) return 'Опишите, пожалуйста, подробнее.';
  return 'Спасибо! Наш сотрудник свяжется с вами в ближайшее время.';
}

function authenticate(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'No auth token provided.' });
  }

  const now = Date.now();
  db.get(
    `SELECT sessions.user_id, users.username
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = ? AND sessions.expires_at > ?`,
    [token, now],
    (err, row) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error.' });
      }
      if (!row) {
        return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
      }
      req.user = {
        id: row.user_id,
        username: row.username,
      };
      next();
    }
  );
}

app.use(express.json());
app.use(require('cors')());
app.use(express.static(path.join(__dirname)));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS wishlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    car_title TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );`);
});

app.get('/api/status', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing username or password.' });
  }

  const hashedPassword = hashPassword(password);
  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ success: false, message: 'User already exists.' });
        }
        return res.status(500).json({ success: false, message: 'Registration failed.' });
      }

      const userId = this.lastID;
      const token = createToken();
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

      db.run(
        'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
        [token, userId, expiresAt],
        (sessionErr) => {
          if (sessionErr) {
            return res.status(500).json({ success: false, message: 'Session creation failed.' });
          }
          res.json({ success: true, username, token });
        }
      );
    }
  );
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing username or password.' });
  }

  const hashedPassword = hashPassword(password);
  db.get(
    'SELECT id FROM users WHERE username = ? AND password = ?',
    [username, hashedPassword],
    (err, row) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Login failed.' });
      }
      if (!row) {
        return res.status(401).json({ success: false, message: 'Invalid username or password.' });
      }

      const token = createToken();
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      db.run(
        'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
        [token, row.id, expiresAt],
        (sessionErr) => {
          if (sessionErr) {
            return res.status(500).json({ success: false, message: 'Session creation failed.' });
          }
          res.json({ success: true, username, token });
        }
      );
    }
  );
});

app.post('/api/logout', authenticate, (req, res) => {
  const token = getTokenFromHeader(req);
  db.run('DELETE FROM sessions WHERE token = ?', [token], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed.' });
    }
    res.json({ success: true });
  });
});

app.get('/api/user', authenticate, (req, res) => {
  res.json({ success: true, loggedIn: true, username: req.user.username });
});

app.get('/api/wishlist', authenticate, (req, res) => {
  db.all(
    'SELECT car_title FROM wishlists WHERE user_id = ?',
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Could not load wishlist.' });
      }
      res.json({ success: true, wishlist: rows.map((row) => row.car_title) });
    }
  );
});

app.post('/api/wishlist', authenticate, (req, res) => {
  const wishlist = Array.isArray(req.body.wishlist) ? req.body.wishlist : [];
  db.serialize(() => {
    db.run('DELETE FROM wishlists WHERE user_id = ?', [req.user.id], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Could not update wishlist.' });
      }
      const stmt = db.prepare('INSERT INTO wishlists (user_id, car_title) VALUES (?, ?)');
      wishlist.forEach((title) => {
        stmt.run(req.user.id, title);
      });
      stmt.finalize((finalizeErr) => {
        if (finalizeErr) {
          return res.status(500).json({ success: false, message: 'Could not save wishlist.' });
        }
        res.json({ success: true });
      });
    });
  });
});

app.post('/api/chat', (req, res) => {
  const message = String(req.body.message || '');
  res.json({ reply: simpleBotReply(message) });
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
