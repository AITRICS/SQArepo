// main.js
import { login } from './auth.js';
import { scenario_columns } from './reset_columns.js';
import { scenario_hospital } from './get_hospitalInfo.js';

export const options = {
  scenarios: {
    columns_reset_scenario: {
      executor: 'constant-vus',
      exec: 'scenario_columns',
      vus: 5,
      duration: '30s',
    },
    hospital_info_scenario: {
      executor: 'constant-vus',
      exec: 'scenario_hospital',
      vus: 5,
      duration: '30s',
      startTime: '5s', // 필요하면 순차 실행처럼 보이게 조정
    },
  },
};

// 전체 테스트 시작 전에 한 번만 로그인
export function setup() {
  const token = login();
  return { token };
}

export { scenario_columns, scenario_hospital };
