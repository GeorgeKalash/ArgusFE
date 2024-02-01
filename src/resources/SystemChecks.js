import { EnumSystemFunction } from "./EnumSystemFunction";

export const SystemChecks= {
    // global rules
    FORCE_DATE_REFERENCE_ORDER: EnumSystemFunction.Module.System * 100 + 1,
    ALLOW_DATE_EDITING: EnumSystemFunction.Module.System * 100 + 2,
    ALLOW_NAME_DUPLICATE: EnumSystemFunction.Module.System * 100 + 3,
    ALLOW_NO_CHILD_DATA: EnumSystemFunction.Module.System * 100 + 4,
    ALLOW_DOCUMENT_UNPOSTING: EnumSystemFunction.Module.System * 100 + 5,
    
    // limit data access
    LIMIT_DATA_ACCESS_SYSTEM_PLANT: EnumSystemFunction.Module.System * 100 + 50,
    LIMIT_DATA_ACCESS_DOCUMENT_TYPE: EnumSystemFunction.Module.System * 100 + 51,
    LIMIT_DATA_ACCESS_INVENTORY_SITE: EnumSystemFunction.Module.System * 100 + 52,

    // inventory checks
    ALLOW_INVENTORY_NEGATIVE_QTY: EnumSystemFunction.Module.Inventory * 100 + 1,
    ALLOW_INVENTORY_DUPLICATE_NAME: EnumSystemFunction.Module.Inventory * 100 + 2,
    ENABLE_IVMU_TRX: EnumSystemFunction.Module.Inventory * 100 + 3,
    ALLOW_PUIVC_MULTI_SITE: EnumSystemFunction.Module.Inventory * 100 + 4,
    ALLOW_SATRX_MULTI_SITE: EnumSystemFunction.Module.Inventory * 100 + 5,

    // GL Checks
    ALLOW_GL_TRX_RATE_DISCREPENCY: EnumSystemFunction.Module.GeneralLedger * 100 + 1,

    // Delivery Orders
    ALLOW_DELIVERY_RETURN_OF_UNKNOWN_SKU: EnumSystemFunction.Module.Delivery * 100 + 1,
    ENABLE_PURCHASE_TAX: EnumSystemFunction.Module.Purchase * 100 + 1,
    ALLOW_ITEM_CREATION_FROM_PURCHASE: EnumSystemFunction.Module.Purchase * 100 + 2,
    POS_JUMP_TO_NEXT_LINE: EnumSystemFunction.Module.PointOfSale * 100 + 1,
    SINGLE_CASH_POS: EnumSystemFunction.Module.PointOfSale * 100 + 2,
    POS_SKU_DISABLE_LOOKUP: EnumSystemFunction.Module.PointOfSale * 100 + 3,
};