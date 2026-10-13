// One helper used for every request to the backend.
// Example: api('/api/sessions/123/book', 'POST')
export async function api(url, method = 'GET', body) {
  const token = sessionStorage.getItem('token'); // saved at login

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }), // proves who we are
    },
    body: body && JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed'); // shown to the user in an alert
  return data;
}
