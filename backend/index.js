const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { setupDatabase, getPool } = require('./db');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const COOKIE_NAME = 'authToken';

const allowedOrigins = [
  FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

async function authenticate(req, res, next) {
  try {
    console.log('[Auth Middleware] Cookies received:', req.cookies);
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT token_id FROM bankuserjwt WHERE token_value = ? AND expiry > NOW()',
      [token]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Session expired' });
    }

    req.user = {
      customerId: decoded.customerId,
      username: decoded.username,
    };

    return next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Auth error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

app.post('/signup', async (req, res) => {
  try {
    const { username, email, phone, password, confirmPassword } = req.body || {};

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const pool = getPool();

    const passwordHash = await bcrypt.hash(password, 10);
    const accountNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();

    try {
      await pool.query(
        'INSERT INTO bankuser (username, email, phone, password_hash, balance, account_number) VALUES (?, ?, ?, ?, 0.00, ?)',
        [username, email, phone || null, passwordHash, accountNumber]
      );
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res
          .status(409)
          .json({ message: 'Email already exists' });
      }
      throw err;
    }

    return res.json({ message: 'Signup successful' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Signup error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const pool = getPool();
    const [users] = await pool.query(
      'SELECT customer_id, username, password_hash FROM bankuser WHERE email = ?',
      [email]
    );

    if (!users.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokenPayload = {
      customerId: user.customer_id,
      username: user.username,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO bankuserjwt (token_value, customer_id, expiry) VALUES (?, ?, ?)',
      [token, user.customer_id, expiryDate]
    );

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
      expires: expiryDate,
    };

    res.cookie(COOKIE_NAME, token, cookieOptions);

    return res.json({ message: 'Login successful' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/me', authenticate, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT customer_id, username, email, account_number, balance, created_at FROM bankuser WHERE customer_id = ?',
      [req.user.customerId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    return res.json({
      id: user.customer_id,
      username: user.username,
      email: user.email,
      account_number: user.account_number,
      balance: user.balance,
      created_at: user.created_at,
      ifsc: 'MONY0001234'
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Me error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/balance', authenticate, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT balance FROM bankuser WHERE customer_id = ?',
      [req.user.customerId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ balance: rows[0].balance });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Balance error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/deposit', authenticate, async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount <= 0 || amount > 1000000) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }

    const pool = getPool();
    // Use transaction
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      await conn.query('UPDATE bankuser SET balance = balance + ? WHERE customer_id = ?', [amount, req.user.customerId]);
      await conn.query(
        'INSERT INTO banktransaction (customer_id, type, amount, description) VALUES (?, ?, ?, ?)',
        [req.user.customerId, 'Deposit', amount, description || 'Cash deposit']
      );
      await conn.commit();
      res.json({ message: 'Deposit successful' });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Deposit error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/withdraw', authenticate, async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount <= 0 || amount > 100000) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      const [rows] = await conn.query('SELECT balance FROM bankuser WHERE customer_id = ? FOR UPDATE', [req.user.customerId]);
      if (rows[0].balance < amount) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: 'Insufficient funds' });
      }

      await conn.query('UPDATE bankuser SET balance = balance - ? WHERE customer_id = ?', [amount, req.user.customerId]);
      await conn.query(
        'INSERT INTO banktransaction (customer_id, type, amount, description) VALUES (?, ?, ?, ?)',
        [req.user.customerId, 'Withdrawal', amount, description || 'ATM withdrawal']
      );
      await conn.commit();
      res.json({ message: 'Withdrawal successful' });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Withdraw error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/transactions', authenticate, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, type, amount, description, status, created_at FROM banktransaction WHERE customer_id = ? ORDER BY created_at DESC',
      [req.user.customerId]
    );

    return res.json({ transactions: rows });
  } catch (err) {
    console.error('Transactions error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/transfer', authenticate, (req, res) => {
  return res
    .status(503)
    .json({ message: 'Transfer feature under development' });
});

app.post('/logout', authenticate, async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];

    const pool = getPool();
    await pool.query('DELETE FROM bankuserjwt WHERE token_value = ?', [token]);

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
    };

    res.clearCookie(COOKIE_NAME, cookieOptions);

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Logout error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

async function start() {
  try {
    await setupDatabase();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

