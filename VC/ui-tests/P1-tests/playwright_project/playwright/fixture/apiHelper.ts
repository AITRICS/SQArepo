import { executeQuery } from './setDatabase.js';

export async function postRequest(url: string, data: any, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function getRequest(url: string) {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return response.json();
}

export async function deleteRequest(url: string, token: any) {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}


export async function createUser(user: { // 계정 생성
  username: string;
  password: string;
  name: string;
  phone: string;
  userType: string;
  userGroup: string;
}) {
  const url = `${process.env.API_BASE}${process.env.REGISTER_API}`;
  return await postRequest(url, user);
}

export async function deleteUser(username: string) { // 계정 삭제
  const token = await getAdminToken();
  const url = `${process.env.API_BASE}/users/${encodeURIComponent(username)}`;
  return await deleteRequest(url, token); 
}

export async function useTokenApi(url: string,data:any){
  const loginUrl = `${process.env.API_BASE}${process.env.LOGIN_API}`;
  const loginbody = {
      username: process.env.ADMINID,
      password: process.env.ADMINPW,
  };
  const response = await postRequest(loginUrl, loginbody);
  const token = response.data.accessToken; 
  
  await postRequest(url, data, token);
}

export async function resetDashboardSetting(username: string, password: string) { // 계정별 대시보드 설정 초기화
  // 중복 로그인 방지: accounts_token의 is_active를 0으로 설정하여 기존 세션 무효화
  const userRows = await executeQuery(
    `SELECT id FROM accounts_user WHERE username = '${username}' LIMIT 1;`
  );
  if (userRows.length > 0) {
    const userId = userRows[0].id;
    await executeQuery(
      `UPDATE accounts_token SET is_active = 0 WHERE user_id = ${userId};`
    );
    console.log(`ℹ️ [resetDashboardSetting] "${username}" 기존 세션 무효화 완료 (user_id: ${userId})`);
  }

  const loginUrl = `${process.env.API_BASE}${process.env.LOGIN_API}`;
  const res = await postRequest(loginUrl, { username, password });

  const token = res?.data?.accessToken;
  if (!token) {
    throw new Error(`[resetDashboardSetting] Login failed for "${username}". Response: ${JSON.stringify(res)}`);
  }

  const resetUrl = `${process.env.API_BASE}${process.env.DASHBOARD_RESET}`;
  const result = await postRequest(resetUrl, {}, token);

  // 리셋 후 로그아웃하여 다음 호출 시 중복 로그인 방지
  const logoutUrl = `${process.env.API_BASE}/auth/logout`;
  await postRequest(logoutUrl, { username }, token);

  return result;
}

export async function getAdminToken() { // admin 토근 발급
  const loginUrl = `${process.env.API_BASE}${process.env.LOGIN_API}`;
  const loginBody = {
    username: process.env.ADMINID,
    password: process.env.ADMINPW,
  };

  const res = await postRequest(loginUrl, loginBody);
  const token = res.data.accessToken;  
  return token;
}