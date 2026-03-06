// scenario1_auth.js
import { check, sleep } from 'k6';
import { login, logout } from './apis/auth.js';

export function scenario1_auth() {
  const loginRes = login('admin1', 'aitrics1!');
  const token = loginRes.json().data.accessToken;

  const logoutRes = logout(token);
  check(logoutRes, { 'logout ok': (r) => r.status === 200 });

  sleep(1);
}