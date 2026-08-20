import type { WidgetLayoutItem } from "../../db/schema";

export const DEFAULT_ACCENT = "orange";

export const DEFAULT_LAYOUT_LG: WidgetLayoutItem[] = [
  { i: "total-assets", type: "total-assets", x: 0, y: 0, w: 4, h: 6 },
  { i: "net-income", type: "net-income", x: 4, y: 0, w: 4, h: 6 },
  { i: "allocation", type: "allocation", x: 8, y: 0, w: 4, h: 14 },
  { i: "expenses", type: "expenses", x: 0, y: 6, w: 8, h: 8 },
  { i: "mini-cash", type: "mini-cash", x: 0, y: 14, w: 3, h: 5 },
  { i: "mini-stocks", type: "mini-stocks", x: 3, y: 14, w: 3, h: 5 },
  { i: "mini-funds", type: "mini-funds", x: 6, y: 14, w: 3, h: 5 },
  { i: "mini-crypto", type: "mini-crypto", x: 9, y: 14, w: 3, h: 5 },
];

export const DEFAULT_LAYOUT_MD: WidgetLayoutItem[] = [
  { i: "total-assets", type: "total-assets", x: 0, y: 0, w: 4, h: 6 },
  { i: "net-income", type: "net-income", x: 4, y: 0, w: 4, h: 6 },
  { i: "allocation", type: "allocation", x: 0, y: 6, w: 8, h: 10 },
  { i: "expenses", type: "expenses", x: 0, y: 16, w: 8, h: 8 },
  { i: "mini-cash", type: "mini-cash", x: 0, y: 24, w: 4, h: 5 },
  { i: "mini-stocks", type: "mini-stocks", x: 4, y: 24, w: 4, h: 5 },
  { i: "mini-funds", type: "mini-funds", x: 0, y: 29, w: 4, h: 5 },
  { i: "mini-crypto", type: "mini-crypto", x: 4, y: 29, w: 4, h: 5 },
];
