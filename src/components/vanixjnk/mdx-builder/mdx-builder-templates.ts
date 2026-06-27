import { MdxTemplate } from "./mdx-builder-types";

export const UI_COMPONENTS_TEMPLATES: MdxTemplate[] = [
  {
    name: "Thẻ Card",
    icon: "solar:box-minimalistic-line-duotone",
    description: "Khung Card chứa tiêu đề & nội dung",
    template: `<Card className="border-border/60 bg-card">
  <CardHeader>
    <CardTitle>Tiêu đề thẻ</CardTitle>
    <CardDescription>Mô tả ngắn của thẻ</CardDescription>
  </CardHeader>
  <CardContent>
    Nội dung chi tiết của thẻ nằm ở đây.
  </CardContent>
  <CardFooter>
    <Button size="sm">Nút hành động</Button>
  </CardFooter>
</Card>\n`
  },
  {
    name: "Cảnh báo Alert",
    icon: "solar:danger-triangle-line-duotone",
    description: "Hộp cảnh báo thông tin/lưu ý",
    template: `<Alert variant="default" className="border-vanixjnk/20 bg-vanixjnk/5 text-foreground my-4">
  <Icon icon="solar:info-square-line-duotone" className="size-5 text-vanixjnk" />
  <AlertTitle className="text-vanixjnk font-bold">Tiêu đề cảnh báo</AlertTitle>
  <AlertDescription>Nội dung chi tiết của cảnh báo này.</AlertDescription>
</Alert>\n`,
    variants: [
      {
        name: "Default Info",
        template: `<Alert variant="default" className="border-vanixjnk/20 bg-vanixjnk/5 text-foreground my-4">
  <Icon icon="solar:info-square-line-duotone" className="size-5 text-vanixjnk" />
  <AlertTitle className="text-vanixjnk font-bold">Thông tin</AlertTitle>
  <AlertDescription>Nội dung chi tiết của cảnh báo thông tin.</AlertDescription>
</Alert>\n`
      },
      {
        name: "Destructive",
        template: `<Alert variant="destructive" className="my-4">
  <Icon icon="solar:danger-triangle-line-duotone" className="size-5" />
  <AlertTitle className="font-bold">Cảnh báo lỗi</AlertTitle>
  <AlertDescription>Đã xảy ra lỗi nghiêm trọng hoặc hành động nguy hiểm cần lưu ý.</AlertDescription>
</Alert>\n`
      }
    ]
  },
  {
    name: "Accordion (Sập mở)",
    icon: "solar:alt-arrow-down-line-duotone",
    description: "Bộ câu hỏi FAQ sập mở tiện lợi",
    template: `<Accordion type="single" collapsible className="w-full border border-border/60 rounded-xl px-4 py-2 bg-muted/10">
  <AccordionItem value="item-1">
    <AccordionTrigger>Câu hỏi số 1?</AccordionTrigger>
    <AccordionContent>Nội dung câu trả lời số 1.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Câu hỏi số 2?</AccordionTrigger>
    <AccordionContent>Nội dung câu trả lời số 2.</AccordionContent>
  </AccordionItem>
</Accordion>\n`
  },
  {
    name: "Bộ Tabs",
    icon: "solar:folder-open-line-duotone",
    description: "Phân chia nội dung theo tab",
    template: `<Tabs defaultValue="tab1" className="w-full">
  <TabsList className="bg-muted/40 p-1">
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1" className="p-4 border rounded-xl mt-2">Nội dung của Tab 1</TabsContent>
  <TabsContent value="tab2" className="p-4 border rounded-xl mt-2">Nội dung của Tab 2</TabsContent>
</Tabs>\n`
  },
  {
    name: "Nút bấm Button",
    icon: "solar:add-circle-line-duotone",
    description: "Nút bấm hành động tương tác",
    template: `<Button variant="default">Button</Button>\n`,
    variants: [
      { name: "default", template: `<Button variant="default">Button</Button>\n` },
      { name: "vanixjnk", template: `<Button variant="vanixjnk">Button</Button>\n` },
      { name: "secondary", template: `<Button variant="secondary">Button</Button>\n` },
      { name: "outline", template: `<Button variant="outline">Button</Button>\n` },
      { name: "ghost", template: `<Button variant="ghost">Button</Button>\n` },
      { name: "destructive", template: `<Button variant="destructive">Button</Button>\n` },
      { name: "link", template: `<Button variant="link">Button</Button>\n` },
      { name: "success", template: `<Button variant="success">Button</Button>\n` },
      { name: "danger", template: `<Button variant="danger">Button</Button>\n` },
      { name: "warning", template: `<Button variant="warning">Button</Button>\n` },
      { name: "sky", template: `<Button variant="sky">Button</Button>\n` },
      { name: "fuschia", template: `<Button variant="fuschia">Button</Button>\n` },
      { name: "rose", template: `<Button variant="rose">Button</Button>\n` },
      { name: "indigo", template: `<Button variant="indigo">Button</Button>\n` },
      { name: "violet", template: `<Button variant="violet">Button</Button>\n` },
      { name: "orange", template: `<Button variant="orange">Button</Button>\n` },
      { name: "pink", template: `<Button variant="pink">Button</Button>\n` },
      { name: "lime", template: `<Button variant="lime">Button</Button>\n` },
      { name: "emerald", template: `<Button variant="emerald">Button</Button>\n` },
      { name: "teal", template: `<Button variant="teal">Button</Button>\n` },
      { name: "cyan", template: `<Button variant="cyan">Button</Button>\n` }
    ]
  },
  {
    name: "Nhãn Badge",
    icon: "solar:star-fall-line-duotone",
    description: "Huy hiệu/Nhãn đính kèm nhỏ gọn",
    template: `<Badge variant="outline" className="border-vanixjnk/30 text-vanixjnk bg-vanixjnk/5">Nhãn mác</Badge>\n`,
    variants: [
      { name: "default", template: `<Badge variant="default">Badge</Badge>\n` },
      { name: "secondary", template: `<Badge variant="secondary">Badge</Badge>\n` },
      { name: "destructive", template: `<Badge variant="destructive">Badge</Badge>\n` },
      { name: "danger", template: `<Badge variant="danger">Badge</Badge>\n` },
      { name: "success", template: `<Badge variant="success">Badge</Badge>\n` },
      { name: "outline", template: `<Badge variant="outline">Badge</Badge>\n` },
      { name: "ghost", template: `<Badge variant="ghost">Badge</Badge>\n` },
      { name: "link", template: `<Badge variant="link">Badge</Badge>\n` }
    ]
  },
  {
    name: "Công tắc Switch",
    icon: "solar:tuning-line-duotone",
    description: "Công tắc bật tắt trạng thái",
    template: `<Switch checked={true} />\n`
  },
  {
    name: "Tooltip (Gợi ý)",
    icon: "solar:info-circle-line-duotone",
    description: "Gợi ý hiển thị khi rê chuột",
    template: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Rê chuột vào đây</TooltipTrigger>
    <TooltipContent>Nội dung gợi ý hiển thị ở đây</TooltipContent>
  </Tooltip>
</TooltipProvider>\n`
  },
  {
    name: "Bố cục Grid",
    icon: "solar:widget-3-line-duotone",
    description: "Chia cột nội dung song song",
    template: `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
  <div>Cột trái</div>
  <div>Cột phải</div>
 </div>\n`
  },
  {
    name: "Đường kẻ Separator",
    icon: "solar:minimize-line-duotone",
    description: "Đường phân tách ngang thanh lịch",
    template: `<Separator className="my-4" />\n`
  },
  // === Mintlify-style Components ===
  {
    name: "Cây thư mục (Tree)",
    icon: "solar:folder-with-files-line-duotone",
    description: "Hiển thị cấu trúc thư mục dự án",
    template: `<Tree>
  <Tree.Folder name="src" defaultOpen>
    <Tree.Folder name="components">
      <Tree.File name="Button.tsx" />
      <Tree.File name="Card.tsx" />
    </Tree.Folder>
    <Tree.Folder name="lib">
      <Tree.File name="utils.ts" />
    </Tree.Folder>
    <Tree.File name="app.tsx" />
  </Tree.Folder>
  <Tree.File name="package.json" />
  <Tree.File name="tsconfig.json" />
</Tree>\n`
  },
  {
    name: "Nhóm mã (CodeGroup)",
    icon: "solar:programming-line-duotone",
    description: "Tabs chuyển đổi CLI (npm/pnpm/bun...)",
    template: "<CodeGroup>\n\n```bash npm\nnpm install package-name\n```\n\n```bash pnpm\nnpm install package-name\n```\n\n```bash bun\nbun install package-name\n```\n\n</CodeGroup>\n"
  },
  {
    name: "Các bước (Steps)",
    icon: "solar:sort-from-top-to-bottom-line-duotone",
    description: "Hướng dẫn từng bước tuần tự",
    template: `<Steps>
  <Step title="Bước 1: Cài đặt">
    Chạy lệnh cài đặt dependency cần thiết.
  </Step>
  <Step title="Bước 2: Cấu hình">
    Tạo file cấu hình và điền thông tin.
  </Step>
  <Step title="Bước 3: Khởi chạy">
    Khởi động ứng dụng để bắt đầu sử dụng.
  </Step>
</Steps>\n`
  },
  {
    name: "Callout (Mintlify)",
    icon: "solar:chat-round-call-line-duotone",
    description: "Hộp ghi chú: Note, Tip, Warning...",
    template: `<Note>Đây là ghi chú thông tin quan trọng cần lưu ý.</Note>\n`,
    variants: [
      { name: "Note", template: `<Note>Ghi chú thông tin.</Note>\n` },
      { name: "Tip", template: `<Tip>Mẹo hữu ích cho bạn.</Tip>\n` },
      { name: "Info", template: `<Info>Thông tin cần lưu ý.</Info>\n` },
      { name: "Warning", template: `<Warning>Cảnh báo cần chú ý!</Warning>\n` },
      { name: "Check", template: `<Check>Hoàn thành thành công.</Check>\n` },
      { name: "Danger", template: `<Danger>Hành động nguy hiểm!</Danger>\n` }
    ]
  },
  {
    name: "Bố cục Columns",
    icon: "solar:widget-2-line-duotone",
    description: "Chia cột theo kiểu Mintlify",
    template: `<Columns cols={2}>
  <Column>
    Nội dung cột trái
  </Column>
  <Column>
    Nội dung cột phải
  </Column>
</Columns>\n`
  }
];
