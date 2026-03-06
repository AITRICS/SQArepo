// main.js
import { login } from './apis/auth.js';
import { scenario1_auth } from './scenario1_auth.js';
import { scenario2_settings } from './scenario2_settings.js';

export const options = {
  scenarios: {
    auth_basic: {
      executor: 'constant-vus',
      exec: 'scenario1_auth',     // 첫 번째 시나리오
      vus: 2,
      duration: '20s',
    },
    settings_flow: {
      executor: 'constant-vus',
      exec: 'scenario2_settings', // 두 번째 시나리오
      vus: 3,
      duration: '20s',
      startTime: '5s',            // 5초 뒤에 시작 (선택)
    },
  },
};

// 공통 토큰 한 번만 만들기
export function setup() {
  const res = login('admin1', 'aitrics1!');
  const token = res.json().data.accessToken;
  return { token };
}

// k6가 찾을 수 있게 export
export { scenario1_auth, scenario2_settings };
