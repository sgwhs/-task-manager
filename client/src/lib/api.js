/**
 * 与后端 /api 通信的封装
 * 所有接口返回统一格式：{ success, data } 或 { success:false, error }
 */
const BASE = '/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    throw new Error('无法连接服务器，请确认后端已启动（npm start）');
  }

  let body = null;
  try {
    body = await res.json();
  } catch (err) {
    body = null;
  }

  if (!res.ok || !body || body.success === false) {
    throw new Error(body?.error || `请求失败（HTTP ${res.status}）`);
  }
  return body.data;
}

export const api = {
  health: () => request('/health'),
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    return request(`/tasks${qs ? `?${qs}` : ''}`);
  },
  create: (payload) =>
    request('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, patch) =>
    request(`/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
  remove: (id) =>
    request(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  clearCompleted: () => request('/tasks/completed', { method: 'DELETE' }),
};
