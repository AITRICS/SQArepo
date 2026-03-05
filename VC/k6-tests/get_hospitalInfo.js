// get_hospitalInfo.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export function scenario_hospital(setupData) {
  const token = setupData.token;

  const res = http.get(
    'http://192.168.1.211:8080/api/v1/settings/hospital',
    {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  check(res, {
    'hospital info status 200': (r) => r.status === 200,
  });

  sleep(1);
}
