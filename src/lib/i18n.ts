export type Language = 'en' | 'zh';

export const dict: Record<Language, Record<string, Record<string, string>>> = {
  en: {
    login: { portal: "Ali Mobile Pos Portal", subtitle: "Sign in to continue", user: "Username", pass: "Password", enterUser: "Enter your username", enterPass: "Enter your password", btn: "Access Terminal", errBase: "Please enter both fields", errUser: "Invalid username or password" },
    nav: { terminal: "Terminal", inventory: "Inventory", reports: "Sales Report", customers: "Customers", settings: "Settings", out: "Sign Out", pos: "Ali Mobile Repair POS", guest: "Guest", staff: "Staff" },
    term: { title: "Terminal Console", sub: "Select components or services to add to current transaction.", search: "Search products by name...", catAll: "All Items", brandAll: "All Brands", modelAll: "All Models", cart: "Current Cart", empty: "Your cart is empty", subtotal: "Subtotal (Excl. GST)", tax: "GST (10%)", total: "Total Amount", confirm: "Confirm", checkout: "Complete Order", cancel: "Cancel", cash: "Cash", eftpos: "EFTPOS (+1.5%)", surcharge: "EFTPOS Surcharge (1.5%)", outofstock: "Out of stock:", limit: "Stock limit reached for", success: "Transaction successful!", fail: "Transaction failed. Please try again.", generatePDF: "Download PDF Invoice", saveShare: "Save / Share PDF", printReceipt: "Print Receipt", generating: "Generating PDF...", printTitle: "Print/Download Invoice", refundBtn: "Refund Order", refundConfirm: "Are you sure you want to refund this order? It will be removed from all total calculations.", refundSuccess: "Order successfully refunded!" },
    inv: { title: "Inventory Management", sub: "Manage spare parts, device stock, and pricing tiers.", search: "Search SKU, name...", addUrl: "Add New Item", filterAll: "All Parts", filterLow: "Low Stock", filterDev: "Devices", filterModel: "Filter By Model", itemDet: "Item Details", brand: "Device Brand", model: "Device Model", name: "Item Name", cat: "Brand / Main Category", qty: "Quantity", minStock: "Min Stock", cost: "Cost Price", sell: "Selling Price", save: "Save To Inventory", update: "Update Item", discard: "Discard", addBrand: "New brand name...", addCat: "New category name...", recent: "Recently Used Parts" }
  },
  zh: {
    login: { portal: "Ali 手机维修收银系统", subtitle: "请登录以继续", user: "用户名", pass: "密码", enterUser: "输入您的用户名", enterPass: "输入您的密码", btn: "登录进入系统", errBase: "请输入账号和密码", errUser: "用户或密码错误" },
    nav: { terminal: "收银终端", inventory: "库存管理", reports: "财务报表", customers: "客户管理", settings: "系统设置", out: "退出登录", pos: "Ali 手机收银 POS", guest: "访客", staff: "收银员" },
    term: { title: "收银台", sub: "选择要添加到当前交易的产品或维修服务。", search: "通过名称、型号或 SKU 搜索产品...", catAll: "全部商品", brandAll: "所有品牌", modelAll: "所有型号", cart: "当前购物车", empty: "购物车为空", subtotal: "小计 (不含税)", tax: "消费税 (10%)", total: "实际付款金额", confirm: "确认收银", checkout: "完成并结算订单", cancel: "取消撤回", cash: "现金支付", eftpos: "刷卡支付 (+1.5%)", surcharge: "刷卡手续费 (1.5%)", outofstock: "库存不足:", limit: "达到库存上限:", success: "交易成功结算！", fail: "交易失败，请重试。", generatePDF: "直接保存下载电子发票 (PDF)", saveShare: "立刻保存 / 分享发票", printReceipt: "立刻打印实体热敏小票", generating: "正在为您生成PDF...", printTitle: "保存发票/打印小票", refundBtn: "修改此单为退款 (Refund)", refundConfirm: "您确定要将此订单全额退款吗？退款后它将从营业额底池中消失，但该记录依然会被保留留底。", refundSuccess: "订单退款状态已顺利更新！" },
    inv: { title: "库存管理系统", sub: "管理维修零件、设备库存和定价等级。", search: "搜索 SKU、名称、型号...", addUrl: "添加新产品", filterAll: "全部商品", filterLow: "库存预警", filterDev: "现有设备", filterModel: "按型号筛选", itemDet: "产品详情配置", brand: "手机设备品牌", model: "匹配设备型号", name: "产品/项目名称", cat: "所属主要分类", qty: "当前库存数量", minStock: "最低库存预警值", cost: "成本价格", sell: "最终售出价格", save: "保存并加入库存", update: "更新修改此商品", discard: "放弃修改", addBrand: "输入新品牌名称...", addCat: "输入新类别名称...", recent: "最近常常使用的零件" }
  }
};

export const getTranslation = (lang: Language) => {
  return (section: string, key: string) => {
    return dict[lang]?.[section]?.[key] || key;
  };
};
