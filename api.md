# Reseller Integration API Specification (CloneV7 Protocol)

Tài liệu này cung cấp đặc tả kỹ thuật chi tiết toàn bộ hệ thống API Reseller (chuẩn tích hợp CloneV7) dành cho các bên kết nối (Resellers/Khách sỉ). Tài liệu này được biên soạn đầy đủ cấu trúc dữ liệu, tham số, logic phản hồi và các ràng buộc hệ thống để làm tài liệu tham khảo chính thức hoặc làm prompt cho AI Content Writer viết tài liệu hướng dẫn sử dụng (User Guide / Documentation).

---

## 1. TỔNG QUAN & PHƯƠNG THỨC HOẠT ĐỘNG
Hệ thống API hỗ trợ các đại lý, website con (resellers) kết nối trực tiếp đến MMO Store để đồng bộ sản phẩm, truy vấn thông tin tài khoản, đặt hàng tự động và kiểm tra trạng thái đơn hàng.

### Cấu hình Định tuyến (Routing & Legacy Rewrite)
Để tương thích với các mã nguồn website đại lý thế hệ cũ (thường gọi API dạng `.php`) và các hệ thống chuẩn REST hiện đại, hệ thống hỗ trợ cả 2 định dạng đường dẫn (được cấu hình rewrite tự động):

| Chức năng | Đường dẫn Legacy (PHP) | Đường dẫn chuẩn REST v1 | Method hỗ trợ |
| :--- | :--- | :--- | :--- |
| **Thông tin tài khoản** | `/api/profile.php` | `/api/v1/profile` | `GET`, `POST` |
| **Danh sách sản phẩm** | `/api/products.php` | `/api/v1/products` | `GET`, `POST` |
| **Chi tiết sản phẩm** | `/api/product.php` | `/api/v1/product` | `GET`, `POST` |
| **Mua tài khoản** | `/api/buy_product` | `/api/v1/buy_product` | `GET`, `POST` |
| **Kiểm tra đơn hàng** | `/api/order.php` | `/api/v1/order` | `GET`, `POST` |

* **Base URL:** `https://your-domain.com` (Thay thế bằng tên miền chạy thực tế của bạn).
* **Định dạng dữ liệu trả về:** Luôn luôn là JSON (`Content-Type: application/json; charset=utf-8`).

---

## 2. PHƯƠNG THỨC XÁC THỰC (AUTHENTICATION)
Tất cả các API yêu cầu xác thực người dùng thông qua tham số khóa API (`api_key` hoặc `key`).
* Khóa API có thể được gửi qua **Query String** (trên URL) hoặc nằm trong **Request Body** (JSON hoặc Form Data).
* **Quy chuẩn tìm khóa:** Hệ thống sẽ tìm theo thứ tự ưu tiên: `api_key` trước, nếu không có sẽ tìm `key`.
* **Trường hợp lỗi xác thực:**
  - Nếu thiếu tham số key: Trả về trạng thái lỗi `Thiếu api_key`.
  - Nếu key sai/không tồn tại: Trả về trạng thái lỗi `API Key không hợp lệ`.

---

## 3. CHI TIẾT CÁC ENDPOINT & FORMAT DỮ LIỆU

### 3.1. Truy vấn Thông tin Tài khoản (Profile)
Lấy thông tin số dư và thông tin cơ bản của đại lý liên kết với khóa API.

* **Endpoints:** `/api/profile.php` hoặc `/api/v1/profile`
* **Method:** `GET` hoặc `POST`
* **Tham số đầu vào (Params):**
  - `api_key` (hoặc `key`): Chuỗi ký tự (String) - Bắt buộc.

* **Phản hồi thành công (JSON Response):**
  ```json
  {
    "status": "success",
    "msg": "Lấy thông tin thành công!",
    "username": "reseller_username",
    "balance": 1500000,
    "discount": 5
  }
  ```
  *Chi tiết các Key:*
  - `status` (string): Trạng thái phản hồi (`"success"`).
  - `msg` (string): Thông điệp phản hồi từ hệ thống.
  - `username` (string): Tên đăng nhập của tài khoản đại lý.
  - `balance` (number): Số dư tài khoản hiện tại (Đơn vị: VNĐ).
  - `discount` (number): Tỷ lệ phần trăm chiết khấu riêng dành cho tài khoản này (Ví dụ: `5` đại diện cho giảm giá `5%`).

* **Phản hồi lỗi (Ví dụ: Key không hợp lệ):**
  ```json
  {
    "status": "error",
    "msg": "API Key không hợp lệ"
  }
  ```

---

### 3.2. Lấy Danh sách Sản phẩm Phân cấp (Products)
Lấy danh sách toàn bộ các sản phẩm đang được bán trên hệ thống. Dữ liệu được cấu trúc phân cấp dạng cây: Platform -> Category -> Product.

* **Endpoints:** `/api/products.php` hoặc `/api/v1/products`
* **Method:** `GET` hoặc `POST`
* **Tham số đầu vào (Params):**
  - `api_key` (hoặc `key`): Chuỗi ký tự (String) - Bắt buộc.

* **Logic Nghiệp vụ & Ràng buộc:**
  - Sản phẩm tự chọn (`selling_method` = `"self-selected"`) sẽ bị **ẩn hoàn toàn**, không hiển thị qua API. Chỉ trả về sản phẩm bán ngẫu nhiên (`selling_method` = `"random"`).
  - Giá sản phẩm trả về đã tự động áp dụng chiết khấu đặc quyền của tài khoản (Ví dụ: Sản phẩm gốc giá 10,000 VNĐ, tài khoản có `discount: 10%`, giá trả về sẽ là `9000`).
  - Giá trả về ở định dạng **Chuỗi ký tự (String)** để tương thích với chuẩn CloneV7 legacy.

* **Phản hồi thành công (JSON Response):**
  ```json
  {
    "status": "success",
    "msg": "Lấy dữ liệu thành công!",
    "categories": [
      {
        "id": "1",
        "parent_id": 0,
        "name": "FACEBOOK",
        "icon": "https://your-domain.com/assets/images/fb.jpg",
        "products": []
      },
      {
        "id": "9",
        "parent_id": 1,
        "name": "CLONE US",
        "icon": "https://your-domain.com/assets/images/us.jpg",
        "products": [
          {
            "id": "46",
            "name": "Clone USA Trust - Reg IP USA - Thích hợp chạy ads",
            "price": "6000",
            "amount": 3966,
            "description": "Mua test 1-2 acc trước khi mua số lượng lớn.",
            "flag": null,
            "min": "1",
            "max": "1000000"
          }
        ]
      }
    ]
  }
  ```
  *Chi tiết các Key:*
  - `categories` (array): Danh sách các nhóm.
    - Cấp Platform: `parent_id` bằng `0` (không chứa products trực tiếp).
    - Cấp Category con: `parent_id` tham chiếu đến `id` của Platform cha tương ứng.
  - `products` (array): Danh sách các sản phẩm thuộc Category con đó.
    - `id` (string): Mã ID của sản phẩm (sử dụng mã số hệ thống `productNumericalId` làm ID).
    - `name` (string): Tên sản phẩm.
    - `price` (string): Đơn giá của sản phẩm sau chiết khấu (định dạng string).
    - `amount` (number): Số lượng tài khoản hiện có trong kho (tồn kho khả dụng).
    - `description` (string): Mô tả ngắn của sản phẩm.
    - `flag` (null / string): Cờ hiển thị (nếu có).
    - `min` (string): Số lượng mua tối thiểu cho mỗi đơn hàng.
    - `max` (string): Số lượng mua tối đa cho mỗi đơn hàng.

---

### 3.3. Xem Chi tiết Một Sản phẩm (Product Detail)
Lấy thông tin cấu hình chi tiết của một sản phẩm duy nhất thông qua ID sản phẩm.

* **Endpoints:** `/api/product.php` hoặc `/api/v1/product`
* **Method:** `GET` hoặc `POST`
* **Tham số đầu vào (Params):**
  - `api_key` (hoặc `key`): Bắt buộc.
  - `product` (hoặc `id`): Chuỗi ký tự (String) - Bắt buộc. Nhận diện cả mã số ID sản phẩm dạng số (`productNumericalId`) và mã chuỗi định danh UUID của sản phẩm.

* **Logic Nghiệp vụ & Ràng buộc:**
  - Chỉ chấp nhận sản phẩm bán ngẫu nhiên (`random`). Nếu sản phẩm được truy vấn là sản phẩm tự chọn (`self-selected`), hệ thống sẽ trả về mảng rỗng như thể sản phẩm không tồn tại.
  - Giá sản phẩm trả về đã áp dụng chiết khấu đặc quyền của tài khoản và được định dạng **Kiểu Số (Number)**.

* **Phản hồi thành công (JSON Response):**
  ```json
  {
    "status": "success",
    "msg": "Lấy dữ liệu thành công!",
    "product": [
      {
        "id": 3,
        "name": "CLONE NGOẠI TRUST BIND 2FA",
        "price": 25000,
        "amount": 612,
        "description": "Số lượng lớn liên hệ admin",
        "flag": null,
        "min": 1,
        "max": 1000000
      }
    ]
  }
  ```
  *Lưu ý:* Nếu ID sản phẩm không tồn tại hoặc thuộc loại tự chọn, kết quả trả về vẫn báo thành công nhưng mảng `product` sẽ rỗng:
  ```json
  {
    "status": "success",
    "msg": "Lấy dữ liệu thành công!",
    "product": []
  }
  ```

---

### 3.4. Mua Sản phẩm (Buy Product)
Khởi tạo giao dịch mua tài khoản số lượng lớn tự động qua API.

* **Endpoints:** `/api/buy_product` hoặc `/api/v1/buy_product`
* **Method:** `GET` hoặc `POST`
* **Tham số đầu vào (Params):**
  - `api_key` (hoặc `key`): Bắt buộc.
  - `action`: Phải truyền giá trị chuỗi cố định là `"buyProduct"` - Bắt buộc.
  - `id` (hoặc `product`): ID của sản phẩm cần mua (chấp nhận cả mã số `productNumericalId` hoặc UUID) - Bắt buộc.
  - `amount`: Số lượng cần mua (Kiểu số nguyên lớn hơn 0) - Bắt buộc.

* **Lưu ý & Quy tắc nghiệp vụ:**
  - Chỉ hỗ trợ đặt mua sản phẩm có hình thức bán ngẫu nhiên (`random`). Các sản phẩm bán tự chọn (`self-selected`) sẽ không khả dụng để mua thông qua API.
  - Số lượng yêu cầu mua (`amount`) phải nằm trong khoảng cho phép từ `min` đến `max` của sản phẩm và không được vượt quá số lượng tồn kho khả dụng hiện tại.
  - Đơn giá mua thực tế sẽ tự động tính toán dựa trên mức giảm giá chiết khấu được thiết lập riêng cho tài khoản đại lý của bạn.
  - Vui lòng đảm bảo số dư tài khoản đủ để thực hiện thanh toán trước khi gửi yêu cầu mua hàng.
  - Hệ thống tích hợp cơ chế chống trùng lặp giao dịch (Spam lock) nên các yêu cầu mua trùng lặp liên tiếp trong thời gian ngắn sẽ bị từ chối để bảo vệ số dư tài khoản đại lý.

* **Phản hồi thành công (JSON Response):**
  ```json
  {
    "status": "success",
    "msg": "Tạo đơn hàng thành công!",
    "trans_id": "b3e9a7e6-2342-4f3f-91a1-cf5d6c8b9d01",
    "data": [
      "username_clone_1|password_1|2fa_code_1",
      "username_clone_2|password_2|2fa_code_2"
    ]
  }
  ```
  *Chi tiết các Key:*
  - `trans_id` (string): Mã định danh UUID duy nhất của hóa đơn vừa tạo trên hệ thống (dùng để tra cứu về sau).
  - `data` (array of strings): Mảng danh sách các thông tin tài khoản (clone/acc) đã được mua (định dạng thô lưu trong kho).

* **Phản hồi lỗi phổ biến (JSON Response):**
  - Thiếu tiền: `{"status": "error", "msg": "Số dư không đủ để thực hiện thanh toán"}`
  - Hết hàng: `{"status": "error", "msg": "Hết hàng hoặc không đủ số lượng yêu cầu"}`
  - Sai số lượng tối thiểu: `{"status": "error", "msg": "Số lượng tối thiểu là 5"}`

---

### 3.5. Kiểm tra Chi tiết Đơn hàng (Check Order)
Tra cứu lại thông tin đơn hàng và danh sách tài khoản đã mua trong quá khứ.

* **Endpoints:** `/api/order.php` hoặc `/api/v1/order`
* **Method:** `GET` hoặc `POST`
* **Tham số đầu vào (Params):**
  - `api_key` (hoặc `key`): Bắt buộc.
  - `order` (hoặc `id`): Chuỗi ký tự (String) - Bắt buộc. Chấp nhận cả mã hóa đơn số (`orderNumericalId`) hoặc mã chuỗi định danh UUID của hóa đơn (`orderId`).

* **Logic Nghiệp vụ & Ràng buộc:**
  - Chỉ cho phép xem lại các hóa đơn do chính tài khoản đại lý hiện tại (sở hữu `api_key`) đặt mua. Mọi hành vi tra cứu chéo mã hóa đơn của tài khoản khác đều bị báo lỗi `Đơn hàng không tồn tại`.

* **Phản hồi thành công (JSON Response):**
  ```json
  {
    "status": "success",
    "msg": "Lấy đơn hàng thành công!",
    "data": [
      "username_clone_1|password_1|2fa_code_1",
      "username_clone_2|password_2|2fa_code_2"
    ]
  }
  ```
  *Chi tiết các Key:*
  - `data` (array of strings): Danh sách chi tiết thông tin tài khoản đã mua thuộc đơn hàng này.

* **Phản hồi lỗi (Đơn hàng không tồn tại hoặc thuộc tài khoản khác):**
  ```json
  {
    "status": "error",
    "msg": "Không tìm thấy đơn hàng"
  }
  ```

---

## 4. DANH SÁCH MÃ LỖI THƯỜNG GẶP (ERROR MESSAGES)

| Mã thông điệp lỗi (`msg`) | Lý do xảy ra |
| :--- | :--- |
| `Thiếu api_key` | Tham số `api_key` hoặc `key` hoàn toàn trống hoặc không được gửi lên. |
| `API Key không hợp lệ` | Token API Key gửi lên không khớp với bất kỳ tài khoản đại lý nào. |
| `Tài khoản của bạn đã bị vô hiệu hóa.` | Tài khoản đại lý bị khóa hành chính (status !== "active"). |
| `action không hợp lệ` | (Khi mua sản phẩm) Tham số `action` không có hoặc truyền sai chuỗi `"buyProduct"`. |
| `Thiếu id` | (Khi mua sản phẩm / xem chi tiết) Không truyền tham số chỉ định sản phẩm (`id` / `product`). |
| `Thiếu product` | (Khi xem chi tiết sản phẩm) Không truyền tham số chỉ định sản phẩm (`id` / `product`). |
| `amount không hợp lệ` | (Khi mua sản phẩm) Số lượng mua trống, không phải là số hoặc nhỏ hơn hoặc bằng 0. |
| `Không tìm thấy sản phẩm` | Sản phẩm cần mua/xem không tồn tại, ngừng bán hoặc thuộc loại tự chọn (`self-selected`). |
| `Số lượng tối thiểu là {X}` | Số lượng đặt mua nhỏ hơn giới hạn mua tối thiểu của sản phẩm. |
| `Số lượng tối đa là {X}` | Số lượng đặt mua vượt quá giới hạn mua tối đa của sản phẩm trên một giao dịch. |
| `Hết hàng hoặc không đủ số lượng yêu cầu` | Số lượng clone còn lại trong kho nhỏ hơn số lượng đại lý yêu cầu. |
| `Xung đột hệ thống khi lấy hàng, vui lòng thử lại` | Có nhiều yêu cầu mua đồng thời tranh chấp kho hoặc lỗi khóa ghi Redis. |
| `Số dư không đủ, vui lòng nạp thêm` | Số dư tài khoản đại lý (sau khi tính chiết khấu + VAT + phụ phí) nhỏ hơn tổng tiền phải trả. |
| `Thiếu order` | (Khi kiểm tra đơn hàng) Không truyền tham số mã đơn hàng (`order` / `id`). |
| `Không tìm thấy đơn hàng` | Mã đơn hàng kiểm tra không chính xác, hoặc đơn hàng này thuộc về người dùng khác. |
