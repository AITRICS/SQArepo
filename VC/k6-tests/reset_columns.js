// reset_columns.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export function scenario_columns(setupData) {
  const token = setupData.token;

  const res = http.post(
    'http://192.168.1.211:8080/api/v1/settings/columns/reset',
    JSON.stringify({}),
    {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  check(res, {
    'columns reset status 200': (r) => r.status === 200,
  });

  sleep(1);
}
