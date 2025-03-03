import { Module } from './Module'

export const SystemFunction = {
  JournalVoucher: Module.GeneralLedger * 100 + 1,
  PriceListUpdate: Module.Inventory * 100 + 0,
  MaterialAdjustment: Module.Inventory * 100 + 1,
  MaterialTransfer: Module.Inventory * 100 + 2,
  StockCount: Module.Inventory * 100 + 3,
  AdjustmentCost: Module.Inventory * 100 + 4,
  Items: Module.Inventory * 100 + 6,
  MetalReceiptVoucher: Module.Financials * 100 + 0,
  PaymentVoucher: Module.Financials * 100 + 1,
  ReceiptVoucher: Module.Financials * 100 + 2,
  CreditNote: Module.Financials * 100 + 3,
  DebitNote: Module.Financials * 100 + 4,
  ServiceBill: Module.Financials * 100 + 5,
  ServiceInvoice: Module.Financials * 100 + 6,
  RecurringEntry: Module.Financials * 100 + 7,
  MetalPaymentVoucher: Module.Financials * 100 + 8,
  BalanceTransfer: Module.Financials * 100 + 9,
  BalanceTransferPurchase: Module.Financials * 100 + 10,
  BalanceTransferSales: Module.Financials * 100 + 11,
  FIAccounts: Module.Financials * 100 + 100,
  FIOpeningBalances: Module.Financials * 100 + 90,
  AssetTransfer: Module.FixedAssets * 100 + 1,
  CashIncrease: Module.Cash * 100 + 1,
  CashDecrease: Module.Cash * 100 + 2,
  CashTransfer: Module.Cash * 100 + 3,
  Assembly: Module.Manufacturing * 100 + 0,
  Disassembly: Module.Manufacturing * 100 + 10,
  ProductionOrder: Module.Manufacturing * 100 + 1,
  JobOrder: Module.Manufacturing * 100 + 2,
  Worksheet: Module.Manufacturing * 100 + 3,
  IssueOfMaterial: Module.Manufacturing * 100 + 4,
  JTCheckOut: Module.Manufacturing * 100 + 5,
  MaterialPlan: Module.Manufacturing * 100 + 7,
  Damage: Module.Manufacturing * 100 + 8,
  LeanProduction: Module.Manufacturing * 100 + 11,
  PurchaseRequisition: Module.Purchase * 100 + 0,
  PurchaseQuotation: Module.Purchase * 100 + 1,
  PurchaseOrder: Module.Purchase * 100 + 2,
  Shipment: Module.Purchase * 100 + 3,
  PurchaseInvoice: Module.Purchase * 100 + 4,
  PurchaseReturn: Module.Purchase * 100 + 5,
  SubsequentPurchaseDebit: Module.Purchase * 100 + 6,
  SubsequentPurchaseCredit: Module.Purchase * 100 + 7,
  ShipmentReturn: Module.Purchase * 100 + 8,
  SalesQuotation: Module.Sales * 100 + 0,
  SalesOrder: Module.Sales * 100 + 1,
  SalesInvoice: Module.Sales * 100 + 2,
  SalesReturn: Module.Sales * 100 + 3,
  SubsequentSalesDebit: Module.Sales * 100 + 4,
  SubsequentSalesCredit: Module.Sales * 100 + 5,
  ConsignmentOut: Module.Sales * 100 + 6,
  ConsignmentIn: Module.Sales * 100 + 7,
  DraftSerialsIn: Module.Sales * 100 + 8,
  DraftInvoiceReturn: Module.Sales * 100 + 9, //draft serial return
  Clients: Module.Sales * 100 + 40,
  ReurnOnInvoice: Module.Sales * 100 + 41,
  DeliveryOrder: Module.Delivery * 100 + 0,
  DeliveryReturn: Module.Delivery * 100 + 1,
  DeliveryTrip: Module.Delivery * 100 + 2,
  RecurringExpense: Module.RecurringExpenses * 100 + 0,
  CostAllocation: Module.CostAllocations * 100 + 0,
  RepairRequest: Module.RepairAndServices * 100 + 0,
  WorkOrder: Module.RepairAndServices * 100 + 1,
  Equipment: Module.RepairAndServices * 100 + 2,
  RetailInvoice: Module.PointOfSale * 100 + 0,
  RetailReturn: Module.PointOfSale * 100 + 1,
  RetailPurchase: Module.PointOfSale * 100 + 2,
  ChartOfAccounts: Module.GeneralLedger * 100 + 2,
  Assets: Module.FixedAssets * 100 + 0,
  AssetsDepreciation: Module.FixedAssets * 100 + 2,
  Employee: Module.HR * 100 + 0,
  MasterData: Module.BusinessPartner * 100 + 0,
  MeltingReq: Module.Foundry * 100 + 2,
  DraftTransfer: Module.Inventory * 100 + 5,
  Wax: Module.Foundry * 100 + 0,
  Casting: Module.Foundry * 100 + 1,
  WorkCenterConsumption: Module.Manufacturing * 100 + 9,
  SiteDashboard: Module.Inventory * 1000 + 225,
  MaterialRequest: Module.Replenishment * 100 + 1,
  MRP: Module.Replenishment * 100 + 2,
  LoanRequest: Module.Loans * 100 + 1,
  LeaveRequest: Module.LeaveReq * 100 + 1,
  ReturnFromLeave: Module.LeaveReq * 100 + 2,
  TimeVariation: Module.TimeAttendance * 100 + 1,
  DuringShiftLeave: Module.TimeAttendance * 100 + 2,
  ResignationRequest: Module.EmployeeProfile * 100 + 1,
  Penalty: Module.EmployeeProfile * 100 + 3,
  JobInfo: Module.EmployeeProfile * 100 + 4,
  PaymentOrder: Module.Financials * 100 + 12,
  CurrencyPurchase: Module.CurrencyTrading * 100 + 2,
  CurrencySale: Module.CurrencyTrading * 100 + 3,
  CurrencyCreditOrderPurchase: Module.CurrencyTrading * 100 + 4,
  CurrencyCreditOrderSale: Module.CurrencyTrading * 100 + 5,
  CreditInvoicePurchase: Module.CurrencyTrading * 100 + 6,
  CreditInvoiceSales: Module.CurrencyTrading * 100 + 7,
  KYC: Module.Remittance * 100 + 0,
  OutwardsOrder: Module.Remittance * 100 + 2,
  OutwardsModification: Module.Remittance * 100 + 4,
  CashCountTransaction: Module.CashCount * 100 + 1,
  InwardSettlement: Module.Remittance * 100 + 5,
  InwardTransfer: Module.Remittance * 100 + 3,
  OutwardsReturn: Module.Remittance * 100 + 6,
  ClientRelation: Module.Remittance * 100 + 1,
  RemittanceReceiptVoucher: Module.Remittance * 100 + 7,
  OutwardsTransfer: Module.Remittance * 100 + 8,
  ProductionSheet: Module.Manufacturing * 100 + 12,
  OutwardReturnSettlement: Module.Remittance * 100 + 9,
  DraftSerialsInvoice: Module.Sales * 100 + 8,
  CashTransfers: Module.Cash * 100 + 3,
  ModellingCasting: Module.Casting * 100 + 4
}

export const getSystemFunctionModule = functionId => {
  return Math.floor(functionId / 100)
}
