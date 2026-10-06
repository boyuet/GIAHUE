PROQUIZ V2 — VERCEL + GOOGLE DRIVE + TỰ LƯU FILE WORD GỐC
===========================================================

Bản này có 2 luồng lưu đồng thời khi người dùng upload Word trên web:

1) Word được Mammoth đọc thành câu hỏi/đáp án và lưu vào:
   Google Drive / ProQuiz / proquiz-data.json

2) Chính file .docx gốc cũng được lưu vào:
   Google Drive / ProQuiz / Word gốc / <tên-file>.docx

CÁC FILE CẦN ĐƯA LÊN GITHUB
----------------------------
- index.html                 (đã sửa)
- api/data.js                (giữ chức năng JSON)
- api/upload.js              (MỚI: nhận file Word và chuyển sang Drive)
- vercel.json

KHÔNG cần đưa apps-script/Code.gs lên Vercel để nó chạy.
File Code.gs là code bạn phải cập nhật trong Google Apps Script.

BƯỚC 1 — CẬP NHẬT GOOGLE APPS SCRIPT
-------------------------------------
1. Mở project Apps Script đang kết nối thành công với ProQuiz.
2. Giữ nguyên SECRET đang dùng. Nếu bạn dùng:
      proquiz-thang-2026-abc123456789
   thì Code.gs trong gói này đã đặt đúng chuỗi đó.
3. Thay toàn bộ Code.gs bằng file apps-script/Code.gs trong gói này.
4. Ctrl+S.
5. Triển khai > Quản lý các tùy chọn triển khai.
6. Bấm bút chì ở Web app hiện tại.
7. Chọn Phiên bản mới.
8. Triển khai.

KHÔNG tạo URL Apps Script mới nếu không cần. URL /exec cũ có thể tiếp tục dùng khi bạn
cập nhật deployment hiện tại.

BƯỚC 2 — CẬP NHẬT GITHUB
-------------------------
Upload/replace các file:
- index.html
- api/data.js
- api/upload.js
- vercel.json

Giữ nguyên cấu trúc thư mục api/.

BƯỚC 3 — VERCEL
----------------
Hai Environment Variables cũ vẫn dùng nguyên:
- APPS_SCRIPT_URL
- PROQUIZ_SECRET

Không cần tạo biến mới.

Nếu GitHub đã nối Vercel, push lên GitHub sẽ tự deploy. Nếu chưa, Redeploy thủ công.

BƯỚC 4 — KIỂM TRA
-----------------
1. Mở web Vercel.
2. Upload 1 file .docx nhỏ.
3. Bộ đề phải xuất hiện trên web.
4. Vào Google Drive:
      ProQuiz/
        proquiz-data.json
        Word gốc/
          <file vừa upload>.docx

Trong proquiz-data.json, bộ đề cũng có thêm:
- sourceFileName
- sourceDriveFileId
- sourceDriveFileUrl

LƯU Ý KÍCH THƯỚC
----------------
Bản proxy hiện tại giới hạn file Word khoảng 3 MB để tránh vượt giới hạn request khi
đóng file thành base64. Nếu Word có nhiều ảnh và lớn hơn 3 MB, bộ đề vẫn có thể được
đọc trên web nhưng file gốc sẽ không tự upload qua API này. Nếu bạn cần file lớn hơn,
có thể nâng cấp sang cơ chế upload trực tiếp/chunk sau.
