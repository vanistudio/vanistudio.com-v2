export type MdxToken = 
  | { type: "tag-start"; name: string; props: Record<string, any>; selfClosing: boolean }
  | { type: "tag-end"; name: string }
  | { type: "text"; content: string };

export interface MdxTemplate {
  name: string;
  icon: string;
  description: string;
  template: string;
  variants?: { name: string; template: string }[];
}

export interface MdxASTNode {
  type: "tag" | "text";
  name?: string;
  props?: Record<string, any>;
  children?: MdxASTNode[];
  content?: string;
}
