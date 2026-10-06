PROQUIZ + VERCEL + GOOGLE DRIVE

Mục đích
- index.html: giao diện ProQuiz.
- api/data.js: API trên Vercel, giữ bí mật không lộ ra trình duyệt.
- apps-script/Code.gs: backend Google Apps Script, lưu dữ liệu vào Google Drive.
- Dữ liệu thật nằm trong Google Drive/ProQuiz/proquiz-data.json.

CÀI 1 LẦN

1) Tạo Apps Script
- Vào https://script.google.com/create
- Xóa code mặc định và dán toàn bộ apps-script/Code.gs.
- Đổi SECRET thành một chuỗi bí mật dài. Ví dụ tự tạo khoảng 30-50 ký tự.
- Save.

2) Deploy Apps Script thành Web App
- Deploy > New deployment > Web app.
- Execute as: Me.
- Who has access: Anyone.
- Deploy và cấp quyền Google Drive.
- Copy URL kết thúc bằng /exec.

3) Đẩy thư mục này lên Vercel
Có thể đưa nguyên thư mục lên GitHub rồi Import Project vào Vercel.

4) Trong Vercel > Project > Settings > Environment Variables thêm:
- APPS_SCRIPT_URL = URL /exec ở bước 2
- PROQUIZ_SECRET = đúng SECRET trong Code.gs
Sau đó Redeploy.

CÁCH HOẠT ĐỘNG
- Mở web: tải proquiz-data.json từ Drive.
- Upload Word / thêm / sửa / xóa bộ đề: tự lưu lên Drive sau khoảng 0,5 giây.
- Máy khác mở cùng URL Vercel: thấy cùng bộ đề.
- localStorage chỉ là cache dự phòng khi mạng lỗi, không phải nguồn dữ liệu chính.

LƯU Ý
- Không đưa PROQUIZ_SECRET vào index.html. Nó chỉ nằm ở Vercel Environment Variables và Code.gs.
- Nếu đổi Code.gs sau khi đã deploy, tạo version/deployment mới hoặc cập nhật deployment đang dùng.
- Nếu nhiều người cùng sửa đúng một lúc, bản lưu sau cùng sẽ thắng (last write wins).
