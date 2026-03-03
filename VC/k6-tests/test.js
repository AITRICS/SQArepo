import { sleep, group, check } from 'k6';
import http from 'k6/http';
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js';

export const options = {
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      stages: [
        { target: 10, duration: '30s' }, // 1분 동안 10명의 가상 사용자로 증가
        { target: 10, duration: '1m' }, // 1분 동안 10명의 가상 사용자 유지
        { target: 0,  duration: '30s' }, // 1분 동안 0명의 가상 사용자로 감소
      ],
      exec: 'scenario_1',   // 아래 함수 이름과 일치해야 함
    },
  },
};

// 실행 대상 함수 (반드시 export)
export function scenario_1() {
  let response;
  const vars = {};

  group('page_1 - https://192.168.1.211/', function () {
    response = http.post(
      'http://192.168.1.211:8080/api/v1/auth/login',
      JSON.stringify({ username: 'admin1', password: 'aitrics1!' }),
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
      }
    );

    check(response, {
      'is status 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (response.status === 200) {
      vars.access_token1 = jsonpath.query(response.json(), '$.data.access_token')[0];
    } else {
      console.error(`Login failed : ${response.status} ${response.body}`);
    }
  });

  sleep(1);
}
