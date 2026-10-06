// Vercel Function: cầu nối giữa trình duyệt và Google Apps Script.
// Thiết lập 2 Environment Variables trên Vercel:
//   APPS_SCRIPT_URL = URL /exec của Apps Script Web App
//   PROQUIZ_SECRET  = chuỗi bí mật giống trong Code.gs

export default async function handler(req, res) {
  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const secret = process.env.PROQUIZ_SECRET;

  if (!scriptUrl || !secret) {
    return res.status(500).json({
      ok: false,
      error: 'Chưa cấu hình APPS_SCRIPT_URL hoặc PROQUIZ_SECRET trên Vercel.'
    });
  }

  try {
    if (req.method === 'GET') {
      const url = new URL(scriptUrl);
      url.searchParams.set('action', 'load');
      url.searchParams.set('secret', secret);

      const r = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store'
      });
      const text = await r.text();
      let data;
      try { data = JSON.parse(text); }
      catch { throw new Error('Apps Script trả về dữ liệu không phải JSON: ' + text.slice(0, 200)); }

      return res.status(r.ok ? 200 : r.status).json(data);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const r = await fetch(scriptUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'save',
          secret,
          data: Array.isArray(body.data) ? body.data : []
        })
      });
      const text = await r.text();
      let data;
      try { data = JSON.parse(text); }
      catch { throw new Error('Apps Script trả về dữ liệu không phải JSON: ' + text.slice(0, 200)); }

      return res.status(r.ok ? 200 : r.status).json(data);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}
