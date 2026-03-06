// auth.js
import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://192.168.1.211:8080';

function authHeaders(token) {
  return token
    ? {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : {
        accept: 'application/json',
        'content-type': 'application/json',
      };
}

// 일반 유저 로그인
export function login(username, password) {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ username, password }),
    { headers: authHeaders() }
  );

  check(res, { 'login 200': (r) => r.status === 200 });
  return res;
}

// 로그아웃
export function logout(token) {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/logout`,
    JSON.stringify({}),
    { headers: authHeaders(token) }
  );

  check(res, { 'logout 200': (r) => r.status === 200 });
  return res;
}

// 강제 로그아웃
export function forceLogout(token, userId) {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/logout/force`,
    JSON.stringify({ userId }), // 스펙에 맞게 수정
    { headers: authHeaders(token) }
  );

  check(res, { 'force logout 200': (r) => r.status === 200 });
  return res;
}

// 계정 만들기
export function register(userBody) {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/register`,
    JSON.stringify(userBody),
    { headers: authHeaders() }
  );

  check(res, { 'register 201/200': (r) => r.status === 200 || r.status === 201 });
  return res;
}

// admin 로그인
export function adminLogin(username, password) {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/login/admin`,
    JSON.stringify({ username, password }),
    { headers: authHeaders() }
  );

  check(res, { 'admin login 200': (r) => r.status === 200 });
  return res;
}

// admin 로그아웃
export function adminLogout(token) {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/logout/admin`,
    JSON.stringify({}),
    { headers: authHeaders(token) }
  );

  check(res, { 'admin logout 200': (r) => r.status === 200 });
  return res;
}