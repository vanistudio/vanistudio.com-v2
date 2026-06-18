export interface DefaultApiParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  description: string;
  placeholder?: string;
  defaultValue?: any;
}

export interface DefaultApiResponseSample {
  status: number;
  description: string;
  body: any;
}

export interface DefaultApiEndpoint {
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  headers?: DefaultApiParameter[];
  queryParams?: DefaultApiParameter[];
  requestBody?: DefaultApiParameter[];
  responses?: DefaultApiResponseSample[];
}

export interface DefaultApiGroup {
  name: string;
  slug: string;
  description?: string;
  endpoints: DefaultApiEndpoint[];
}

export interface DefaultApiOverview {
  title: string;
  slug: string;
  description: string;
  content: string;
}

export interface DefaultApiProduct {
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  overviews: DefaultApiOverview[];
  groups: DefaultApiGroup[];
}

export const DEFAULT_API_DOCS: DefaultApiProduct[] = [
  {
    name: "Shopee Open API Integration",
    slug: "shopee-api",
    description: "Hệ thống tài liệu tích hợp API Shopee Open Platform v2.0 dành cho Nhà bán hàng và Đối tác.",
    thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-rsd6trrsd6trrsd6-1781707168669.jpeg",
    overviews: [
      {
        title: "Hướng dẫn bắt đầu Shopee Open API",
        slug: "bat-dau-shopee-api",
        description: "Tài liệu hướng dẫn đăng ký tài khoản lập trình viên, tạo ứng dụng và ủy quyền shop Shopee.",
        content: `### Hướng dẫn tích hợp Shopee Open API

Tài liệu này hỗ trợ các lập trình viên kết nối và tích hợp hệ thống quản lý bán hàng (ERP/OMS) với sàn thương mại điện tử **Shopee**.

#### Quy trình Tích hợp & Ủy quyền
Để sử dụng API, bạn cần đi qua các bước sau:
1. **Đăng ký Tài khoản**: Truy cập Shopee Open Platform để tạo tài khoản developer.
2. **Tạo Ứng dụng (App)**: Đăng ký ứng dụng để nhận \`PartnerID\` và \`PartnerKey\`.
3. **Ủy quyền Cửa hàng (Shop Authorization)**:
   * Chuyển hướng người bán đến trang ủy quyền của Shopee.
   * Nhận mã \`code\` ủy quyền trả về qua URL callback.
   * Gọi API token để đổi \`code\` lấy \`access_token\` và \`refresh_token\`.

<Callout type="warning">
  Mã \`access_token\` của Shopee có hiệu lực trong vòng 4 giờ. Bạn phải thiết lập tác vụ chạy ngầm để refresh token tự động sử dụng \`refresh_token\`.
</Callout>

#### Cấu hình Môi trường
* **Môi trường Test (SandBox)**: \`https://partner.test-stable.shopeemobile.com\`
* **Môi trường Live (Production)**: \`https://partner.shopeemobile.com\``
      },
      {
        title: "Cơ chế Xác thực & Chữ ký số (Signature)",
        slug: "chu-ky-shopee-api",
        description: "Hướng dẫn cách tạo chữ ký số (sign) cho các request bằng thuật toán HMAC-SHA256.",
        content: `### Cơ chế Xác thực & Ký chữ ký (Signature)

Mọi API request gửi tới hệ thống Shopee Open Platform đều yêu cầu phải được ký chữ ký điện tử để đảm bảo tính an toàn dữ liệu và chống giả mạo.

#### Các tham số Query bắt buộc
Mỗi URL gọi API đều phải đính kèm các tham số sau:
1. \`partner_id\`: ID đối tác của bạn.
2. \`timestamp\`: Unix timestamp (tính bằng giây) lúc gửi request.
3. \`sign\`: Chữ ký bảo mật (signature) dạng Hex.
4. \`access_token\`: Mã truy cập của cửa hàng (ngoại trừ các API public không cần access token).
5. \`shop_id\`: ID của cửa hàng Shopee thực thi tác vụ.

#### Thuật toán Tạo Chữ ký (Signature)
Công thức tạo chữ ký như sau:
\`\`\`
base_string = partner_id + api_path + timestamp + access_token + shop_id
signature = HMAC-SHA256(base_string, partner_key)
\`\`\`

#### Code mẫu bằng Node.js
\`\`\`javascript
const crypto = require('crypto');

function generateSignature(partnerId, apiPath, timestamp, accessToken, shopId, partnerKey) {
  const baseString = partnerId.toString() + apiPath + timestamp.toString() + accessToken + shopId.toString();
  return crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');
}
\`\`\``
      },
      {
        title: "Quản lý Hạn mức Tần suất gọi (Rate Limits)",
        slug: "rate-limits-shopee",
        description: "Quy định về giới hạn tần suất gọi API (Rate Limits) để tránh lỗi HTTP 429.",
        content: `### Hạn mức Tần suất gọi API (Rate Limit Tiers)

Để đảm bảo hiệu năng hệ thống cho tất cả các đối tác, Shopee áp dụng cơ chế giới hạn tần suất gọi API nghiêm ngặt.

#### Phân chia Hạn mức (API Tiers)
* **Tier 1 (API Thông dụng)**: Các API lấy thông tin đơn hàng, sản phẩm. Hạn mức: \`5000 requests/phút\` trên mỗi Partner.
* **Tier 2 (API Nghiệp vụ cao)**: API cập nhật tồn kho, giá sản phẩm. Hạn mức: \`1000 requests/phút\`.
* **Tier 3 (API Xác thực & Đơn hàng nặng)**: API xuất nhãn vận chuyển, API lấy token. Hạn mức: \`100 requests/phút\`.

#### Xử lý phản hồi khi vượt hạn mức
Nếu bạn gọi vượt quá tần suất cho phép, hệ thống sẽ trả về mã trạng thái \`HTTP 429 Too Many Requests\` kèm nội dung lỗi:
\`\`\`json
{
  "error": "error_rate_limit",
  "message": "You have exceeded your API rate limit. Please try again later."
}
\`\`\`

#### Giải pháp khuyến nghị
1. Tự động kiểm tra header \`X-RateLimit-Remaining\` trong response để điều chỉnh tần số gọi.
2. Áp dụng thuật toán **Token Bucket** hoặc xếp hàng đợi (Queue) ở phía client.
3. Thực hiện cơ chế **Exponential Backoff** khi gặp lỗi 429.`
      },
      {
        title: "Nhận thông tin qua Webhook (Push Notifications)",
        slug: "webhook-shopee",
        description: "Cách cấu hình Webhook để lắng nghe các sự kiện cập nhật trạng thái đơn hàng, hoàn tiền tự động.",
        content: `### Cấu hình Webhook nhận thông báo tự động từ Shopee

Thay vì liên tục truy vấn (polling) dữ liệu, Shopee khuyên dùng hệ thống **Webhook** để nhận thông tin sự kiện thời gian thực.

#### Các sự kiện Webhook hỗ trợ
* \`ORDER_STATUS_UPDATE\`: Cập nhật trạng thái đơn hàng (Chuẩn bị hàng, Đang giao, Đã giao, Đã hủy).
* \`ITEM_PROMOTION_UPDATE\`: Thay đổi thông tin khuyến mãi trên sản phẩm.
* \`CHAT_MESSAGE_RECEIVED\`: Có tin nhắn chat mới từ khách hàng.
* \`RETURN_REFUND_UPDATE\`: Khách hàng gửi yêu cầu trả hàng/hoàn tiền.

#### Xác minh Webhook Request (Security)
Shopee gửi kèm header \`X-Shopee-Signature\` để bạn xác minh tính đúng đắn của nguồn phát.
\`\`\`javascript
const signature = req.headers['x-shopee-signature'];
const computedSignature = crypto.createHmac('sha256', partnerKey).update(req.body).digest('hex');

if (signature === computedSignature) {
  // Request an toàn và tin cậy
}
\`\`\`

#### Quy định Phản hồi
Hệ thống nhận webhook của bạn bắt buộc phải phản hồi \`HTTP 200 OK\` hoặc \`HTTP 204 No Content\` trong vòng **3 giây**. Nếu không phản hồi hoặc phản hồi lỗi, Shopee sẽ thực hiện gửi lại (retry) tối đa 5 lần.`
      }
    ],
    groups: [
      {
        name: "Xác thực & Ủy quyền",
        slug: "shopee-auth",
        description: "Các API phục vụ lấy access token, refresh token và quản lý quyền truy cập cửa hàng.",
        endpoints: [
          {
            name: "Lấy Access Token từ authorization code",
            method: "POST",
            path: "/api/v1/shopee/auth/token",
            description: "Lấy mã truy cập `access_token` và `refresh_token` sau khi người bán hoàn tất ủy quyền cửa hàng.",
            headers: [{ name: "Content-Type", type: "string", required: true, description: "Định dạng dữ liệu yêu cầu", defaultValue: "application/json" }],
            queryParams: [
              { name: "partner_id", type: "number", required: true, description: "ID đối tác do Shopee cấp", defaultValue: 100234 },
              { name: "timestamp", type: "number", required: true, description: "Unix timestamp thực thi", defaultValue: 1781829600 }
            ],
            requestBody: [
              { name: "code", type: "string", required: true, description: "Mã auth code nhận từ redirect" },
              { name: "shop_id", type: "number", required: true, description: "ID của cửa hàng Shopee", defaultValue: 8877665 }
            ],
            responses: [{ status: 200, description: "Thành công", body: { access_token: "tok_shopee_9988ff", refresh_token: "ref_shopee_2233bb", expire_in: 14400, shop_id: 8877665 } }]
          },
          {
            name: "Làm mới Access Token (Refresh Token)",
            method: "POST",
            path: "/api/v1/shopee/auth/refresh",
            description: "Sử dụng refresh token để gia hạn access token mới sau khi token cũ hết hạn (4 tiếng).",
            headers: [{ name: "Content-Type", type: "string", required: true, description: "Định dạng dữ liệu", defaultValue: "application/json" }],
            queryParams: [
              { name: "partner_id", type: "number", required: true, description: "ID đối tác", defaultValue: 100234 },
              { name: "timestamp", type: "number", required: true, description: "Unix timestamp", defaultValue: 1781829600 }
            ],
            requestBody: [
              { name: "refresh_token", type: "string", required: true, description: "Refresh token cũ còn hạn" },
              { name: "shop_id", type: "number", required: true, description: "ID shop Shopee", defaultValue: 8877665 }
            ],
            responses: [{ status: 200, description: "Làm mới thành công", body: { access_token: "tok_shopee_new_99aa", refresh_token: "ref_shopee_new_22bb", expire_in: 14400 } }]
          },
          {
            name: "Lấy thông tin chi tiết Shop",
            method: "GET",
            path: "/api/v1/shopee/auth/shop_info",
            description: "Truy vấn thông tin cấu hình cơ bản của Shop như tên shop, quốc gia, thời gian hết hạn ủy quyền.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token", placeholder: "Bearer tok_shopee_..." }],
            queryParams: [
              { name: "partner_id", type: "number", required: true, description: "ID đối tác", defaultValue: 100234 },
              { name: "shop_id", type: "number", required: true, description: "ID shop Shopee", defaultValue: 8877665 }
            ],
            responses: [{ status: 200, description: "Thành công", body: { shop_name: "Vani Store Shopee", country: "VN", status: "NORMAL", auth_time: 1781829600 } }]
          },
          {
            name: "Hủy ủy quyền kết nối Shop",
            method: "POST",
            path: "/api/v1/shopee/auth/revoke",
            description: "Hủy bỏ ủy quyền kết nối và xóa các token của Shop trên hệ thống của bạn.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "shop_id", type: "number", required: true, description: "ID shop Shopee", defaultValue: 8877665 }
            ],
            responses: [{ status: 200, description: "Hủy thành công", body: { success: true, message: "Revoke authorization successful" } }]
          },
          {
            name: "Lấy danh sách các Shop đã ủy quyền",
            method: "GET",
            path: "/api/v1/shopee/auth/authorized_shops",
            description: "Truy vấn danh sách các cửa hàng đã thực hiện liên kết thành công dưới tài khoản của bạn.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            responses: [{ status: 200, description: "Thành công", body: { shops: [{ shop_id: 8877665, shop_name: "Vani Store", auth_time: 1781829600 }] } }]
          },
          {
            name: "Tạo link liên kết ủy quyền Shop",
            method: "GET",
            path: "/api/v1/shopee/auth/auth_link",
            description: "Sinh ra đường dẫn chuyển tiếp để nhà bán hàng click vào thực hiện đăng nhập và ủy quyền shop cho ứng dụng của bạn.",
            queryParams: [
              { name: "partner_id", type: "number", required: true, description: "ID đối tác", defaultValue: 100234 },
              { name: "redirect_url", type: "string", required: true, description: "Link nhận kết quả callback", defaultValue: "https://your-erp.com/callback" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { auth_url: "https://partner.shopeemobile.com/api/v1/oauth/authorize?partner_id=100234&redirect=https://your-erp.com/callback" } }]
          }
        ]
      },
      {
        name: "Quản lý Sản phẩm",
        slug: "shopee-products",
        description: "Các API thêm mới, sửa thông tin sản phẩm, cập nhật tồn kho và giá bán trên Shopee.",
        endpoints: [
          {
            name: "Lấy danh sách sản phẩm Shopee",
            method: "GET",
            path: "/api/v1/shopee/products",
            description: "Lấy danh sách tóm tắt các sản phẩm đang hiển thị trên cửa hàng Shopee.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            queryParams: [
              { name: "page_size", type: "number", required: false, description: "Số lượng bản ghi trên trang", defaultValue: 20 },
              { name: "offset", type: "number", required: false, description: "Vị trí bắt đầu", defaultValue: 0 },
              { name: "item_status", type: "string", required: false, description: "NORMAL | BANNED | UNLIST", defaultValue: "NORMAL" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { item_list: [{ item_id: 1122, item_name: "Áo sơ mi Cotton", price: 250000, stock: 120 }], has_next_page: true } }]
          },
          {
            name: "Lấy chi tiết một sản phẩm",
            method: "GET",
            path: "/api/v1/shopee/products/detail",
            description: "Lấy toàn bộ thông tin chi tiết của một sản phẩm bao gồm SKUs, hình ảnh, phân loại và mô tả chi tiết.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            queryParams: [
              { name: "item_id", type: "number", required: true, description: "ID sản phẩm Shopee", defaultValue: 1122 }
            ],
            responses: [{ status: 200, description: "Thành công", body: { item_id: 1122, name: "Áo sơ mi Cotton", description: "Áo sơ mi chất liệu cotton mát mẻ", price: 250000, images: ["url_1", "url_2"] } }]
          },
          {
            name: "Tạo sản phẩm mới trên Shopee",
            method: "POST",
            path: "/api/v1/shopee/products/create",
            description: "Đăng tải sản phẩm mới lên sàn Shopee. Cần chọn đúng ngành hàng (Category) và cấu hình vận chuyển.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "name", type: "string", required: true, description: "Tên sản phẩm (40-120 ký tự)" },
              { name: "description", type: "string", required: true, description: "Mô tả sản phẩm" },
              { name: "category_id", type: "number", required: true, description: "ID danh mục ngành hàng Shopee", defaultValue: 10052 },
              { name: "price", type: "number", required: true, description: "Giá bán sản phẩm", defaultValue: 150000 }
            ],
            responses: [{ status: 200, description: "Tạo sản phẩm thành công", body: { item_id: 998822, status: "NORMAL", msg: "Đang chờ duyệt" } }]
          },
          {
            name: "Cập nhật thông tin sản phẩm",
            method: "PUT",
            path: "/api/v1/shopee/products/update",
            description: "Chỉnh sửa tên, mô tả và các thuộc tính cơ bản khác của sản phẩm.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "item_id", type: "number", required: true, description: "ID sản phẩm cần sửa", defaultValue: 1122 },
              { name: "name", type: "string", required: false, description: "Tên sản phẩm mới" },
              { name: "description", type: "string", required: false, description: "Mô tả mới" }
            ],
            responses: [{ status: 200, description: "Cập nhật thành công", body: { success: true, item_id: 1122 } }]
          },
          {
            name: "Cập nhật giá bán sản phẩm",
            method: "PUT",
            path: "/api/v1/shopee/products/price",
            description: "Thay đổi giá bán trực tiếp của sản phẩm hoặc phân loại SKU cụ thể.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "item_id", type: "number", required: true, description: "ID sản phẩm", defaultValue: 1122 },
              { name: "price_list", type: "array", required: true, description: "Danh sách giá mới của các SKU" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { success: true, updated_count: 1 } }]
          },
          {
            name: "Cập nhật số lượng tồn kho",
            method: "PUT",
            path: "/api/v1/shopee/products/stock",
            description: "Đồng bộ số lượng tồn kho của sản phẩm lên sàn Shopee.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "item_id", type: "number", required: true, description: "ID sản phẩm", defaultValue: 1122 },
              { name: "stock_list", type: "array", required: true, description: "Danh sách số lượng tồn của SKU" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { success: true, updated_count: 1 } }]
          },
          {
            name: "Xóa sản phẩm khỏi cửa hàng",
            method: "DELETE",
            path: "/api/v1/shopee/products/delete",
            description: "Xóa vĩnh viễn sản phẩm khỏi gian hàng Shopee.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            queryParams: [
              { name: "item_id", type: "number", required: true, description: "ID sản phẩm", defaultValue: 1122 }
            ],
            responses: [{ status: 200, description: "Xóa thành công", body: { success: true, msg: "Product has been deleted" } }]
          },
          {
            name: "Lấy danh mục ngành hàng Shopee",
            method: "GET",
            path: "/api/v1/shopee/products/categories",
            description: "Truy vấn danh sách tất cả các ngành hàng cùng ID tương ứng của sàn Shopee giúp chọn đúng danh mục khi đăng bán.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            responses: [{ status: 200, description: "Thành công", body: { categories: [{ category_id: 10052, parent_id: 0, display_name: "Thời Trang Nam" }, { category_id: 10053, parent_id: 10052, display_name: "Áo sơ mi" }] } }]
          }
        ]
      },
      {
        name: "Quản lý Đơn hàng",
        slug: "shopee-orders",
        description: "API lấy danh sách đơn hàng mới, thông tin chi tiết đơn hàng và xử lý vận chuyển.",
        endpoints: [
          {
            name: "Lấy danh sách đơn hàng Shopee",
            method: "GET",
            path: "/api/v1/shopee/orders",
            description: "Lấy danh sách tóm tắt các đơn hàng được tạo hoặc cập nhật trạng thái.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            queryParams: [
              { name: "time_from", type: "number", required: true, description: "Thời gian bắt đầu (Unix timestamp)", defaultValue: 1781570400 },
              { name: "time_to", type: "number", required: true, description: "Thời gian kết thúc (Unix timestamp)", defaultValue: 1781829600 }
            ],
            responses: [{ status: 200, description: "Thành công", body: { order_list: [{ order_sn: "260617SHOP009G", order_status: "READY_TO_SHIP" }] } }]
          },
          {
            name: "Lấy chi tiết một đơn hàng",
            method: "GET",
            path: "/api/v1/shopee/orders/detail",
            description: "Lấy toàn bộ thông tin chi tiết đơn hàng: họ tên người nhận, địa chỉ, sản phẩm mua và phí vận chuyển.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            queryParams: [
              { name: "order_sn", type: "string", required: true, description: "Mã vận đơn đơn hàng", defaultValue: "260617SHOP009G" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { order_sn: "260617SHOP009G", total_amount: 570000, recipient: { name: "Nguyễn Văn A", phone: "0901234567", address: "Hồ Chí Minh" } } }]
          },
          {
            name: "Xác nhận vận chuyển (Ship đơn)",
            method: "POST",
            path: "/api/v1/shopee/orders/ship",
            description: "Xác nhận với hệ thống Shopee đơn hàng đã được chuẩn bị xong và sẵn sàng bàn giao cho bưu tá.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "order_sn", type: "string", required: true, description: "Mã vận đơn đơn hàng", defaultValue: "260617SHOP009G" },
              { name: "shipping_carrier", type: "string", required: true, description: "Nhà vận chuyển", defaultValue: "SPX Express" }
            ],
            responses: [{ status: 200, description: "Xác nhận thành công", body: { success: true, tracking_number: "SPX_VN_998877" } }]
          },
          {
            name: "Yêu cầu hủy đơn hàng",
            method: "POST",
            path: "/api/v1/shopee/orders/cancel",
            description: "Hủy bỏ đơn hàng của khách do hết hàng hoặc lỗi đóng gói. Cần cung cấp lý do hủy.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "order_sn", type: "string", required: true, description: "Mã vận đơn đơn hàng", defaultValue: "260617SHOP009G" },
              { name: "cancel_reason", type: "string", required: true, description: "Lý do hủy đơn", defaultValue: "OUT_OF_STOCK" }
            ],
            responses: [{ status: 200, description: "Hủy đơn hàng thành công", body: { success: true, status: "CANCELLED" } }]
          },
          {
            name: "Xử lý Trả hàng / Hoàn tiền",
            method: "POST",
            path: "/api/v1/shopee/orders/refund_action",
            description: "Hành động duyệt hoặc khiếu nại yêu cầu hoàn tiền từ người mua trên Shopee.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "refund_id", type: "number", required: true, description: "ID yêu cầu hoàn tiền", defaultValue: 88992211 },
              { name: "action", type: "string", required: true, description: "ACCEPT | DISPUTE", defaultValue: "ACCEPT" }
            ],
            responses: [{ status: 200, description: "Thao tác thành công", body: { success: true, current_status: "REFUND_SUCCESS" } }]
          }
        ]
      },
      {
        name: "Chăm sóc Khách hàng & Chat",
        slug: "shopee-chat",
        description: "Các API hỗ trợ hệ thống Chat CSKH, lấy hội thoại và gửi tin nhắn tự động chăm sóc người mua hàng.",
        endpoints: [
          {
            name: "Lấy danh sách cuộc trò chuyện",
            method: "GET",
            path: "/api/v1/shopee/chat/conversations",
            description: "Lấy danh sách các cuộc hội thoại chat hiện tại của gian hàng.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            queryParams: [
              { name: "page_size", type: "number", required: false, description: "Số lượng hội thoại trên mỗi trang", defaultValue: 20 },
              { name: "next_timestamp", type: "number", required: false, description: "Timestamp phân trang" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { conversations: [{ conversation_id: "conv_shopee_8877", last_message_content: "Sản phẩm này còn hàng không shop?", unread_count: 1 }] } }]
          },
          {
            name: "Lấy danh sách tin nhắn chi tiết",
            method: "GET",
            path: "/api/v1/shopee/chat/messages",
            description: "Xem chi tiết luồng tin nhắn trao đổi trong một cuộc hội thoại cụ thể.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            queryParams: [
              { name: "conversation_id", type: "string", required: true, description: "ID cuộc trò chuyện", defaultValue: "conv_shopee_8877" },
              { name: "page_size", type: "number", required: false, description: "Số lượng tin nhắn", defaultValue: 15 }
            ],
            responses: [{ status: 200, description: "Thành công", body: { messages: [{ message_id: "msg_9988221", from_user: "buyer", content: "Sản phẩm này còn hàng không shop?", timestamp: 1781829600 }] } }]
          },
          {
            name: "Gửi tin nhắn văn bản (Text)",
            method: "POST",
            path: "/api/v1/shopee/chat/send",
            description: "Gửi phản hồi tin nhắn dạng văn bản hoặc tin nhắn mẫu tự động cho khách hàng.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "conversation_id", type: "string", required: true, description: "ID cuộc trò chuyện", defaultValue: "conv_shopee_8877" },
              { name: "text", type: "string", required: true, description: "Nội dung tin nhắn cần gửi", placeholder: "Chào bạn, sản phẩm này bên mình vẫn còn hàng ạ!" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { success: true, message_id: "msg_sent_00991a" } }]
          },
          {
            name: "Gửi ảnh vào cuộc trò chuyện",
            method: "POST",
            path: "/api/v1/shopee/chat/send_image",
            description: "Gửi hình ảnh đính kèm sản phẩm hoặc mã vận đơn trực tiếp cho khách qua khung chat.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "conversation_id", type: "string", required: true, description: "ID cuộc trò chuyện", defaultValue: "conv_shopee_8877" },
              { name: "image_url", type: "string", required: true, description: "Đường dẫn ảnh đã upload lên CDN của Shopee" }
            ],
            responses: [{ status: 200, description: "Gửi ảnh thành công", body: { success: true, message_id: "msg_img_7788a" } }]
          }
        ]
      },
      {
        name: "Quản lý Vận chuyển & Logistics",
        slug: "shopee-logistics",
        description: "API quản lý các đơn vị vận chuyển khả dụng, địa chỉ kho lấy hàng và in phiếu gửi hàng (Airway Bill).",
        endpoints: [
          {
            name: "Lấy danh sách ĐVVC khả dụng của Shop",
            method: "GET",
            path: "/api/v1/shopee/logistics/channel",
            description: "Truy xuất danh sách các nhà vận chuyển được kích hoạt trên gian hàng Shopee.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            responses: [{ status: 200, description: "Thành công", body: { channel_list: [{ channel_id: 80001, channel_name: "SPX Express", enabled: true }, { channel_id: 80002, channel_name: "Giao Hàng Nhanh", enabled: true }] } }]
          },
          {
            name: "Lấy thông tin và in nhãn vận chuyển",
            method: "POST",
            path: "/api/v1/shopee/logistics/airway_bill",
            description: "Lấy chuỗi base64 hoặc URL PDF của nhãn vận chuyển (phiếu gửi hàng) để in dán lên đơn hàng.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "order_sn_list", type: "array", required: true, description: "Danh sách mã vận đơn Shopee", defaultValue: ["260617SHOP009G"] }
            ],
            responses: [{ status: 200, description: "Thành công", body: { airway_bills: [{ order_sn: "260617SHOP009G", pdf_url: "https://airwaybill-cdn.shopee.vn/pdf/260617SHOP009G.pdf" }] } }]
          },
          {
            name: "Đăng ký bưu tá đến lấy hàng",
            method: "POST",
            path: "/api/v1/shopee/logistics/pickup",
            description: "Đặt lịch hẹn cho đơn vị vận chuyển tới kho của bạn để lấy các đơn hàng đã đóng gói sẵn.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "order_sn", type: "string", required: true, description: "Mã đơn hàng", defaultValue: "260617SHOP009G" },
              { name: "pickup_time_id", type: "string", required: true, description: "ID ca lấy hàng khả dụng", defaultValue: "ca_chieu_14h_17h" }
            ],
            responses: [{ status: 200, description: "Đăng ký thành công", body: { success: true, message: "Pickup scheduled successfully" } }]
          },
          {
            name: "Tra cứu hành trình vận đơn",
            method: "GET",
            path: "/api/v1/shopee/logistics/tracking",
            description: "API theo dõi trạng thái di chuyển thời gian thực của gói hàng qua hệ thống định vị.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            queryParams: [
              { name: "order_sn", type: "string", required: true, description: "Mã đơn hàng", defaultValue: "260617SHOP009G" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { tracking_history: [{ timestamp: 1781829600, status: "PICKED_UP", description: "Bưu tá đã lấy hàng thành công" }, { timestamp: 1781835000, status: "HUB_ARRIVED", description: "Hàng đã đến kho phân loại HCM Hub" }] } }]
          }
        ]
      },
      {
        name: "Khuyến mãi & Vouchers",
        slug: "shopee-marketing",
        description: "Các API cấu hình mã giảm giá (vouchers), khuyến mãi giảm giá trực tiếp trên sản phẩm cửa hàng.",
        endpoints: [
          {
            name: "Tạo mã giảm giá (Voucher) mới",
            method: "POST",
            path: "/api/v1/shopee/marketing/voucher",
            description: "Tạo chiến dịch mã giảm giá mới cho gian hàng của bạn.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "voucher_name", type: "string", required: true, description: "Tên chiến dịch Voucher" },
              { name: "voucher_code", type: "string", required: true, description: "4 ký tự viết hoa hậu tố mã voucher", defaultValue: "VANI" },
              { name: "discount_amount", type: "number", required: true, description: "Số tiền được giảm (đ)", defaultValue: 20000 },
              { name: "min_basket_price", type: "number", required: true, description: "Giá trị đơn hàng tối thiểu", defaultValue: 150000 }
            ],
            responses: [{ status: 200, description: "Tạo thành công", body: { voucher_id: 88771122, voucher_code: "SHOPEEVANI", success: true } }]
          },
          {
            name: "Lấy danh sách mã giảm giá",
            method: "GET",
            path: "/api/v1/shopee/marketing/vouchers",
            description: "Truy vấn danh sách các Voucher hiện tại và trạng thái chạy của chúng.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            queryParams: [
              { name: "status", type: "string", required: false, description: "ALL | UPCOMING | ONGOING | EXPIRED", defaultValue: "ONGOING" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { vouchers: [{ voucher_id: 88771122, voucher_name: "Giảm giá Vani", current_usage: 12, max_usage: 100 }] } }]
          },
          {
            name: "Tạo chương trình Flash Sale của Shop",
            method: "POST",
            path: "/api/v1/shopee/marketing/flash_sale",
            description: "Tạo sự kiện Flash Sale dành riêng cho shop tại các khung giờ vàng.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "name", type: "string", required: true, description: "Tên chương trình Flash Sale", defaultValue: "Flash Sale Nửa Đêm" },
              { name: "start_time", type: "number", required: true, description: "Unix timestamp bắt đầu", defaultValue: 1781836800 },
              { name: "end_time", type: "number", required: true, description: "Unix timestamp kết thúc", defaultValue: 1781844000 }
            ],
            responses: [{ status: 200, description: "Tạo thành công", body: { flash_sale_id: "9988a", success: true } }]
          },
          {
            name: "Cập nhật trạng thái chiến dịch khuyến mãi",
            method: "PUT",
            path: "/api/v1/shopee/marketing/promotion_status",
            description: "Tạm dừng hoặc kích hoạt lại một chiến dịch khuyến mãi của shop trước thời hạn kết thúc.",
            headers: [{ name: "Authorization", type: "string", required: true, description: "Access Token" }],
            requestBody: [
              { name: "promotion_id", type: "number", required: true, description: "ID chiến dịch khuyến mãi", defaultValue: 88771122 },
              { name: "action", type: "string", required: true, description: "ACTIVATE | DEACTIVATE", defaultValue: "DEACTIVATE" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { success: true, promotion_id: 88771122, status: "DEACTIVATED" } }]
          }
        ]
      }
    ]
  },
  {
    name: "TikTok Shop Open API v2",
    slug: "tiktok-shop-api",
    description: "Tài liệu kỹ thuật kết nối TikTok Shop Open Platform, quản lý sản phẩm, đơn hàng và vận chuyển tự động.",
    thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-dyu08fdyu08fdyu0-1781707324518.jpeg",
    overviews: [
      {
        title: "Tổng quan Tích hợp API TikTok Shop",
        slug: "tong-quan-tiktok-shop",
        description: "Tổng quan về mô hình kết nối của TikTok Shop Open Platform và cách cấu hình bảo mật.",
        content: `### Tổng quan Tích hợp API TikTok Shop

Chào mừng đến với tài liệu hướng dẫn kết nối API **TikTok Shop**. Hệ thống API này hỗ trợ đồng bộ kho hàng, sản phẩm, và cập nhật trạng thái đơn hàng trực tiếp sang TikTok Shop.

#### Cơ chế Xác thực
TikTok Shop sử dụng chuẩn xác thực **HMAC-SHA256** để ký (sign) mọi API request gửi lên, nhằm tránh việc giả mạo dữ liệu.

Các tham số bắt buộc trong query của mọi request bao gồm:
* \`app_key\`: Khóa định danh ứng dụng của bạn.
* \`timestamp\`: Thời gian thực thi request (Unix timestamp tính bằng giây).
* \`sign\`: Chuỗi chữ ký số được tạo từ URL path, các query parameters, và \`app_secret\`.

#### Các bước Tích hợp Nhanh
1. Tạo ứng dụng trên trang **TikTok Shop Partner Portal**.
2. Thiết lập cấu hình **Webhook** để nhận các sự kiện thay đổi trạng thái đơn hàng, trạng thái sản phẩm thời gian thực.
3. Chạy thử nghiệm bằng bộ dữ liệu mock trong trình **Playground** ở tab bên cạnh.

<Callout type="info">
  Hệ thống Webhook của TikTok Shop yêu cầu máy chủ của bạn phải phản hồi mã trạng thái HTTP \`200 OK\` trong vòng 3 giây, nếu không hệ thống sẽ thử gửi lại (retry) nhiều lần.
</Callout>`
      },
      {
        title: "Thuật toán Ký Request (HMAC-SHA256)",
        slug: "signature-tiktok-shop",
        description: "Chi tiết cách tạo tham số 'sign' bắt buộc cho mỗi request gửi lên TikTok Shop.",
        content: `### Thuật toán Ký Request TikTok Shop

Để bảo mật, mọi API request gọi tới TikTok Shop Open Platform đều cần chữ ký số ký bằng thuật toán **HMAC-SHA256** kết hợp với **App Secret**.

#### Các bước tạo Signature (\`sign\`)
1. **Lọc tham số**: Thu thập toàn bộ các tham số trong URL query (ngoại trừ tham số \`sign\` và \`access_token\`).
2. **Sắp xếp**: Sắp xếp các cặp key-value này theo thứ tự bảng chữ cái ASCII tăng dần.
3. **Nối chuỗi**: Nối các cặp key-value thành dạng \`key1value1key2value2...\`.
4. **Tạo chuỗi ký**: Chuỗi ký hoàn chỉnh được sinh từ:
   \`\`\`
   string_to_sign = app_secret + api_path + sorted_query_string + app_secret
   \`\`\`
5. **Ký số**: Sử dụng thuật toán HMAC-SHA256 để ký chuỗi \`string_to_sign\` bằng khóa bí mật \`app_secret\` và mã hóa sang dạng Hex.

#### Ví dụ mã nguồn TypeScript
\`\`\`typescript
import * as crypto from 'crypto';

export function signRequest(apiPath: string, queryParams: Record<string, string>, appSecret: string): string {
  const sortedKeys = Object.keys(queryParams).sort();
  let baseStr = sortedKeys.map(key => key + queryParams[key]).join('');
  const stringToSign = appSecret + apiPath + baseStr + appSecret;
  return crypto.createHmac('sha256', appSecret).update(stringToSign).digest('hex');
}
\`\`\``
      },
      {
        title: "Xử lý Lỗi & Mã Trạng thái (Error Codes)",
        slug: "error-codes-tiktok",
        description: "Danh sách các mã lỗi hệ thống và mã lỗi nghiệp vụ của TikTok Shop.",
        content: `### Danh mục Mã lỗi & Cách xử lý (Error Codes)

Hệ thống API TikTok Shop trả về mã lỗi thông qua cấu trúc JSON chuẩn:
\`\`\`json
{
  "code": 10002,
  "message": "Signature verification failed",
  "request_id": "req_5566aabb99ff0"
}
\`\`\`

#### Các mã lỗi hệ thống phổ biến
* **0**: Thành công.
* **10001**: \`Invalid App Key\` - Sai thông tin định danh ứng dụng.
* **10002**: \`Signature Verification Failed\` - Chữ ký không hợp lệ, hãy kiểm tra lại thuật toán sign.
* **10009**: \`Rate Limit Exceeded\` - Quá tần suất gọi tối đa cho phép.
* **10011**: \`Token Expired\` - Mã access_token hết hạn, cần gọi refresh token.

#### Các mã lỗi nghiệp vụ thường gặp
* **20004**: \`Warehouse Out Of Stock\` - Kho hàng của bạn không đủ số lượng để đồng bộ.
* **20015**: \`Price Out of Range\` - Giá cập nhật quá cao hoặc quá thấp so với giá trần sàn TikTok quy định.`
      },
      {
        title: "Tích hợp Webhook thời gian thực",
        slug: "webhook-tiktok",
        description: "Cấu hình Webhook nhận thông báo cập nhật đơn hàng, sản phẩm, và thanh toán.",
        content: `### Webhook đồng bộ sự kiện thời gian thực

TikTok Shop hỗ trợ hệ thống Webhook gửi thông báo dạng POST JSON sang hệ thống của bạn mỗi khi phát sinh thay đổi trên Shop.

#### Cấu hình Webhook URL
Bạn truy cập **TikTok Shop Partner Center**, thiết lập URL callback để nhận notification. Địa chỉ callback phải hỗ trợ SSL (\`https://\`).

#### Chi tiết sự kiện Webhook gửi sang
Ví dụ payload khi trạng thái đơn hàng thay đổi:
\`\`\`json
{
  "event": "order.status_update",
  "timestamp": 1781829600,
  "data": {
    "order_id": "5788910023457",
    "status": "READY_TO_SHIP",
    "update_time": 1781829600
  }
}
\`\`\`

#### Xác minh payload qua Chữ ký
Để ngăn chặn tấn công giả mạo webhook, hãy kiểm tra header \`Authorization\` gửi kèm từ TikTok Shop, chứa chữ ký số của payload.`
      }
    ],
    groups: [
      {
        name: "Ủy quyền Đối tác",
        slug: "tiktok-auth",
        description: "API quản lý phiên làm việc, tạo token ủy quyền giữa nền tảng và người bán TikTok Shop.",
        endpoints: [
          {
            name: "Tạo Token ủy quyền TikTok Shop",
            method: "POST",
            path: "/api/v2/tiktok/auth/token",
            description: "API lấy token truy cập hệ thống dành cho đối tác liên kết hoặc cửa hàng ủy quyền.",
            headers: [{ name: "Content-Type", type: "string", required: true, description: "Kiểu nội dung", defaultValue: "application/json" }],
            requestBody: [
              { name: "app_key", type: "string", required: true, description: "App Key của đối tác", placeholder: "e.g., 6h8k2s1p9z" },
              { name: "app_secret", type: "string", required: true, description: "App Secret bảo mật", placeholder: "e.g., sec_tiktok_xyz" },
              { name: "auth_code", type: "string", required: true, description: "Mã code ủy quyền", placeholder: "e.g., code_tiktok_auth_9922" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, message: "Success", data: { access_token: "access_token_tiktok_v2", refresh_token: "refresh_token_tiktok_v2", seller_name: "Thời Trang Vani Shop", seller_id: "VN_SELLER_4433" } } }]
          },
          {
            name: "Làm mới Access Token (Refresh Token)",
            method: "POST",
            path: "/api/v2/tiktok/auth/refresh",
            description: "Gia hạn access token mới bằng refresh token của TikTok Shop.",
            headers: [{ name: "Content-Type", type: "string", required: true, description: "Định dạng dữ liệu", defaultValue: "application/json" }],
            requestBody: [
              { name: "app_key", type: "string", required: true, description: "App Key đối tác" },
              { name: "app_secret", type: "string", required: true, description: "App Secret đối tác" },
              { name: "refresh_token", type: "string", required: true, description: "Refresh token cũ còn hạn" }
            ],
            responses: [{ status: 200, description: "Làm mới thành công", body: { code: 0, message: "Success", data: { access_token: "access_token_tiktok_new", refresh_token: "refresh_token_tiktok_new", expire_in: 86400 } } }]
          },
          {
            name: "Lấy danh sách cửa hàng đã ủy quyền",
            method: "GET",
            path: "/api/v2/tiktok/auth/authorized_shops",
            description: "Truy vấn danh sách tất cả các shop TikTok Shop mà nhà bán hàng đã ủy quyền cho tài khoản ứng dụng của bạn.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token", placeholder: "access_token_tiktok_..." }],
            queryParams: [
              { name: "app_key", type: "string", required: true, description: "App Key", defaultValue: "6h8k2s1p9z" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { shops: [{ shop_id: "VN_SHOP_9922", shop_name: "Vani Shop HN", region: "VN" }] } } }]
          },
          {
            name: "Kiểm tra hiệu lực Token",
            method: "GET",
            path: "/api/v2/tiktok/auth/check_token",
            description: "Kiểm tra xem Token ủy quyền của shop hiện tại còn hoạt động hay đã bị thu hồi hoặc hết hạn.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, message: "Token is active", data: { is_valid: true, expire_at: 1781829600 } } }]
          },
          {
            name: "Thu hồi ủy quyền kết nối Shop",
            method: "POST",
            path: "/api/v2/tiktok/auth/revoke_token",
            description: "Thu hồi vĩnh viễn liên kết kết nối của TikTok Shop trên tài khoản đối tác của bạn.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            requestBody: [
              { name: "shop_id", type: "string", required: true, description: "ID Shop cần thu hồi", defaultValue: "VN_SHOP_9922" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, message: "Revocation successful" } }]
          },
          {
            name: "Lấy liên kết ủy quyền người bán",
            method: "GET",
            path: "/api/v2/tiktok/auth/auth_url",
            description: "API lấy đường dẫn hướng người bán sang trang đăng nhập và ủy quyền chính thức của TikTok Shop.",
            queryParams: [
              { name: "app_key", type: "string", required: true, description: "App Key ứng dụng", defaultValue: "6h8k2s1p9z" },
              { name: "state", type: "string", required: false, description: "Chuỗi bảo mật CSRF", defaultValue: "random_state_123" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { auth_url: "https://auth.tiktok-shop.com/oauth/authorize?app_key=6h8k2s1p9z&state=random_state_123" } } }]
          }
        ]
      },
      {
        name: "Quản lý Kho & Sản phẩm",
        slug: "tiktok-products",
        description: "Các API đồng bộ sản phẩm, danh mục ngành hàng và quản lý kho hàng TikTok Shop.",
        endpoints: [
          {
            name: "Lấy danh sách sản phẩm TikTok Shop",
            method: "GET",
            path: "/api/v2/tiktok/products",
            description: "API kết nối đồng bộ danh sách sản phẩm hiện có trên giỏ hàng TikTok Shop.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            queryParams: [
              { name: "page_number", type: "number", required: false, description: "Số trang lấy dữ liệu", defaultValue: 1 },
              { name: "page_size", type: "number", required: false, description: "Số lượng sản phẩm mỗi trang", defaultValue: 10 },
              { name: "search_status", type: "number", required: false, description: "Lọc trạng thái: 1-Live, 2-Draft, 3-Failed", defaultValue: 1 }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { products: [{ id: "p_tiktok_998811", name: "Set 3 thỏi son môi nhung lỳ", price: 399000 }] } } }]
          },
          {
            name: "Lấy chi tiết một sản phẩm",
            method: "GET",
            path: "/api/v2/tiktok/products/detail",
            description: "Lấy chi tiết cấu trúc, danh mục, thuộc tính đặc thù và các SKUs của một sản phẩm trên TikTok Shop.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            queryParams: [
              { name: "product_id", type: "string", required: true, description: "ID sản phẩm", defaultValue: "p_tiktok_998811" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { product_id: "p_tiktok_998811", name: "Set 3 thỏi son môi nhung lỳ", brand: "EcoGlow", skus: [{ id: "sku_son_01", price: 399000, stock: 450 }] } } }]
          },
          {
            name: "Thêm sản phẩm mới lên TikTok Shop",
            method: "POST",
            path: "/api/v2/tiktok/products/create",
            description: "Upload sản phẩm mới lên TikTok Shop. Yêu cầu có hình ảnh, video (tùy chọn) và thông số kỹ thuật chuẩn chỉnh.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            requestBody: [
              { name: "name", type: "string", required: true, description: "Tên sản phẩm" },
              { name: "description", type: "string", required: true, description: "Mô tả sản phẩm" },
              { name: "category_id", type: "string", required: true, description: "ID danh mục ngành hàng", defaultValue: "cat_1005" },
              { name: "skus", type: "array", required: true, description: "Danh sách SKUs kèm giá và kho" }
            ],
            responses: [{ status: 200, description: "Tạo sản phẩm thành công", body: { code: 0, message: "Success", data: { product_id: "p_tiktok_new_5566" } } }]
          },
          {
            name: "Chỉnh sửa thông tin sản phẩm",
            method: "PUT",
            path: "/api/v2/tiktok/products/update",
            description: "Cập nhật các mô tả và hình ảnh của sản phẩm.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            requestBody: [
              { name: "product_id", type: "string", required: true, description: "ID sản phẩm", defaultValue: "p_tiktok_998811" },
              { name: "name", type: "string", required: false, description: "Tên sản phẩm mới" },
              { name: "description", type: "string", required: false, description: "Mô tả sản phẩm mới" }
            ],
            responses: [{ status: 200, description: "Cập nhật thành công", body: { code: 0, message: "Success", data: { product_id: "p_tiktok_998811" } } }]
          },
          {
            name: "Đồng bộ số lượng tồn kho theo Warehouse",
            method: "PUT",
            path: "/api/v2/tiktok/products/stock",
            description: "API cập nhật chính xác số lượng tồn kho cho các warehouse của TikTok Shop.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            requestBody: [
              { name: "product_id", type: "string", required: true, description: "ID sản phẩm", defaultValue: "p_tiktok_998811" },
              { name: "skus_stock", type: "array", required: true, description: "Danh sách SKU và tồn kho tương ứng với mã kho" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { updated: true } } }]
          },
          {
            name: "Lấy thuộc tính của danh mục sản phẩm",
            method: "GET",
            path: "/api/v2/tiktok/products/attributes",
            description: "Lấy các thuộc tính bắt buộc (ví dụ: hạn sử dụng, chất liệu) cần điền khi tạo sản phẩm cho từng danh mục riêng biệt.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            queryParams: [
              { name: "category_id", type: "string", required: true, description: "ID danh mục", defaultValue: "cat_1005" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { attributes: [{ id: "attr_100", name: "Chất liệu", is_required: true }] } } }]
          },
          {
            name: "Kích hoạt hoặc Vô hiệu hóa bán sản phẩm",
            method: "PUT",
            path: "/api/v2/tiktok/products/status",
            description: "API hỗ trợ tạm ngừng hiển thị bán (Deactivate) hoặc đăng bán trở lại (Activate) sản phẩm nhanh chóng.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            requestBody: [
              { name: "product_id", type: "string", required: true, description: "ID sản phẩm", defaultValue: "p_tiktok_998811" },
              { name: "status", type: "string", required: true, description: "ACTIVATE | DEACTIVATE", defaultValue: "DEACTIVATE" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, message: "Success", data: { product_id: "p_tiktok_998811", current_status: "DEACTIVATED" } } }]
          }
        ]
      },
      {
        name: "Quản lý Đơn hàng & Vận chuyển",
        slug: "tiktok-orders",
        description: "API xử lý đơn hàng, in nhãn vận chuyển và cập nhật trạng thái giao hàng.",
        endpoints: [
          {
            name: "Lấy danh sách đơn hàng TikTok Shop",
            method: "GET",
            path: "/api/v2/tiktok/orders",
            description: "Lấy danh sách các đơn hàng phát sinh trên TikTok Shop theo khoảng thời gian.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            queryParams: [
              { name: "page_size", type: "number", required: false, description: "Số lượng đơn/trang", defaultValue: 20 },
              { name: "order_status", type: "string", required: false, description: "AWAITING_SHIPMENT | SHIPPED | DELIVERED | CANCELLED", defaultValue: "AWAITING_SHIPMENT" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { orders: [{ order_id: "5788910023457", status: "AWAITING_SHIPMENT" }] } } }]
          },
          {
            name: "Lấy chi tiết một đơn hàng",
            method: "GET",
            path: "/api/v2/tiktok/orders/detail",
            description: "Lấy thông tin chi tiết một đơn hàng: sản phẩm mua, giá trị đơn, thông tin người nhận hàng.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            queryParams: [
              { name: "order_id", type: "string", required: true, description: "ID đơn hàng", defaultValue: "5788910023457" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { order_id: "5788910023457", payment_info: { total_amount: "399000", payment_method: "COD" } } } }]
          },
          {
            name: "Xác nhận và chuẩn bị vận chuyển",
            method: "POST",
            path: "/api/v2/tiktok/orders/ship",
            description: "Cập nhật trạng thái đơn hàng sang chuẩn bị bàn giao cho nhà vận chuyển.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            requestBody: [
              { name: "order_id", type: "string", required: true, description: "ID đơn hàng", defaultValue: "5788910023457" },
              { name: "shipment_provider_id", type: "string", required: true, description: "ID nhà vận chuyển", defaultValue: "sp_ghn_vn" },
              { name: "tracking_number", type: "string", required: true, description: "Mã vận đơn vận chuyển", placeholder: "e.g., VN_TRACKING_88776622" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, message: "Success", data: { order_id: "5788910023457", ship_status: "AWAITING_COLLECTION" } } }]
          },
          {
            name: "Tra cứu phí vận chuyển & nhà vận chuyển khả dụng",
            method: "GET",
            path: "/api/v2/tiktok/orders/search_shipping",
            description: "API lấy danh sách các đơn vị vận chuyển khả dụng và mức phí ước tính cho đơn hàng.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            queryParams: [
              { name: "order_id", type: "string", required: true, description: "ID đơn hàng", defaultValue: "5788910023457" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { shipping_providers: [{ provider_id: "sp_ghn_vn", provider_name: "Giao Hàng Nhanh", fee: 22000 }] } } }]
          },
          {
            name: "Xử lý yêu cầu hoàn tiền của khách",
            method: "POST",
            path: "/api/v2/tiktok/orders/refund",
            description: "Phê duyệt hoặc từ chối yêu cầu trả hàng hoàn tiền từ khách hàng.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            requestBody: [
              { name: "refund_id", type: "string", required: true, description: "ID yêu cầu hoàn tiền", defaultValue: "ref_112233" },
              { name: "action", type: "string", required: true, description: "Hành động: APPROVE | REJECT", defaultValue: "APPROVE" },
              { name: "reason", type: "string", required: false, description: "Lý do từ chối nếu action là REJECT" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { refund_id: "ref_112233", status: "REFUNDED" } } }]
          },
          {
            name: "In phiếu đóng gói (Packing List)",
            method: "GET",
            path: "/api/v2/tiktok/orders/packing_list",
            description: "Lấy link PDF chứa danh sách các sản phẩm cần nhặt và thông tin đóng gói tương ứng cho nhân viên thủ kho.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            queryParams: [
              { name: "order_ids", type: "array", required: true, description: "Mảng danh sách các ID đơn hàng cần in", defaultValue: ["5788910023457"] }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { pdf_url: "https://tiktokshop-labels.com/packing-lists/batch_998822.pdf" } } }]
          }
        ]
      },
      {
        name: "Khuyến mãi & Vouchers",
        slug: "tiktok-marketing",
        description: "Các API hỗ trợ tạo và quản lý các chương trình Flash Sale, chiến dịch Voucher giảm giá trên TikTok Shop.",
        endpoints: [
          {
            name: "Tạo chương trình giảm giá sản phẩm",
            method: "POST",
            path: "/api/v2/tiktok/marketing/discount",
            description: "Cấu hình giảm giá trực tiếp theo phần trăm hoặc số tiền cứng cho các sản phẩm.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            requestBody: [
              { name: "discount_name", type: "string", required: true, description: "Tên chương trình khuyến mãi", placeholder: "Flash Sale Cuối Tuần" },
              { name: "start_time", type: "number", required: true, description: "Timestamp bắt đầu" },
              { name: "end_time", type: "number", required: true, description: "Timestamp kết thúc" },
              { name: "product_list", type: "array", required: true, description: "Danh sách sản phẩm tham gia cùng mức giảm" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, message: "Success", data: { campaign_id: "camp_tiktok_7788aa" } } }]
          },
          {
            name: "Lấy danh sách chương trình khuyến mãi",
            method: "GET",
            path: "/api/v2/tiktok/marketing/discounts",
            description: "Truy vấn danh sách các chiến dịch khuyến mãi đang và sắp chạy của Shop.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            queryParams: [
              { name: "page_size", type: "number", required: false, description: "Kích thước trang", defaultValue: 20 }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { campaigns: [{ campaign_id: "camp_tiktok_7788aa", discount_name: "Flash Sale Cuối Tuần", status: "ONGOING" }] } } }]
          },
          {
            name: "Tạo mã giảm giá (Voucher) mới",
            method: "POST",
            path: "/api/v2/tiktok/marketing/voucher",
            description: "Tạo mã giảm giá công khai hoặc ẩn dành riêng cho luồng Livestream, Video Affiliate trên TikTok Shop.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            requestBody: [
              { name: "name", type: "string", required: true, description: "Tên mã Voucher", defaultValue: "Voucher Lên Xu Hướng" },
              { name: "voucher_type", type: "string", required: true, description: "PUBLIC | PRIVATE | LIVE_ONLY", defaultValue: "PUBLIC" },
              { name: "discount_value", type: "number", required: true, description: "Mức giảm (đ)", defaultValue: 50000 },
              { name: "min_spend", type: "number", required: true, description: "Đơn tối thiểu", defaultValue: 250000 }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { voucher_id: "vch_tt_778811", success: true } } }]
          },
          {
            name: "Hủy chiến dịch Voucher khuyến mãi",
            method: "DELETE",
            path: "/api/v2/tiktok/marketing/voucher",
            description: "Hủy chiến dịch mã giảm giá ngay lập tức, ngăn không cho khách hàng lưu và áp dụng mã.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            queryParams: [
              { name: "voucher_id", type: "string", required: true, description: "ID Voucher cần hủy", defaultValue: "vch_tt_778811" }
            ],
            responses: [{ status: 200, description: "Hủy thành công", body: { code: 0, message: "Success", data: { voucher_id: "vch_tt_778811", status: "CANCELLED" } } }]
          }
        ]
      },
      {
        name: "Tài chính & Đối soát",
        slug: "tiktok-finance",
        description: "API hỗ trợ tra cứu doanh thu, lấy lịch sử giao dịch và kết xuất báo cáo đối soát từ TikTok Shop.",
        endpoints: [
          {
            name: "Lấy danh sách giao dịch tài chính",
            method: "GET",
            path: "/api/v2/tiktok/finance/transactions",
            description: "Truy vấn chi tiết các giao dịch phát sinh như tiền đơn hàng, phí dịch vụ, phí sàn.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            queryParams: [
              { name: "time_from", type: "number", required: true, description: "Bắt đầu từ ngày" },
              { name: "time_to", type: "number", required: true, description: "Đến ngày" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { transactions: [{ transaction_id: "tx_tt_112233", amount: "350000", type: "ORDER_PAYMENT", created_time: 1781829600 }] } } }]
          },
          {
            name: "Lấy báo cáo đối soát doanh thu",
            method: "GET",
            path: "/api/v2/tiktok/finance/settlement",
            description: "Truy xuất danh sách các đợt đối soát tiền hàng đã quyết toán về tài khoản ngân hàng của Seller.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            queryParams: [
              { name: "settlement_id", type: "string", required: false, description: "Mã đợt đối soát" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { settlements: [{ settlement_id: "set_tt_9988", amount: "12500000", bank_name: "Vietcombank", status: "SETTLED" }] } } }]
          },
          {
            name: "Xem số dư ví rút tiền",
            method: "GET",
            path: "/api/v2/tiktok/finance/wallet",
            description: "Truy xuất số dư thực tế có thể thực hiện rút về tài khoản ngân hàng trong ngày.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { balance: "32850000", currency: "VND", pending_settlement: "15400000" } } }]
          },
          {
            name: "Gửi yêu cầu rút tiền về ngân hàng",
            method: "POST",
            path: "/api/v2/tiktok/finance/withdraw",
            description: "Gửi lệnh yêu cầu chuyển toàn bộ hoặc một phần số dư ví bán hàng về tài khoản ngân hàng liên kết.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            requestBody: [
              { name: "amount", type: "string", required: true, description: "Số tiền cần rút (VND)", defaultValue: "30000000" }
            ],
            responses: [{ status: 200, description: "Yêu cầu rút tiền đang được xử lý", body: { code: 0, data: { withdrawal_id: "wtd_tt_9988221", status: "PROCESSING", fee: "0" } } }]
          }
        ]
      },
      {
        name: "Chăm sóc Khách hàng",
        slug: "tiktok-chat",
        description: "Các API tích hợp hệ thống chat hỗ trợ khách hàng, gửi tin nhắn tự động khi có đơn hàng mới.",
        endpoints: [
          {
            name: "Lấy danh sách hội thoại",
            method: "GET",
            path: "/api/v2/tiktok/chat/conversations",
            description: "Truy xuất danh sách hội thoại chat với khách hàng trên gian hàng TikTok Shop.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            queryParams: [
              { name: "limit", type: "number", required: false, description: "Giới hạn số bản ghi", defaultValue: 20 }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { conversations: [{ conversation_id: "conv_tt_7788", customer_nickname: "Vanix Shop Fan", unread_count: 0 }] } } }]
          },
          {
            name: "Gửi tin nhắn văn bản",
            method: "POST",
            path: "/api/v2/tiktok/chat/send",
            description: "Gửi phản hồi tin nhắn tự động hoặc hỗ trợ khách hàng thủ công qua hệ thống ERP.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            requestBody: [
              { name: "conversation_id", type: "string", required: true, description: "ID hội thoại", defaultValue: "conv_tt_7788" },
              { name: "content", type: "string", required: true, description: "Nội dung tin nhắn gửi đi", placeholder: "Cảm ơn bạn đã mua hàng, đơn hàng của bạn đang được chuẩn bị!" }
            ],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, message: "Success", data: { message_id: "msg_tt_sent_9988" } } }]
          },
          {
            name: "Truy vấn tin nhắn chưa đọc",
            method: "GET",
            path: "/api/v2/tiktok/chat/unread_messages",
            description: "Truy xuất danh sách các tin nhắn chưa đọc mới nhất để hệ thống bot trả lời tự động xử lý ngay lập tức.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { unread_messages: [{ message_id: "msg_tt_8899a", conversation_id: "conv_tt_7788", content: "Shop ơi tư vấn size áo nam cao 1m75 nặng 70kg" }] } } }]
          },
          {
            name: "Đánh dấu cuộc hội thoại đã đọc",
            method: "PUT",
            path: "/api/v2/tiktok/chat/read_status",
            description: "Đồng bộ trạng thái đã đọc của hội thoại lên ứng dụng TikTok Shop sau khi nhân viên đã hỗ trợ khách hàng xong.",
            headers: [{ name: "x-tiktok-token", type: "string", required: true, description: "Access token" }],
            requestBody: [
              { name: "conversation_id", type: "string", required: true, description: "ID hội thoại cần cập nhật", defaultValue: "conv_tt_7788" }
            ],
            responses: [{ status: 200, description: "Đã cập nhật trạng thái đọc", body: { code: 0, message: "Success" } }]
          }
        ]
      }
    ]
  }
];
