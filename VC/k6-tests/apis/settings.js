// apis/settings.js
import http from 'k6/http';

const BASE_URL = __ENV.BASE_URL || 'http://192.168.1.211:8080';

export function resetColumns(token) {
  return http.post(
    `${BASE_URL}/api/v1/settings/columns/reset`,
    JSON.stringify({}),
    {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function getHospitalInfo(token) {
  return http.get(
    `${BASE_URL}/api/v1/settings/hospital`,
    {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
