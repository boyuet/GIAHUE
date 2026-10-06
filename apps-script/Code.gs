// Google Apps Script backend cho ProQuiz.
// - proquiz-data.json: dữ liệu bộ đề đã phân tích.
// - Word gốc/: lưu nguyên file .docx người dùng upload trên web.
//
// QUAN TRỌNG: GIỮ NGUYÊN SECRET mà bạn đang dùng thành công trên Vercel.
// Nếu secret hiện tại của bạn khác chuỗi dưới đây, hãy thay dòng này bằng secret đang chạy.

const SECRET = 'proquiz-thang-2026-abc123456789';
const FOLDER_NAME = 'ProQuiz';
const FILE_NAME = 'proquiz-data.json';
const WORD_FOLDER_NAME = 'Word gốc';

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

function getWordFolder() {
  const parent = getDataFolder();
  const folders = parent.getFoldersByName(WORD_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : parent.createFolder(WORD_FOLDER_NAME);
}

function getDataFile(createIfMissing) {
  const folder = getDataFolder();
  const files = folder.getFilesByName(FILE_NAME);
  if (files.hasNext()) return files.next();
  if (!createIfMissing) return null;
  return folder.createFile(FILE_NAME, '[]', MimeType.PLAIN_TEXT);
}

function safeFileName(name) {
  const cleaned = String(name || 'tai-lieu.docx')
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim();
  return cleaned || 'tai-lieu.docx';
}

function uploadWordFile(body) {
  const fileName = safeFileName(body.fileName);
  const mimeType = body.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const base64 = String(body.base64 || '');
  if (!base64) throw new Error('Không có dữ liệu file Word.');

  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const folder = getWordFolder();
  const file = folder.createFile(blob);

  return {
    ok: true,
    fileId: file.getId(),
    fileName: file.getName(),
    fileUrl: file.getUrl(),
    folderId: folder.getId(),
    folderUrl: 'https://drive.google.com/drive/folders/' + folder.getId(),
    uploadedAt: new Date().toISOString()
  };
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
    lock.waitLock(30000);
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!checkSecret(body.secret)) return jsonResponse({ ok: false, error: 'Unauthorized' });

    if (body.action === 'uploadWord') {
      return jsonResponse(uploadWordFile(body));
    }

    if (body.action === 'save') {
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
    }

    return jsonResponse({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}
