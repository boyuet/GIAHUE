// Vercel Function: nhận file Word từ trình duyệt và chuyển sang Google Apps Script.
// Dùng chung 2 Environment Variables với /api/data:
//   APPS_SCRIPT_URL
//   PROQUIZ_SECRET

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const secret = process.env.PROQUIZ_SECRET;
  if (!scriptUrl || !secret) {
    return res.status(500).json({
      ok: false,
      error: 'Chưa cấu hình APPS_SCRIPT_URL hoặc PROQUIZ_SECRET trên Vercel.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const fileName = String(body.fileName || '').trim();
    const mimeType = String(body.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const base64 = String(body.base64 || '');

    if (!fileName || !base64) {
      return res.status(400).json({ ok: false, error: 'Thiếu tên file hoặc dữ liệu file.' });
    }

    const r = await fetch(scriptUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'uploadWord',
        secret,
        fileName,
        mimeType,
        base64
      })
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); }
    catch { throw new Error('Apps Script trả về dữ liệu không phải JSON: ' + text.slice(0, 200)); }

    return res.status(r.ok ? 200 : r.status).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}
