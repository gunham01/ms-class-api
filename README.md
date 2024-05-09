# Nam21-22HK2-TTCN-01-Uyen-Nam-Toan

### Đề tài nghiên cứu khoa học 2022 - 2023

Đề tài: <b>Xây dựng phần mềm tự động tạo nhóm lớp học trong MS Teams</b>

Thành viên nhóm:

- Vũ Thị Uyên, K63CNPM
- Nguyễn Hoàng Nam, K63CNPM
- Đỗ Tiến Toàn, K63CNPM

## Yêu cầu

- Đã cài đặt NodeJS (npm được cài cùng NodeJS)

## Cài đặt

### 1. Cài đặt các thư viện cần thiết _("install" có thể viết tắt thành "i")_

`cd` tới thư mục của dự án ròi chạy lệnh sau

```bash
npm install
```

### 2. Tạo file cấu hình môi trường `.env`

Nếu chưa có file `.env` thì tạo file `.env`, rồi copy nội dung của file `env.example`

Để tạo secret cho access token và refresh token, đầu tiên, chạy lệnh sau để có thể code NodeJS trên terminal

```bash
node
```

Rồi sau đấy chạy lần lượt các dòng lệnh sau

```js
const crypto = require('crypto');
crypto.randomBytes(64).toString('hex'); // secret của access token
crypto.randomBytes(64).toString('hex'); // secret của refresh token
```

Hai token được sinh ra sẽ là secret của access token của refresh token (thứ tự không quan trọng). Cuối cùng, điền hai token này vào `JWT_ACCESS_TOKEN_SECRET` và `JWT_REFRESH_TOKEN_SECRET` trong file `.env`

Các trường còn lại trong `.env` được điền như bình thường

### 3. Sửa thiết lập CSDL trong file `.env`

```bash
DB_HOST = <DB_HOST>
DB_NAME = <DB_NAME>
DB_USER = <DB_USER>
DB_PASSWORD = <DB_PASSWORD>
DATABASE_URL = <DB_URL>
```

### 4. Tạo bảng trong CSDL

Nếu CSDL chưa có bảng thì chạy lệnh sau để tạo bảng, khoá chính, khoá ngoại,... ở CSDL đã được thiết lập trong `.env`

```bash
npx prisma db push
```

### 5. Chạy chương trình

```bash
npm start
```
