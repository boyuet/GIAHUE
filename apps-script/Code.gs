// Google Apps Script backend cho ProQuiz.
// Dữ liệu được lưu thành file proquiz-data.json trong thư mục ProQuiz trên Google Drive.
// QUAN TRỌNG: thay SECRET bên dưới bằng một chuỗi dài, khó đoán,
// rồi dùng chính chuỗi đó làm PROQUIZ_SECRET trên Vercel.

const SECRET = 'THAY_BANG_CHUOI_BI_MAT_DAI_VA_KHO_DOAN';
const FOLDER_NAME = 'ProQuiz';
const FILE_NAME = 'proquiz-data.json';

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkSecret(value) {
  return typeof value === 'string' && value === SECRET;
}

function getDataFolder() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);
}

function getDataFile(createIfMissing) {
  const folder = getDataFolder();
  const files = folder.getFilesByName(FILE_NAME);
  if (files.hasNext()) return files.next();
  if (!createIfMissing) return null;
  return folder.createFile(FILE_NAME, '[]', MimeType.PLAIN_TEXT);
}

function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    if (!checkSecret(p.secret)) return jsonResponse({ ok: false, error: 'Unauthorized' });
    if ((p.action || 'load') !== 'load') return jsonResponse({ ok: false, error: 'Unknown action' });

    const file = getDataFile(true);
    const text = file.getBlob().getDataAsString('UTF-8') || '[]';
    let data = [];
    try {
      const parsed = JSON.parse(text);
      data = Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      data = [];
    }

    return jsonResponse({
      ok: true,
      data,
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      updatedAt: file.getLastUpdated().toISOString()
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!checkSecret(body.secret)) return jsonResponse({ ok: false, error: 'Unauthorized' });
    if (body.action !== 'save') return jsonResponse({ ok: false, error: 'Unknown action' });

    const data = Array.isArray(body.data) ? body.data : [];
    const file = getDataFile(true);
    file.setContent(JSON.stringify(data));

    return jsonResponse({
      ok: true,
      count: data.length,
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      savedAt: new Date().toISOString()
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}
