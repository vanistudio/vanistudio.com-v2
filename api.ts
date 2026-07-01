import * as fs from "fs";
import * as path from "path";

// ==========================================
// 1. CẤU HÌNH DATABASE URL TẠI ĐÂY
// Bạn có thể nhập chuỗi kết nối PostgreSQL của mình vào biến DATABASE_URL bên dưới.
// Ví dụ: const DATABASE_URL = "postgresql://username:password@localhost:5432/vanistudio";
// Nếu để trống hoặc null, script sẽ tự động tìm biến môi trường APP_DATABASE_URI_VALUE hoặc file .env
// ==========================================
const DATABASE_URL = "";

// 2. Tự động đọc và nạp file .env cục bộ
const envPath = path.join(__dirname, "./.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    const key = parts[0]?.trim();
    const value = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
    if (key && value) {
      process.env[key] = value;
    }
  });
}

// 3. Thiết lập biến môi trường kết nối cơ sở dữ liệu
const finalDbUrl = DATABASE_URL || process.env.APP_DATABASE_URI_VALUE;
if (!finalDbUrl) {
  console.error("\n[Error] Vui lòng nhập DATABASE_URL trực tiếp trong script này hoặc định nghĩa APP_DATABASE_URI_VALUE trong file .env!\n");
  process.exit(1);
}
process.env.APP_DATABASE_URI_VALUE = finalDbUrl;

// ============================================================================
// 4. NỘI DUNG CÁC TÀI LIỆU HƯỚNG DẪN CHUNG (MDX FORMAT)
// ============================================================================

const mdxOverviewContent = `# Hướng dẫn Tích hợp API Reseller (CloneV7 Protocol)

Hệ thống API Reseller của chúng tôi được thiết kế theo chuẩn **CloneV7 Protocol** tối ưu hóa hiệu năng cao. Cho dù bạn đang muốn xây dựng một sub-site bán tài khoản tự động, hay tích hợp nguồn hàng MMO chất lượng cao vào hệ thống quản lý sẵn có, tài liệu này sẽ hướng dẫn bạn tích hợp một cách chính xác và an toàn.

---

## Mô hình hoạt động của hệ thống Reseller

Hệ thống hoạt động theo mô hình **B2B2C** hoàn toàn tự động theo thời gian thực:

\`\`\`text
[ Khách hàng của bạn ]  --->  [ Website Đại lý của bạn ]  --->  [ Hệ thống MMO Store API ]
\`\`\`

Khi khách hàng thực hiện đặt mua trên website của bạn, hệ thống của bạn sẽ chuyển tiếp yêu cầu đến MMO Store qua API. Sau khi MMO Store xử lý giao dịch thành công và bàn giao thông tin tài khoản (clone/account), website của bạn sẽ nhận về và chuyển giao trực tiếp cho khách hàng.

### Cấu hình định tuyến (Routing & Legacy Rewrite)

Hệ thống hỗ trợ song song hai định dạng đường dẫn để tương thích ngược với các mã nguồn website đại lý thế hệ cũ (sử dụng file .php) và các hệ thống chuẩn REST hiện đại:

| Chức năng | Đường dẫn Legacy (PHP) | Đường dẫn chuẩn REST v1 | Method hỗ trợ |
| :--- | :--- | :--- | :--- |
| **Thông tin tài khoản** | \`/api/profile.php\` | \`/api/v1/profile\` | \`GET\`, \`POST\` |
| **Danh sách sản phẩm** | \`/api/products.php\` | \`/api/v1/products\` | \`GET\`, \`POST\` |
| **Chi tiết sản phẩm** | \`/api/product.php\` | \`/api/v1/product\` | \`GET\`, \`POST\` |
| **Mua tài khoản** | \`/api/buy_product\` | \`/api/v1/buy_product\` | \`GET\`, \`POST\` |
| **Kiểm tra đơn hàng** | \`/api/order.php\` | \`/api/v1/order\` | \`GET\`, \`POST\` |

* **Base URL:** \`https://your-domain.com\`
* **Định dạng dữ liệu:** Luôn luôn là JSON (\`Content-Type: application/json; charset=utf-8\`).
`;

const mdxAuthContent = `# Phương thức xác thực (Authentication)

Tất cả các API yêu cầu xác thực người dùng thông qua khóa đại lý (\`api_key\` hoặc \`key\`).

* Khóa API có thể được gửi qua **Query String** (trên URL) hoặc nằm trong **Request Body** (JSON hoặc Form Data).
* **Thứ tự tìm kiếm khóa:** Hệ thống sẽ tìm tham số \`api_key\` trước, nếu không có sẽ tìm tham số \`key\`.

### Phản hồi lỗi xác thực

Khi khóa API thiếu hoặc không chính xác, hệ thống sẽ trả về mã lỗi tương ứng:

* **Thiếu khóa API:** Trả về \`{"status": "error", "msg": "Thiếu api_key"}\`.
* **Khóa API sai hoặc không tồn tại:** Trả về \`{"status": "error", "msg": "API Key không hợp lệ"}\`.
`;

// ============================================================================
// 5. NỘI DUNG CHI TIẾT CÁC ENDPOINT (MDX FORMAT & PHP CODE SAMPLES)
// ============================================================================

const mdxProfileDescription = `<Callout icon="solar:user-line-duotone" color="#3b82f6">
  **Thông tin chiết khấu:** Lượng chiết khấu (\`discount\`) được dùng để tự động giảm trừ trực tiếp vào giá bán gốc của mọi sản phẩm khi bạn gọi API mua hàng.
</Callout>

API này trả về thông tin cơ bản của đại lý liên kết với khóa API, bao gồm tên tài khoản, số dư khả dụng và tỷ lệ phần trăm chiết khấu được cấu hình riêng.

### Kịch bản thực tế: Cảnh báo số dư tự động qua Telegram
Nếu ví đại lý của bạn hết tiền, khách hàng mua qua website con của bạn sẽ bị báo lỗi. Bạn nên viết script chạy định kỳ (cron job) để kiểm tra số dư và tự động bắn cảnh báo qua Telegram khi số dư khả dụng tụt xuống dưới một hạn mức tối thiểu (ví dụ 200,000 VND).

#### Mã nguồn PHP thực hiện kiểm tra số dư và gửi thông báo Telegram:
\`\`\`php
<?php
\$apiKey = "api_reseller_6789abcd";
\$domain = "https://your-domain.com";
\$minBalanceAlert = 200000; // Ngưỡng cảnh báo: 200k VND
\$telegramToken = "BOT_TOKEN_CUA_BAN";
\$chatId = "CHAT_ID_NHOM_CUA_BAN";

\$url = \$domain . "/api/profile.php?api_key=" . urlencode(\$apiKey);
\$ch = curl_init();
curl_setopt(\$ch, CURLOPT_URL, \$url);
curl_setopt(\$ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt(\$ch, CURLOPT_TIMEOUT, 10);
\$response = curl_exec(\$ch);

if (!curl_errno(\$ch)) {
    \$result = json_decode(\$response, true);
    if (isset(\$result['status']) && \$result['status'] === 'success') {
        \$balance = (int)\$result['balance'];
        if (\$balance < \$minBalanceAlert) {
            \$msg = "[WARNING] Số dư đại lý của bạn sắp hết!\\n"
                 . "Đại lý: " . \$result['username'] . "\\n"
                 . "Số dư hiện tại: " . number_format(\$balance) . " VND\\n"
                 . "Vui lòng nạp thêm tiền để tránh gián đoạn dịch vụ.";
                 
            // Gửi tin nhắn đến Telegram Bot
            \$tgUrl = "https://api.telegram.org/bot" . \$telegramToken . "/sendMessage";
            \$tgCh = curl_init();
            curl_setopt(\$tgCh, CURLOPT_URL, \$tgUrl);
            curl_setopt(\$tgCh, CURLOPT_POST, true);
            curl_setopt(\$tgCh, CURLOPT_POSTFIELDS, http_build_query([
                'chat_id' => \$chatId,
                'text' => \$msg
            ]));
            curl_setopt(\$tgCh, CURLOPT_RETURNTRANSFER, true);
            curl_exec(\$tgCh);
            curl_close(\$tgCh);
        }
    }
}
curl_close(\$ch);
?>
\`\`\`
`;

const mdxListProductsDescription = `<Callout icon="solar:layers-line-duotone" color="#10b981">
  **Quy tắc cấu trúc cây:** Danh mục cấp cha có \`parent_id\` là 0. Danh mục cấp con có \`parent_id\` trỏ đến ID danh mục cha tương ứng.
</Callout>

Lấy toàn bộ cây danh mục sản phẩm và danh sách các sản phẩm đang mở bán trên hệ thống. 
* Sản phẩm tự chọn (\`selling_method\` = \`self-selected\`) sẽ bị ẩn hoàn toàn qua API (chỉ trả về sản phẩm bán ngẫu nhiên \`random\`).
* Đơn giá (\`price\`) trả về của sản phẩm đã được tự động áp dụng chiết khấu đặc quyền của tài khoản đại lý.

### Tối ưu hóa hiệu năng bằng cơ chế Caching:
Để tránh bị khóa IP do gửi quá nhiều request (Rate Limit) và tăng tốc độ tải trang cho website của bạn, **không được gọi API này trên mỗi lượt tải trang của khách hàng**. Bạn bắt buộc phải lưu cache kết quả trả về vào file JSON cục bộ hoặc Redis trong vòng 5 phút (300 giây).

#### Mã nguồn PHP thực hiện Caching sản phẩm cục bộ:
\`\`\`php
<?php
\$apiKey = "api_reseller_6789abcd";
\$domain = "https://your-domain.com";
\$cacheFile = __DIR__ . "/cache_products.json";
\$cacheTime = 300; // Cache 5 phút

if (file_exists(\$cacheFile) && (time() - filemtime(\$cacheFile) < \$cacheTime)) {
    \$result = json_decode(file_get_contents(\$cacheFile), true);
    echo "[CACHE] Đọc dữ liệu từ cache cục bộ thành công.\\n";
} else {
    \$url = \$domain . "/api/products.php?api_key=" . urlencode(\$apiKey);
    \$response = file_get_contents(\$url);
    if (\$response) {
        file_put_contents(\$cacheFile, \$response);
        \$result = json_decode(\$response, true);
        echo "[LIVE] Tải dữ liệu trực tiếp từ API thành công.\\n";
    }
}
?>
\`\`\`
`;

const mdxGetProductDescription = `<Callout icon="solar:magnifer-zoom-in-line-duotone" color="#8b5cf6">
  **Không áp dụng cache:** Khác với danh sách sản phẩm, API xem chi tiết này nên được gọi trực tiếp và không qua cache tại thời điểm khách hàng click mở form mua hàng để có số tồn kho (\`amount\`) chính xác nhất.
</Callout>

Lấy thông tin cấu hình chi tiết và số lượng tồn kho thực tế của một sản phẩm duy nhất thông qua ID sản phẩm (chấp nhận cả ID dạng số và chuỗi UUID).

#### Mã nguồn PHP kiểm tra tồn kho thời gian thực:
\`\`\`php
<?php
\$apiKey = "api_reseller_6789abcd";
\$productId = "46";
\$domain = "https://your-domain.com";

\$url = \$domain . "/api/product.php?api_key=" . urlencode(\$apiKey) . "&product=" . urlencode(\$productId);
\$ch = curl_init();
curl_setopt(\$ch, CURLOPT_URL, \$url);
curl_setopt(\$ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt(\$ch, CURLOPT_TIMEOUT, 8);
\$response = curl_exec(\$ch);

if (!curl_errno(\$ch)) {
    \$result = json_decode(\$response, true);
    if (isset(\$result['status']) && \$result['status'] === 'success' && !empty(\$result['product'])) {
        \$prod = \$result['product'][0];
        echo "Sản phẩm: " . \$prod['name'] . "\\n";
        echo "Tồn kho khả dụng: " . \$prod['amount'] . " tài khoản\\n";
        echo "Giới hạn mua: Từ " . \$prod['min'] . " đến " . \$prod['max'] . "\\n";
    } else {
        echo "Sản phẩm không tồn tại hoặc không hỗ trợ bán ngẫu nhiên qua API.";
    }
}
curl_close(\$ch);
?>
\`\`\`
`;

const mdxBuyProductDescription = `<Callout icon="solar:cart-large-line-duotone" color="#eab308">
  **Chống trùng lặp giao dịch (Double Purchase Protection):** Hệ thống có cơ chế khóa chống spam. Các yêu cầu mua trùng lặp liên tiếp trong thời gian dưới 5 giây sẽ bị từ chối để tránh trừ tiền hai lần.
</Callout>

Thực hiện mua tài khoản số lượng lớn tự động qua API.
* Chỉ hỗ trợ đặt mua sản phẩm có hình thức bán ngẫu nhiên (\`random\`).
* Số lượng mua phải nằm trong khoảng cho phép từ \`min\` đến \`max\` và không vượt quá tồn kho.
* Vui lòng đảm bảo số dư tài khoản của bạn đủ để thực hiện thanh toán trước khi gửi yêu cầu.

#### Mã nguồn PHP thực hiện mua hàng:
\`\`\`php
<?php
\$apiKey = "api_reseller_6789abcd";
\$domain = "https://your-domain.com";

\$url = \$domain . "/api/buy_product";
\$data = [
    'api_key' => \$apiKey,
    'action' => 'buyProduct',
    'id' => '46', // ID sản phẩm
    'amount' => 10 // Số lượng đặt mua
];

\$ch = curl_init();
curl_setopt(\$ch, CURLOPT_URL, \$url);
curl_setopt(\$ch, CURLOPT_POST, true);
curl_setopt(\$ch, CURLOPT_POSTFIELDS, http_build_query(\$data));
curl_setopt(\$ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt(\$ch, CURLOPT_TIMEOUT, 15);
\$response = curl_exec(\$ch);

if (!curl_errno(\$ch)) {
    \$result = json_decode(\$response, true);
    if (isset(\$result['status']) && \$result['status'] === 'success') {
        echo "Đặt mua thành công! Mã hóa đơn: " . \$result['trans_id'] . "\\n";
        echo "Danh sách tài khoản nhận được:\\n";
        print_r(\$result['data']);
    } else {
        echo "Đặt mua thất bại: " . (\$result['msg'] ?? 'Không rõ lý do') . "\\n";
    }
}
curl_close(\$ch);
?>
\`\`\`
`;

const mdxCheckOrderDescription = `<Callout icon="solar:shield-keyhole-line-duotone" color="#f43f5e">
  **Bảo mật dữ liệu:** Hệ thống kiểm soát nghiêm ngặt quyền sở hữu hóa đơn. Mọi yêu cầu tra cứu chéo hóa đơn của đại lý khác sẽ bị báo lỗi không tìm thấy đơn hàng.
</Callout>

Tra cứu lại thông tin đơn hàng và danh sách tài khoản đã mua trong quá khứ thông qua mã hóa đơn (chấp nhận cả ID hóa đơn dạng số và chuỗi UUID).

#### Mã nguồn PHP kiểm tra chi tiết đơn hàng:
\`\`\`php
<?php
\$apiKey = "api_reseller_6789abcd";
\$orderId = "b3e9a7e6-2342-4f3f-91a1-cf5d6c8b9d01"; // UUID nhận được từ buy_product
\$domain = "https://your-domain.com";

\$url = \$domain . "/api/order.php?api_key=" . urlencode(\$apiKey) . "&order=" . urlencode(\$orderId);
\$ch = curl_init();
curl_setopt(\$ch, CURLOPT_URL, \$url);
curl_setopt(\$ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt(\$ch, CURLOPT_TIMEOUT, 10);
\$response = curl_exec(\$ch);

if (!curl_errno(\$ch)) {
    \$result = json_decode(\$response, true);
    if (isset(\$result['status']) && \$result['status'] === 'success') {
        echo "Tìm thấy đơn hàng! Danh sách tài khoản đã mua:\\n";
        foreach (\$result['data'] as \$index => \$account) {
            echo "[" . (\$index + 1) . "]: " . \$account . "\\n";
        }
    } else {
        echo "Lỗi: " . (\$result['msg'] ?? 'Không tìm thấy hóa đơn hoặc không thuộc quyền sở hữu.');
    }
}
curl_close(\$ch);
?>
\`\`\`
`;

// ============================================================================
// 6. HÀM CHẠY SEEDING DỮ LIỆU VÀO DATABASE
// ============================================================================

async function runSeed() {
  try {
    console.log("----------------------------------------------------------------");
    console.log("BẮT ĐẦU SEED TÀI LIỆU API: CLONEV7 PROTOCOL...");
    console.log("----------------------------------------------------------------");

    // Dynamic import các module dự án sau khi đã thiết lập biến môi trường ở trên
    const { apiRepository } = await import("./src/server/repositories/api.repository");

    const customProduct = {
      name: "CloneV7 Protocol",
      slug: "clonev7-protocol",
      description: "Tài liệu đặc tả kỹ thuật chi tiết toàn bộ hệ thống API Reseller (chuẩn tích hợp CloneV7) dành cho các bên kết nối (Resellers/Khách sỉ).",
      thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-m1ojhmm1ojhmm1oj-1782643214053.jpg",
      overviews: [
        {
          title: "Tổng quan & Cách hoạt động",
          slug: "overview",
          description: "Mô tả chung và cơ chế hoạt động của API Reseller chuẩn CloneV7.",
          content: mdxOverviewContent,
        },
        {
          title: "Phương thức xác thực",
          slug: "authentication",
          description: "Cách thức xác thực thông qua API Key / Key của đại lý.",
          content: mdxAuthContent,
        }
      ],
      groups: [
        {
          name: "Tích hợp Reseller (CloneV7)",
          slug: "reseller-integration",
          description: "Danh sách các API phục vụ đồng bộ tài khoản, đặt mua hàng và kiểm tra đơn hàng tự động.",
          endpoints: [
            {
              name: "Truy vấn Thông tin Tài khoản (Profile)",
              method: "GET",
              path: "/api/profile.php",
              description: mdxProfileDescription,
              queryParams: [
                {
                  name: "api_key",
                  type: "string",
                  required: true,
                  description: "Khóa API của đại lý (chấp nhận cả tham số 'key')"
                }
              ],
              responses: [
                {
                  status: 200,
                  description: "Lấy thông tin tài khoản thành công",
                  body: {
                    status: "success",
                    msg: "Lấy thông tin thành công!",
                    username: "reseller_username",
                    balance: 1500000,
                    discount: 5
                  }
                },
                {
                  status: 400,
                  description: "API Key không hợp lệ",
                  body: {
                    status: "error",
                    msg: "API Key không hợp lệ"
                  }
                }
              ]
            },
            {
              name: "Lấy Danh sách Sản phẩm (Products)",
              method: "GET",
              path: "/api/products.php",
              description: mdxListProductsDescription,
              queryParams: [
                {
                  name: "api_key",
                  type: "string",
                  required: true,
                  description: "Khóa API của đại lý (chấp nhận cả tham số 'key')"
                }
              ],
              responses: [
                {
                  status: 200,
                  description: "Lấy danh sách sản phẩm thành công",
                  body: {
                    status: "success",
                    msg: "Lấy dữ liệu thành công!",
                    categories: [
                      {
                        id: "1",
                        parent_id: 0,
                        name: "FACEBOOK",
                        icon: "https://your-domain.com/assets/images/fb.jpg",
                        products: []
                      },
                      {
                        id: "9",
                        parent_id: 1,
                        name: "CLONE US",
                        icon: "https://your-domain.com/assets/images/us.jpg",
                        products: [
                          {
                            id: "46",
                            name: "Clone USA Trust - Reg IP USA - Thích hợp chạy ads",
                            price: "6000",
                            amount: 3966,
                            description: "Mua test 1-2 acc trước khi mua số lượng lớn.",
                            flag: null,
                            min: "1",
                            max: "1000000"
                          }
                        ]
                      }
                    ]
                  }
                }
              ]
            },
            {
              name: "Xem Chi tiết Một Sản phẩm (Product Detail)",
              method: "GET",
              path: "/api/product.php",
              description: mdxGetProductDescription,
              queryParams: [
                {
                  name: "api_key",
                  type: "string",
                  required: true,
                  description: "Khóa API của đại lý (chấp nhận cả tham số 'key')"
                },
                {
                  name: "product",
                  type: "string",
                  required: true,
                  description: "ID dạng số hoặc UUID của sản phẩm (chấp nhận cả tham số 'id')"
                }
              ],
              responses: [
                {
                  status: 200,
                  description: "Lấy chi tiết sản phẩm thành công",
                  body: {
                    status: "success",
                    msg: "Lấy dữ liệu thành công!",
                    product: [
                      {
                        id: 3,
                        name: "CLONE NGOẠI TRUST BIND 2FA",
                        price: 25000,
                        amount: 612,
                        description: "Số lượng lớn liên hệ admin",
                        flag: null,
                        min: 1,
                        max: 1000000
                      }
                    ]
                  }
                }
              ]
            },
            {
              name: "Mua Sản phẩm (Buy Product)",
              method: "POST",
              path: "/api/buy_product",
              description: mdxBuyProductDescription,
              requestBody: [
                {
                  name: "api_key",
                  type: "string",
                  required: true,
                  description: "Khóa API của đại lý (chấp nhận cả tham số 'key')"
                },
                {
                  name: "action",
                  type: "string",
                  required: true,
                  description: "Giá trị chuỗi cố định bắt buộc phải là 'buyProduct'"
                },
                {
                  name: "id",
                  type: "string",
                  required: true,
                  description: "ID của sản phẩm cần mua (chấp nhận cả tham số 'product')"
                },
                {
                  name: "amount",
                  type: "number",
                  required: true,
                  description: "Số lượng tài khoản cần mua (> 0)"
                }
              ],
              responses: [
                {
                  status: 200,
                  description: "Mua sản phẩm thành công",
                  body: {
                    status: "success",
                    msg: "Tạo đơn hàng thành công!",
                    trans_id: "b3e9a7e6-2342-4f3f-91a1-cf5d6c8b9d01",
                    data: [
                      "username_clone_1|password_1|2fa_code_1",
                      "username_clone_2|password_2|2fa_code_2"
                    ]
                  }
                },
                {
                  status: 400,
                  description: "Số dư tài khoản không đủ",
                  body: {
                    status: "error",
                    msg: "Số dư không đủ để thực hiện thanh toán"
                  }
                }
              ]
            },
            {
              name: "Kiểm tra Chi tiết Đơn hàng (Check Order)",
              method: "GET",
              path: "/api/order.php",
              description: mdxCheckOrderDescription,
              queryParams: [
                {
                  name: "api_key",
                  type: "string",
                  required: true,
                  description: "Khóa API của đại lý (chấp nhận cả tham số 'key')"
                },
                {
                  name: "order",
                  type: "string",
                  required: true,
                  description: "Mã hóa đơn dạng số hoặc UUID (chấp nhận cả tham số 'id')"
                }
              ],
              responses: [
                {
                  status: 200,
                  description: "Truy vấn đơn hàng thành công",
                  body: {
                    status: "success",
                    msg: "Lấy đơn hàng thành công!",
                    data: [
                      "username_clone_1|password_1|2fa_code_1",
                      "username_clone_2|password_2|2fa_code_2"
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    console.log("Đang xóa dữ liệu cũ và tiến hành nạp tài liệu mới vào cơ sở dữ liệu...");
    await apiRepository.seedDefaultApiDocs([customProduct]);

    console.log("----------------------------------------------------------------");
    console.log("ĐÃ SEED TÀI LIỆU API THÀNH CÔNG!");
    console.log(`Bạn có thể xem tài liệu mới tại đường dẫn: /docs/${customProduct.slug}`);
    console.log("----------------------------------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("Đã xảy ra lỗi khi seed tài liệu API:", error);
    process.exit(1);
  }
}

runSeed();
