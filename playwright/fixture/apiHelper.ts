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

export async function useTokenApi(url: string,data:any){
  const loginUrl = `${process.env.API_BASE}${process.env.LOGIN_API}`;
  const loginbody = {
      username: process.env.ADMINID,
      password: process.env.ADMINPW,
  };
  const response = await postRequest(loginUrl,loginbody);
  const token = response.data.accessToken; 
  
  await postRequest(url, data, token);
}