// auth.js
import http from 'k6/http';

export function login() {
  const res = http.post(
    'http://192.168.1.211:8080/api/v1/auth/login',
    JSON.stringify({ username: 'admin1', password: 'aitrics1!' }),
    {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
    }
  );

  if (res.status !== 200) {
    throw new Error(`Login failed: ${res.status} ${res.body}`);
  }

  const body = res.json();
  return body.data.accessToken; // 응답 구조에 맞게
}
