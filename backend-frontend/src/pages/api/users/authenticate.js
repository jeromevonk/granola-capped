const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

import { apiHandler, usersRepo } from 'src/helpers/api';

export default apiHandler({
  post: authenticate
});

// ----------------------------------------------------------------------
// Best-effort in-memory rate limit: block an IP after MAX_FAILURES failed
// logins within WINDOW_MS. Kept on globalThis so dev-mode module reloads
// don't reset it. Note: state is per server instance, so on serverless
// hosting this only limits per warm instance — acceptable for this scale.
// ----------------------------------------------------------------------
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const loginFailures = globalThis.__loginFailures ?? (globalThis.__loginFailures = new Map());

function getClientKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return (forwarded ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress) || 'unknown';
}

function isRateLimited(key) {
  const entry = loginFailures.get(key);
  if (!entry) return false;

  if (Date.now() - entry.firstFailure > WINDOW_MS) {
    loginFailures.delete(key);
    return false;
  }

  return entry.count >= MAX_FAILURES;
}

function recordFailure(key) {
  const entry = loginFailures.get(key);
  if (!entry || Date.now() - entry.firstFailure > WINDOW_MS) {
    loginFailures.set(key, { firstFailure: Date.now(), count: 1 });
  } else {
    entry.count += 1;
  }
}

async function authenticate(req, res) {
  const clientKey = getClientKey(req);
  if (isRateLimited(clientKey)) {
    return res.status(429).json({ message: 'Too many failed login attempts. Try again in 15 minutes.' });
  }

  const { username, password } = req.body;
  const user = await usersRepo.findUser(username);

  // validate
  if (!(user && bcrypt.compareSync(password, user.hash))) {
    recordFailure(clientKey);
    return res.status(400).json({ message: 'Username or password is incorrect' });
  }

  loginFailures.delete(clientKey);

  // create a jwt token that is valid for 28 days
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '100d' });

  // return basic user details and token
  return res.status(200).json({
    id: user.id,
    username: user.username,
    token
  });
}
