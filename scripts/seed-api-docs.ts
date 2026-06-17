import * as fs from "fs";
import * as path from "path";

// 1. Manually parse and load .env file variables to process.env
const envPath = path.join(__dirname, "../.env");
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

if (!process.env.APP_DATABASE_URI_VALUE) {
  console.error("Error: APP_DATABASE_URI_VALUE is not defined in .env");
  process.exit(1);
}

async function main() {
  try {
    console.log("Starting database seeding for 30 API Endpoints...");

    // Dynamically import database and schemas
    const { db } = await import("../src/server/db");
    const { apiProducts, apiOverviews, apiGroups, apiEndpoints } = await import("../src/server/db/schemas/api.schema");
    const { eq, inArray } = await import("drizzle-orm");

    const productSlugs = ["shopee-api", "tiktok-shop-api"];

    console.log("Cleaning up existing matching API products, overviews, groups, and endpoints...");
    const matchingGroups = await db
      .select({ id: apiGroups.id })
      .from(apiGroups)
      .where(inArray(apiGroups.apiType, productSlugs));

    const groupIds = matchingGroups.map(g => g.id);
    if (groupIds.length > 0) {
      await db.delete(apiEndpoints).where(inArray(apiEndpoints.groupId, groupIds));
    }

    await db.delete(apiOverviews).where(inArray(apiOverviews.apiType, productSlugs));
    await db.delete(apiGroups).where(inArray(apiGroups.apiType, productSlugs));
    await db.delete(apiProducts).where(inArray(apiProducts.slug, productSlugs));

    console.log("Cleanup finished. Seeding 2 API Products & Overviews...");

    // 1. Seed API Products
    const [shopeeProduct] = await db
      .insert(apiProducts)
      .values({
        name: "Shopee Open API Integration",
        slug: "shopee-api",
        description: "Hệ thống tài liệu tích hợp API Shopee Open Platform v2.0 dành cho Nhà bán hàng và Đối tác.",
        thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-rsd6trrsd6trrsd6-1781707168669.jpeg",
        order: 1,
      })
      .returning();

    const [tiktokProduct] = await db
      .insert(apiProducts)
      .values({
        name: "TikTok Shop Open API v2",
        slug: "tiktok-shop-api",
        description: "Tài liệu kỹ thuật kết nối TikTok Shop Open Platform, quản lý sản phẩm, đơn hàng và vận chuyển tự động.",
        thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-dyu08fdyu08fdyu0-1781707324518.jpeg",
        order: 2,
      })
      .returning();

    // 2. Seed API Overviews
    await db.insert(apiOverviews).values([
      {
        apiType: "shopee-api",
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
* **Môi trường Live (Production)**: \`https://partner.shopeemobile.com\``,
        metaTitle: "Tích hợp API Shopee - Shopee Open API Integration Guide",
        metaDescription: "Hướng dẫn đầy đủ về cách kết nối, ủy quyền cửa hàng và gọi API sàn TMĐT Shopee v2.0.",
        metaKeywords: "api shopee, shopee integration, shopee open API, ERP Shopee",
        isActive: true,
      },
      {
        apiType: "tiktok-shop-api",
        title: "Tài liệu tích hợp TikTok Shop v2",
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
</Callout>`,
        metaTitle: "Kết nối API TikTok Shop - TikTok Shop Open Platform Guide",
        metaDescription: "Hướng dẫn chi tiết tích hợp API TikTok Shop, cơ chế ký HMAC-SHA256 và cấu hình webhook đồng bộ đơn hàng.",
        metaKeywords: "api tiktokshop, tiktok shop integration, webhook tiktokshop, hmac-sha256",
        isActive: true,
      }
    ]);

    // 3. Seed API Groups for Shopee API
    const [shopeeAuthGroup] = await db
      .insert(apiGroups)
      .values({
        apiType: "shopee-api",
        name: "Xác thực & Ủy quyền",
        slug: "shopee-auth",
        description: "Các API phục vụ lấy access token, refresh token và quản lý quyền truy cập cửa hàng.",
        order: 1,
      })
      .returning();

    const [shopeeProductsGroup] = await db
      .insert(apiGroups)
      .values({
        apiType: "shopee-api",
        name: "Quản lý Sản phẩm",
        slug: "shopee-products",
        description: "Các API thêm mới, sửa thông tin sản phẩm, cập nhật tồn kho và giá bán trên Shopee.",
        order: 2,
      })
      .returning();

    const [shopeeOrdersGroup] = await db
      .insert(apiGroups)
      .values({
        apiType: "shopee-api",
        name: "Quản lý Đơn hàng",
        slug: "shopee-orders",
        description: "API lấy danh sách đơn hàng mới, thông tin chi tiết đơn hàng và xử lý vận chuyển.",
        order: 3,
      })
      .returning();

    // 4. Seed API Groups for TikTok Shop API
    const [tiktokAuthGroup] = await db
      .insert(apiGroups)
      .values({
        apiType: "tiktok-shop-api",
        name: "Ủy quyền Đối tác",
        slug: "tiktok-auth",
        description: "API quản lý phiên làm việc, tạo token ủy quyền giữa nền tảng và người bán TikTok Shop.",
        order: 1,
      })
      .returning();

    const [tiktokProductsGroup] = await db
      .insert(apiGroups)
      .values({
        apiType: "tiktok-shop-api",
        name: "Quản lý Kho & Sản phẩm",
        slug: "tiktok-products",
        description: "Các API đồng bộ sản phẩm, danh mục ngành hàng và quản lý kho hàng TikTok Shop.",
        order: 2,
      })
      .returning();

    const [tiktokOrdersGroup] = await db
      .insert(apiGroups)
      .values({
        apiType: "tiktok-shop-api",
        name: "Quản lý Đơn hàng & Vận chuyển",
        slug: "tiktok-orders",
        description: "API xử lý đơn hàng, in nhãn vận chuyển và cập nhật trạng thái giao hàng.",
        order: 3,
      })
      .returning();

    console.log("Seeding 30 Detailed API Endpoints...");

    // ====================================================
    // SHOPEE API ENDPOINTS (15 Endpoints)
    // ====================================================

    const shopeeEndpoints = [
      // --- Group: Xác thực & Ủy quyền (shopee-auth) ---
      {
        groupId: shopeeAuthGroup.id,
        name: "Lấy Access Token từ authorization code",
        method: "POST",
        path: "/api/v1/shopee/auth/token",
        description: "Lấy mã truy cập `access_token` và `refresh_token` sau khi người bán hoàn tất ủy quyền cửa hàng.",
        headers: [{ name: "Content-Type", type: "string" as const, required: true, description: "Định dạng dữ liệu yêu cầu", defaultValue: "application/json" }],
        queryParams: [
          { name: "partner_id", type: "number" as const, required: true, description: "ID đối tác do Shopee cấp", defaultValue: 100234 },
          { name: "timestamp", type: "number" as const, required: true, description: "Unix timestamp thực thi", defaultValue: Math.floor(Date.now() / 1000) }
        ],
        requestBody: [
          { name: "code", type: "string" as const, required: true, description: "Mã auth code nhận từ redirect" },
          { name: "shop_id", type: "number" as const, required: true, description: "ID của cửa hàng Shopee", defaultValue: 8877665 }
        ],
        responses: [{ status: 200, description: "Thành công", body: { access_token: "tok_shopee_9988ff", refresh_token: "ref_shopee_2233bb", expire_in: 14400, shop_id: 8877665 } }]
      },
      {
        groupId: shopeeAuthGroup.id,
        name: "Làm mới Access Token (Refresh Token)",
        method: "POST",
        path: "/api/v1/shopee/auth/refresh",
        description: "Sử dụng refresh token để gia hạn access token mới sau khi token cũ hết hạn (4 tiếng).",
        headers: [{ name: "Content-Type", type: "string" as const, required: true, description: "Định dạng dữ liệu", defaultValue: "application/json" }],
        queryParams: [
          { name: "partner_id", type: "number" as const, required: true, description: "ID đối tác", defaultValue: 100234 },
          { name: "timestamp", type: "number" as const, required: true, description: "Unix timestamp", defaultValue: Math.floor(Date.now() / 1000) }
        ],
        requestBody: [
          { name: "refresh_token", type: "string" as const, required: true, description: "Refresh token cũ còn hạn" },
          { name: "shop_id", type: "number" as const, required: true, description: "ID shop Shopee", defaultValue: 8877665 }
        ],
        responses: [{ status: 200, description: "Làm mới thành công", body: { access_token: "tok_shopee_new_99aa", refresh_token: "ref_shopee_new_22bb", expire_in: 14400 } }]
      },
      {
        groupId: shopeeAuthGroup.id,
        name: "Lấy thông tin chi tiết Shop",
        method: "GET",
        path: "/api/v1/shopee/auth/shop_info",
        description: "Truy vấn thông tin cấu hình cơ bản của Shop như tên shop, quốc gia, thời gian hết hạn ủy quyền.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token", placeholder: "Bearer tok_shopee_..." }],
        queryParams: [
          { name: "partner_id", type: "number" as const, required: true, description: "ID đối tác", defaultValue: 100234 },
          { name: "shop_id", type: "number" as const, required: true, description: "ID shop Shopee", defaultValue: 8877665 }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { shop_name: "Vani Store Shopee", country: "VN", status: "NORMAL", auth_time: 1781829600 } }]
      },

      // --- Group: Quản lý Sản phẩm (shopee-products) ---
      {
        groupId: shopeeProductsGroup.id,
        name: "Lấy danh sách sản phẩm Shopee",
        method: "GET",
        path: "/api/v1/shopee/products",
        description: "Lấy danh sách tóm tắt các sản phẩm đang hiển thị trên cửa hàng Shopee.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token", placeholder: "Bearer tok_shopee_..." }],
        queryParams: [
          { name: "page_size", type: "number" as const, required: false, description: "Số lượng bản ghi trên trang", defaultValue: 20 },
          { name: "offset", type: "number" as const, required: false, description: "Vị trí bắt đầu", defaultValue: 0 },
          { name: "item_status", type: "string" as const, required: false, description: "NORMAL | BANNED | UNLIST", defaultValue: "NORMAL" }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { item_list: [{ item_id: 1122, item_name: "Áo sơ mi Cotton", price: 250000, stock: 120 }], has_next_page: true } }]
      },
      {
        groupId: shopeeProductsGroup.id,
        name: "Lấy chi tiết một sản phẩm",
        method: "GET",
        path: "/api/v1/shopee/products/detail",
        description: "Lấy toàn bộ thông tin chi tiết của một sản phẩm bao gồm SKUs, hình ảnh, phân loại và mô tả chi tiết.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token" }],
        queryParams: [
          { name: "item_id", type: "number" as const, required: true, description: "ID sản phẩm Shopee", defaultValue: 1122 }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { item_id: 1122, name: "Áo sơ mi Cotton", description: "Áo sơ mi chất liệu cotton mát mẻ", price: 250000, images: ["url_1", "url_2"] } }]
      },
      {
        groupId: shopeeProductsGroup.id,
        name: "Tạo sản phẩm mới trên Shopee",
        method: "POST",
        path: "/api/v1/shopee/products/create",
        description: "Đăng tải sản phẩm mới lên sàn Shopee. Cần chọn đúng ngành hàng (Category) và cấu hình vận chuyển.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token" }],
        queryParams: [],
        requestBody: [
          { name: "name", type: "string" as const, required: true, description: "Tên sản phẩm (40-120 ký tự)" },
          { name: "description", type: "string" as const, required: true, description: "Mô tả sản phẩm" },
          { name: "category_id", type: "number" as const, required: true, description: "ID danh mục ngành hàng Shopee", defaultValue: 10052 },
          { name: "price", type: "number" as const, required: true, description: "Giá bán sản phẩm", defaultValue: 150000 }
        ],
        responses: [{ status: 200, description: "Tạo sản phẩm thành công", body: { item_id: 998822, status: "NORMAL", msg: "Đang chờ duyệt" } }]
      },
      {
        groupId: shopeeProductsGroup.id,
        name: "Cập nhật thông tin sản phẩm",
        method: "PUT",
        path: "/api/v1/shopee/products/update",
        description: "Chỉnh sửa tên, mô tả và các thuộc tính cơ bản khác của sản phẩm.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token" }],
        queryParams: [],
        requestBody: [
          { name: "item_id", type: "number" as const, required: true, description: "ID sản phẩm cần sửa", defaultValue: 1122 },
          { name: "name", type: "string" as const, required: false, description: "Tên sản phẩm mới" },
          { name: "description", type: "string" as const, required: false, description: "Mô tả mới" }
        ],
        responses: [{ status: 200, description: "Cập nhật thành công", body: { success: true, item_id: 1122 } }]
      },
      {
        groupId: shopeeProductsGroup.id,
        name: "Cập nhật giá bán sản phẩm",
        method: "PUT",
        path: "/api/v1/shopee/products/price",
        description: "Thay đổi giá bán trực tiếp của sản phẩm hoặc phân loại SKU cụ thể.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token" }],
        queryParams: [],
        requestBody: [
          { name: "item_id", type: "number" as const, required: true, description: "ID sản phẩm", defaultValue: 1122 },
          { name: "price_list", type: "array" as const, required: true, description: "Danh sách giá mới của các SKU" }
        ],
        responses: [{ status: 200, description: "Thành công", body: { success: true, updated_count: 1 } }]
      },
      {
        groupId: shopeeProductsGroup.id,
        name: "Cập nhật số lượng tồn kho",
        method: "PUT",
        path: "/api/v1/shopee/products/stock",
        description: "Đồng bộ số lượng tồn kho của sản phẩm lên sàn Shopee.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token" }],
        queryParams: [],
        requestBody: [
          { name: "item_id", type: "number" as const, required: true, description: "ID sản phẩm", defaultValue: 1122 },
          { name: "stock_list", type: "array" as const, required: true, description: "Danh sách số lượng tồn của SKU" }
        ],
        responses: [{ status: 200, description: "Thành công", body: { success: true, updated_count: 1 } }]
      },
      {
        groupId: shopeeProductsGroup.id,
        name: "Xóa sản phẩm khỏi cửa hàng",
        method: "DELETE",
        path: "/api/v1/shopee/products/delete",
        description: "Xóa vĩnh viễn sản phẩm khỏi gian hàng Shopee.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token" }],
        queryParams: [
          { name: "item_id", type: "number" as const, required: true, description: "ID sản phẩm", defaultValue: 1122 }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Xóa thành công", body: { success: true, msg: "Product has been deleted" } }]
      },

      // --- Group: Quản lý Đơn hàng (shopee-orders) ---
      {
        groupId: shopeeOrdersGroup.id,
        name: "Lấy danh sách đơn hàng Shopee",
        method: "GET",
        path: "/api/v1/shopee/orders",
        description: "Lấy danh sách tóm tắt các đơn hàng được tạo hoặc cập nhật trạng thái.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token" }],
        queryParams: [
          { name: "time_from", type: "number" as const, required: true, description: "Thời gian bắt đầu (Unix timestamp)", defaultValue: Math.floor(Date.now() / 1000) - 86400 * 3 },
          { name: "time_to", type: "number" as const, required: true, description: "Thời gian kết thúc (Unix timestamp)", defaultValue: Math.floor(Date.now() / 1000) }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { order_list: [{ order_sn: "260617SHOP009G", order_status: "READY_TO_SHIP" }] } }]
      },
      {
        groupId: shopeeOrdersGroup.id,
        name: "Lấy chi tiết một đơn hàng",
        method: "GET",
        path: "/api/v1/shopee/orders/detail",
        description: "Lấy toàn bộ thông tin chi tiết đơn hàng: họ tên người nhận, số điện thoại, địa chỉ, danh sách sản phẩm mua, đơn giá, tổng tiền và đơn vị vận chuyển.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token" }],
        queryParams: [
          { name: "order_sn", type: "string" as const, required: true, description: "Mã vận đơn đơn hàng", defaultValue: "260617SHOP009G" }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { order_sn: "260617SHOP009G", total_amount: 570000, recipient: { name: "Nguyễn Văn A", phone: "0901234567", address: "Hồ Chí Minh" } } }]
      },
      {
        groupId: shopeeOrdersGroup.id,
        name: "Xác nhận vận chuyển (Ship đơn)",
        method: "POST",
        path: "/api/v1/shopee/orders/ship",
        description: "Xác nhận với hệ thống Shopee đơn hàng đã được chuẩn bị xong và sẵn sàng bàn giao cho bưu tá.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token" }],
        queryParams: [],
        requestBody: [
          { name: "order_sn", type: "string" as const, required: true, description: "Mã vận đơn đơn hàng", defaultValue: "260617SHOP009G" },
          { name: "shipping_carrier", type: "string" as const, required: true, description: "Nhà vận chuyển", defaultValue: "SPX Express" }
        ],
        responses: [{ status: 200, description: "Xác nhận thành công", body: { success: true, tracking_number: "SPX_VN_998877" } }]
      },
      {
        groupId: shopeeOrdersGroup.id,
        name: "Tải nhãn dán vận chuyển (Air Waybill)",
        method: "GET",
        path: "/api/v1/shopee/orders/shipping_document",
        description: "Lấy liên kết tải về hoặc file PDF nhãn dán để in ra dán lên gói hàng.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token" }],
        queryParams: [
          { name: "order_sn", type: "string" as const, required: true, description: "Mã đơn hàng", defaultValue: "260617SHOP009G" }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { order_sn: "260617SHOP009G", pdf_url: "https://shopee.carrier.com/label/pdf_url" } }]
      },
      {
        groupId: shopeeOrdersGroup.id,
        name: "Hủy đơn hàng Shopee",
        method: "POST",
        path: "/api/v1/shopee/orders/cancel",
        description: "Hủy đơn hàng khi khách hàng yêu cầu hoặc khi phát sinh hết hàng.",
        headers: [{ name: "Authorization", type: "string" as const, required: true, description: "Access Token" }],
        queryParams: [],
        requestBody: [
          { name: "order_sn", type: "string" as const, required: true, description: "Mã đơn hàng", defaultValue: "260617SHOP009G" },
          { name: "cancel_reason", type: "string" as const, required: true, description: "Lý do hủy đơn", defaultValue: "OUT_OF_STOCK" }
        ],
        responses: [{ status: 200, description: "Hủy thành công", body: { success: true, order_sn: "260617SHOP009G", status: "CANCELLED" } }]
      }
    ];

    for (const ep of shopeeEndpoints) {
      await db.insert(apiEndpoints).values({
        groupId: ep.groupId,
        name: ep.name,
        method: ep.method,
        path: ep.path,
        description: ep.description,
        headers: ep.headers,
        queryParams: ep.queryParams,
        requestBody: ep.requestBody,
        responses: ep.responses,
        isActive: true,
      });
    }

    console.log("Seeded 15 Shopee API Endpoints.");

    // ====================================================
    // TIKTOK SHOP API ENDPOINTS (15 Endpoints)
    // ====================================================

    const tiktokEndpoints = [
      // --- Group: Ủy quyền Đối tác (tiktok-auth) ---
      {
        groupId: tiktokAuthGroup.id,
        name: "Tạo Token ủy quyền TikTok Shop",
        method: "POST",
        path: "/api/v2/tiktok/auth/token",
        description: "API lấy token truy cập hệ thống dành cho đối tác liên kết hoặc cửa hàng ủy quyền.",
        headers: [{ name: "Content-Type", type: "string" as const, required: true, description: "Kiểu nội dung", defaultValue: "application/json" }],
        queryParams: [],
        requestBody: [
          { name: "app_key", type: "string" as const, required: true, description: "App Key của đối tác", placeholder: "e.g., 6h8k2s1p9z" },
          { name: "app_secret", type: "string" as const, required: true, description: "App Secret bảo mật", placeholder: "e.g., sec_tiktok_xyz" },
          { name: "auth_code", type: "string" as const, required: true, description: "Mã code ủy quyền", placeholder: "e.g., code_tiktok_auth_9922" }
        ],
        responses: [{ status: 200, description: "Thành công", body: { code: 0, message: "Success", data: { access_token: "access_token_tiktok_v2", refresh_token: "refresh_token_tiktok_v2", seller_name: "Thời Trang Vani Shop", seller_id: "VN_SELLER_4433" } } }]
      },
      {
        groupId: tiktokAuthGroup.id,
        name: "Làm mới Access Token (Refresh Token)",
        method: "POST",
        path: "/api/v2/tiktok/auth/refresh",
        description: "Gia hạn access token mới bằng refresh token của TikTok Shop.",
        headers: [{ name: "Content-Type", type: "string" as const, required: true, description: "Định dạng dữ liệu", defaultValue: "application/json" }],
        queryParams: [],
        requestBody: [
          { name: "app_key", type: "string" as const, required: true, description: "App Key đối tác" },
          { name: "app_secret", type: "string" as const, required: true, description: "App Secret đối tác" },
          { name: "refresh_token", type: "string" as const, required: true, description: "Refresh token cũ còn hạn" }
        ],
        responses: [{ status: 200, description: "Làm mới thành công", body: { code: 0, message: "Success", data: { access_token: "access_token_tiktok_new", refresh_token: "refresh_token_tiktok_new", expire_in: 86400 } } }]
      },
      {
        groupId: tiktokAuthGroup.id,
        name: "Lấy danh sách cửa hàng đã ủy quyền",
        method: "GET",
        path: "/api/v2/tiktok/auth/authorized_shops",
        description: "Truy vấn danh sách tất cả các shop TikTok Shop mà nhà bán hàng đã ủy quyền cho tài khoản ứng dụng của bạn.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token", placeholder: "access_token_tiktok_..." }],
        queryParams: [
          { name: "app_key", type: "string" as const, required: true, description: "App Key", defaultValue: "6h8k2s1p9z" }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { shops: [{ shop_id: "VN_SHOP_9922", shop_name: "Vani Shop HN", region: "VN" }] } } }]
      },

      // --- Group: Quản lý Kho & Sản phẩm (tiktok-products) ---
      {
        groupId: tiktokProductsGroup.id,
        name: "Lấy danh sách sản phẩm TikTok Shop",
        method: "GET",
        path: "/api/v2/tiktok/products",
        description: "API kết nối đồng bộ danh sách sản phẩm hiện có trên giỏ hàng TikTok Shop.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token" }],
        queryParams: [
          { name: "page_number", type: "number" as const, required: false, description: "Số trang lấy dữ liệu", defaultValue: 1 },
          { name: "page_size", type: "number" as const, required: false, description: "Số lượng sản phẩm mỗi trang", defaultValue: 10 },
          { name: "search_status", type: "number" as const, required: false, description: "Lọc trạng thái: 1-Live, 2-Draft, 3-Failed", defaultValue: 1 }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { products: [{ id: "p_tiktok_998811", name: "Set 3 thỏi son môi nhung lỳ", price: 399000 }] } } }]
      },
      {
        groupId: tiktokProductsGroup.id,
        name: "Lấy chi tiết một sản phẩm",
        method: "GET",
        path: "/api/v2/tiktok/products/detail",
        description: "Lấy chi tiết cấu trúc, danh mục, thuộc tính đặc thù và các SKUs của một sản phẩm trên TikTok Shop.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token" }],
        queryParams: [
          { name: "product_id", type: "string" as const, required: true, description: "ID sản phẩm", defaultValue: "p_tiktok_998811" }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { product_id: "p_tiktok_998811", name: "Set 3 thỏi son môi nhung lỳ", brand: "EcoGlow", skus: [{ id: "sku_son_01", price: 399000, stock: 450 }] } } }]
      },
      {
        groupId: tiktokProductsGroup.id,
        name: "Thêm sản phẩm mới lên TikTok Shop",
        method: "POST",
        path: "/api/v2/tiktok/products/create",
        description: "Upload sản phẩm mới lên TikTok Shop. Yêu cầu có hình ảnh, video (tùy chọn) và thông số kỹ thuật chuẩn chỉnh.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token" }],
        queryParams: [],
        requestBody: [
          { name: "name", type: "string" as const, required: true, description: "Tên sản phẩm" },
          { name: "description", type: "string" as const, required: true, description: "Mô tả sản phẩm" },
          { name: "category_id", type: "string" as const, required: true, description: "ID danh mục ngành hàng", defaultValue: "cat_1005" },
          { name: "skus", type: "array" as const, required: true, description: "Danh sách SKUs kèm giá và kho" }
        ],
        responses: [{ status: 200, description: "Tạo sản phẩm thành công", body: { code: 0, message: "Success", data: { product_id: "p_tiktok_new_5566" } } }]
      },
      {
        groupId: tiktokProductsGroup.id,
        name: "Chỉnh sửa thông tin sản phẩm",
        method: "PUT",
        path: "/api/v2/tiktok/products/update",
        description: "Cập nhật các mô tả và hình ảnh của sản phẩm.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token" }],
        queryParams: [],
        requestBody: [
          { name: "product_id", type: "string" as const, required: true, description: "ID sản phẩm", defaultValue: "p_tiktok_998811" },
          { name: "name", type: "string" as const, required: false, description: "Tên sản phẩm mới" },
          { name: "description", type: "string" as const, required: false, description: "Mô tả sản phẩm mới" }
        ],
        responses: [{ status: 200, description: "Cập nhật thành công", body: { code: 0, message: "Success", data: { product_id: "p_tiktok_998811" } } }]
      },
      {
        groupId: tiktokProductsGroup.id,
        name: "Đồng bộ số lượng tồn kho theo Warehouse",
        method: "PUT",
        path: "/api/v2/tiktok/products/stock",
        description: "API cập nhật chính xác số lượng tồn kho cho các warehouse của TikTok Shop.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token" }],
        queryParams: [],
        requestBody: [
          { name: "product_id", type: "string" as const, required: true, description: "ID sản phẩm", defaultValue: "p_tiktok_998811" },
          { name: "skus_stock", type: "array" as const, required: true, description: "Danh sách SKU và tồn kho tương ứng với mã kho" }
        ],
        responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { updated: true } } }]
      },
      {
        groupId: tiktokProductsGroup.id,
        name: "Lấy danh sách ngành hàng (Categories)",
        method: "GET",
        path: "/api/v2/tiktok/products/categories",
        description: "Truy vấn danh sách tất cả các danh mục ngành hàng được hỗ trợ trên hệ thống TikTok Shop Việt Nam.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token" }],
        queryParams: [
          { name: "locale", type: "string" as const, required: false, description: "Mã ngôn ngữ", defaultValue: "vi-VN" }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { categories: [{ id: "cat_1005", parent_id: "0", name: "Sức khỏe & Sắc đẹp" }] } } }]
      },

      // --- Group: Quản lý Đơn hàng & Vận chuyển (tiktok-orders) ---
      {
        groupId: tiktokOrdersGroup.id,
        name: "Lấy danh sách đơn hàng TikTok Shop",
        method: "GET",
        path: "/api/v2/tiktok/orders",
        description: "Lấy danh sách các đơn hàng phát sinh trên TikTok Shop theo khoảng thời gian.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token" }],
        queryParams: [
          { name: "page_size", type: "number" as const, required: false, description: "Số lượng đơn/trang", defaultValue: 20 },
          { name: "order_status", type: "string" as const, required: false, description: "AWAITING_SHIPMENT | SHIPPED | DELIVERED | CANCELLED", defaultValue: "AWAITING_SHIPMENT" }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { orders: [{ order_id: "5788910023457", status: "AWAITING_SHIPMENT" }] } } }]
      },
      {
        groupId: tiktokOrdersGroup.id,
        name: "Lấy chi tiết một đơn hàng",
        method: "GET",
        path: "/api/v2/tiktok/orders/detail",
        description: "Lấy thông tin chi tiết một đơn hàng: sản phẩm mua, giá trị đơn, thông tin người nhận hàng.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token" }],
        queryParams: [
          { name: "order_id", type: "string" as const, required: true, description: "ID đơn hàng", defaultValue: "5788910023457" }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { order_id: "5788910023457", payment_info: { total_amount: "399000", payment_method: "COD" } } } }]
      },
      {
        groupId: tiktokOrdersGroup.id,
        name: "Xác nhận và chuẩn bị vận chuyển",
        method: "POST",
        path: "/api/v2/tiktok/orders/ship",
        description: "Cập nhật trạng thái đơn hàng sang chuẩn bị bàn giao cho nhà vận chuyển.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token" }],
        queryParams: [],
        requestBody: [
          { name: "order_id", type: "string" as const, required: true, description: "ID đơn hàng", defaultValue: "5788910023457" },
          { name: "shipment_provider_id", type: "string" as const, required: true, description: "ID nhà vận chuyển", defaultValue: "sp_ghn_vn" },
          { name: "tracking_number", type: "string" as const, required: true, description: "Mã vận đơn vận chuyển", placeholder: "e.g., VN_TRACKING_88776622" }
        ],
        responses: [{ status: 200, description: "Thành công", body: { code: 0, message: "Success", data: { order_id: "5788910023457", ship_status: "AWAITING_COLLECTION" } } }]
      },
      {
        groupId: tiktokOrdersGroup.id,
        name: "Tra cứu phí vận chuyển & nhà vận chuyển khả dụng",
        method: "GET",
        path: "/api/v2/tiktok/orders/search_shipping",
        description: "API lấy danh sách các đơn vị vận chuyển khả dụng và mức phí ước tính cho đơn hàng.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token" }],
        queryParams: [
          { name: "order_id", type: "string" as const, required: true, description: "ID đơn hàng", defaultValue: "5788910023457" }
        ],
        requestBody: [],
        responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { shipping_providers: [{ provider_id: "sp_ghn_vn", provider_name: "Giao Hàng Nhanh", fee: 22000 }] } } }]
      },
      {
        groupId: tiktokOrdersGroup.id,
        name: "Xử lý yêu cầu hoàn tiền của khách",
        method: "POST",
        path: "/api/v2/tiktok/orders/refund",
        description: "Phê duyệt hoặc từ chối yêu cầu trả hàng hoàn tiền từ khách hàng.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token" }],
        queryParams: [],
        requestBody: [
          { name: "refund_id", type: "string" as const, required: true, description: "ID yêu cầu hoàn tiền", defaultValue: "ref_112233" },
          { name: "action", type: "string" as const, required: true, description: "Hành động: APPROVE | REJECT", defaultValue: "APPROVE" },
          { name: "reason", type: "string" as const, required: false, description: "Lý do từ chối nếu action là REJECT" }
        ],
        responses: [{ status: 200, description: "Thành công", body: { code: 0, data: { refund_id: "ref_112233", status: "REFUNDED" } } }]
      },
      {
        groupId: tiktokOrdersGroup.id,
        name: "Đăng ký Webhook nhận sự kiện tự động",
        method: "POST",
        path: "/api/v2/tiktok/webhooks/register",
        description: "Đăng ký URL máy chủ của bạn để TikTok Shop tự động bắn thông tin đơn hàng, sản phẩm khi có thay đổi.",
        headers: [{ name: "x-tiktok-token", type: "string" as const, required: true, description: "Access token" }],
        queryParams: [],
        requestBody: [
          { name: "webhook_url", type: "string" as const, required: true, description: "Đường dẫn callback nhận Webhook", defaultValue: "https://my-erp.com/webhooks/tiktok" },
          { name: "event_types", type: "array" as const, required: true, description: "Danh sách các sự kiện muốn nhận (ORDER_STATUS_CHANGED, PRODUCT_STATUS_CHANGED)" }
        ],
        responses: [{ status: 200, description: "Đăng ký thành công", body: { code: 0, data: { webhook_id: "wh_tiktok_889977", status: "ACTIVE" } } }]
      }
    ];

    for (const ep of tiktokEndpoints) {
      await db.insert(apiEndpoints).values({
        groupId: ep.groupId,
        name: ep.name,
        method: ep.method,
        path: ep.path,
        description: ep.description,
        headers: ep.headers,
        queryParams: ep.queryParams,
        requestBody: ep.requestBody,
        responses: ep.responses,
        isActive: true,
      });
    }

    console.log("Seeded 15 TikTok Shop API Endpoints.");
    console.log("Database seeding for 30 Endpoints finished successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("Error seeding API Docs data:", error);
    process.exit(1);
  }
}

main();
