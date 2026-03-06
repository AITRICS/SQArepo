// scenario2_settings.js
import { check, sleep } from 'k6';
import { resetColumns, getHospitalInfo } from './apis/settings.js';

export function scenario2_settings(setupData) {
  const token = setupData.token; // setup에서 받은 공통 토큰 사용

  const r1 = resetColumns(token);
  check(r1, { 'reset 200': (r) => r.status === 200 });

  const r2 = getHospitalInfo(token);
  check(r2, { 'hospital 200': (r) => r.status === 200 });

  sleep(1);
}