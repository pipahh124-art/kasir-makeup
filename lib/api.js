export async function api(url, body, method) {
  const r = await fetch(url, {
    method: method || (body ? 'POST' : 'GET'),
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(d?.error || 'Terjadi kesalahan');
  return d;
}
export const rp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
export function resizeImage(file, max = 400) {
  return new Promise((ok, no) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = img.width * s; c.height = img.height * s;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      ok(c.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = no;
    img.src = URL.createObjectURL(file);
  });
}