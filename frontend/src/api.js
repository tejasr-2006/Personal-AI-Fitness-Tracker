export const api = async (path, method = "GET", body) => {
  const token = localStorage.getItem("token");
  const r = await fetch("/api" + path, { method, headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) }, body: body && JSON.stringify(body) });
  if (r.status === 401 && token) { localStorage.removeItem("token"); location.reload(); }
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(typeof e.detail === "string" ? e.detail : "Check the values you entered"); }
  return r.status === 204 ? null : r.json();
};
