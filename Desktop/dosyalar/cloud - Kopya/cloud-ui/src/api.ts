const BASE_URL = window.location.origin;

export const api = {
  async get(endpoint: string, token?: string) {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['x-auth-token'] = token;
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
    return res.json();
  },

  async post(endpoint: string, body: any, token?: string) {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['x-auth-token'] = token;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async upload(endpoint: string, formData: FormData, token?: string) {
    const headers: any = {};
    if (token) headers['x-auth-token'] = token;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });
    return res.json();
  },

  async delete(endpoint: string, token?: string) {
    const headers: any = {};
    if (token) headers['x-auth-token'] = token;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers
    });
    return res.json();
  }
};
