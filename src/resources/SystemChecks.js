import { Module } from './Module'

export const SystemChecks = {
  // global rules
  FORCE_DATE_REFERENCE_ORDER: Module.System * 100 + 1,
  ALLOW_DATE_EDITING: Module.System * 100 + 2,
  ALLOW_NAME_DUPLICATE: Module.System * 100 + 3,
  ALLOW_NO_CHILD_DATA: Module.System * 100 + 4,
  ALLOW_DOCUMENT_UNPOSTING: Module.System * 100 + 5,
  HIDE_LEADING_ZERO_DECIMALS: Module.System * 100 + 9,

  // limit data access
  LIMIT_DATA_ACCESS_SYSTEM_PLANT: Module.System * 100 + 50,
  LIMIT_DATA_ACCESS_DOCUMENT_TYPE: Module.System * 100 + 51,
  LIMIT_DATA_ACCESS_INVENTORY_SITE: Module.System * 100 + 52,

  // inventory checks
  ALLOW_INVENTORY_NEGATIVE_QTY: Module.Inventory * 100 + 1,
  ALLOW_INVENTORY_DUPLICATE_NAME: Module.Inventory * 100 + 2,
  ENABLE_IVMU_TRX: Module.Inventory * 100 + 3,
  ALLOW_PUIVC_MULTI_SITE: Module.Inventory * 100 + 4,
  ALLOW_SATRX_MULTI_SITE: Module.Inventory * 100 + 5,
  DEFAULT_QTY_PIECES: Module.Inventory * 100 + 9,

  // GL Checks
  ALLOW_GL_TRX_RATE_DISCREPENCY: Module.GeneralLedger * 100 + 1,

  // Delivery Orders
  ALLOW_DELIVERY_RETURN_OF_UNKNOWN_SKU: Module.Delivery * 100 + 1,

  //Purchase
  ENABLE_PURCHASE_TAX: Module.Purchase * 100 + 1,
  ALLOW_ITEM_CREATION_FROM_PURCHASE: Module.Purchase * 100 + 2,

  //Point of Sales
  POS_JUMP_TO_NEXT_LINE: Module.PointOfSale * 100 + 1,
  SINGLE_CASH_POS: Module.PointOfSale * 100 + 2,
  POS_SKU_DISABLE_LOOKUP: Module.PointOfSale * 100 + 3,
  ENABLE_RETAIL_SCALE_BARCODE: Module.PointOfSale * 100 + 6,

  CT_YAKEEN_INFORMATION: Module.CurrencyTrading * 100 + 5,
  CT_DISABLE_MOBILE_VERIFICATION: Module.CurrencyTrading * 100 + 4
}
