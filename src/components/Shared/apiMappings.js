import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import { FixedAssetsRepository } from 'src/repositories/FixedAssetsRepository'
import { StockCountRepository } from 'src/repositories/StockCountRepository'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'
import { POSRepository } from 'src/repositories/POSRepository'

export const COMBOBOX = 1

export const LOOKUP = 2

export const apiMappings = {
  0: {
    type: COMBOBOX
  },
  [ResourceIds.NumberRange]: {
    type: COMBOBOX,
    endpoint: SystemRepository.Currency.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.FiscalYears]: {
    type: COMBOBOX,
    endpoint: SystemRepository.FiscalYears.qry,
    valueField: 'fiscalYear',
    displayField: 'fiscalYear'
  },
  [ResourceIds.CashAccount]: {
    type: LOOKUP,
    endpoint: CashBankRepository.CashAccount.snapshot,
    parameters: {
      _type: 0
    },
    valueField: 'reference',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%'
  },
  [ResourceIds.Category]: {
    //Item Category
    type: COMBOBOX,
    endpoint: InventoryRepository.Category.qry,
    parameters: '_startAt=0&_pageSize=1000&_name=',
    valueField: 'recordId',
    displayField: ['caRef', 'name'],
    columnsInDropDown: [
      { key: 'caRef', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.InventoryGroup]: {
    //Item Group
    type: COMBOBOX,
    endpoint: InventoryRepository.Group.qry,
    parameters: '_startAt=0&_pageSize=1000',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Measurement]: {
    //"Measurement Schedule"
    type: COMBOBOX,
    endpoint: InventoryRepository.Measurement.qry,
    parameters: '_name=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.ProductionLines]: {
    type: COMBOBOX,
    endpoint: ManufacturingRepository.ProductionLine.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Accounts]: {
    type: LOOKUP,
    endpoint: FinancialRepository.Account.snapshot,
    valueField: 'reference',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%'
  },
  [ResourceIds.DocumentTypes]: {
    type: COMBOBOX,
    endpoint: SystemRepository.DocumentType.qry,
    parameters: '_startAt=0&_pageSize=2000', //_dgId appended
    valueField: 'recordId',
    displayField: 'name',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Plants]: {
    type: COMBOBOX,
    endpoint: SystemRepository.Plant.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.States]: {
    type: COMBOBOX,
    endpoint: SystemRepository.State.qry,
    parameters: '_countryId=0',
    valueField: 'recordId',
    displayField: 'name'
  },
  [ResourceIds.Cities]: {
    type: LOOKUP,
    endpoint: SystemRepository.City.snapshot,
    parameters: {
      _filter: '',
      _countryId: 0,
      _stateId: 0
    },
    valueField: 'reference',
    valueOnSelection: 'recordId',
    displayField: 'name'
  },
  [ResourceIds.Groups]: {
    type: COMBOBOX,
    endpoint: BusinessPartnerRepository.Group.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Users]: {
    type: COMBOBOX,
    endpoint: SystemRepository.Users.qry,
    parameters: '_startAt=0&_filter=&_size=1000&_sortBy=fullName',
    valueField: 'recordId',
    displayField: ['fullName', 'email'],
    columnsInDropDown: [
      { key: 'fullName', value: 'Full Name' },
      { key: 'email', value: 'Email' }
    ]
  },
  [ResourceIds.GLAccountGroups]: {
    type: COMBOBOX,
    endpoint: GeneralLedgerRepository.GLAccountGroups.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.CostCenter]: {
    type: COMBOBOX,
    endpoint: GeneralLedgerRepository.CostCenter.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Cities]: {
    type: LOOKUP,
    endpoint: SystemRepository.City.snapshot,
    parameters: {
      _countryId: 0,
      _stateId: 0
    },
    valueField: 'accountRef',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%'
  },
  [ResourceIds.FlAccountGroups]: {
    type: COMBOBOX,
    endpoint: FinancialRepository.Group.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.ExchangeTables]: {
    type: COMBOBOX,
    endpoint: MultiCurrencyRepository.ExchangeTable.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.PlantGroups]: {
    type: COMBOBOX,
    endpoint: SystemRepository.PlantGroup.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.LoCarriers]: {
    type: COMBOBOX,
    endpoint: LogisticsRepository.LoCarrier.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  /* [ResourceIds.Module]: {
    //CHECK SPECIAL
    type: COMBOBOX,
    endpoint: LogisticsRepository.LoCarrier.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  }, */
  [ResourceIds.NotificationGroups]: {
    type: COMBOBOX,
    endpoint: AccessControlRepository.NotificationGroup.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.FinancialStatements]: {
    type: COMBOBOX,
    endpoint: FinancialStatementRepository.FinancialStatement.qry,
    valueField: 'recordId',
    displayField: ['name'],
    columnsInDropDown: [{ key: 'name', value: 'Name' }]
  },
  [ResourceIds.ChartOfAccounts]: {
    type: LOOKUP,
    endpoint: GeneralLedgerRepository.ChartOfAccounts.snapshot,
    valueField: 'accountRef',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%'
  },
  [ResourceIds.FIAgingProfile]: {
    type: COMBOBOX,
    endpoint: FinancialRepository.AgingProfile.qry,
    valueField: 'recordId',
    displayField: ['name'],
    columnsInDropDown: [{ key: 'name', value: 'Name' }]
  },
  [ResourceIds.Sites]: {
    type: COMBOBOX,
    endpoint: InventoryRepository.Site.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Item]: {
    type: LOOKUP,
    endpoint: InventoryRepository.Item.snapshot,
    valueField: 'sku',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%'
  },
  [ResourceIds.WorkCenters]: {
    type: COMBOBOX,
    endpoint: ManufacturingRepository.WorkCenter.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Overhead]: {
    type: LOOKUP,
    endpoint: ManufacturingRepository.Overhead.snapshot,
    valueField: 'reference',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%'
  },
  [ResourceIds.Machines]: {
    type: COMBOBOX,
    endpoint: ManufacturingRepository.Machine.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.VendorGroups]: {
    type: COMBOBOX,
    endpoint: PurchaseRepository.VendorGroups.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Vendor]: {
    type: LOOKUP,
    endpoint: PurchaseRepository.Vendor.snapshot,
    valueField: 'reference',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' },
      { key: 'flName', value: 'Foreign Language' }
    ]
  },
  [ResourceIds.PurchaseInvoices]: {
    type: LOOKUP,
    endpoint: PurchaseRepository.PurchaseInvoiceHeader.snapshot,
    parameters: {
      _functionId: 0
    },
    valueOnSelection: 'recordId',
    valueField: 'reference',
    secondValueShow: false,
    displayFieldWidth: 2,
    firstFieldWidth: '40%'
  },
  [ResourceIds.Expense_Types]: {
    type: LOOKUP,
    endpoint: FinancialRepository.ExpenseTypes.snapshot,
    valueField: 'reference',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%'
  },
  [ResourceIds.PriceLevels]: {
    type: COMBOBOX,
    endpoint: SaleRepository.PriceLevel.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.PaymentTerm]: {
    type: COMBOBOX,
    endpoint: SaleRepository.PaymentTerms.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.SaleZone]: {
    type: COMBOBOX,
    endpoint: SaleRepository.SalesZone.qry,
    parameters: '_startAt=0&_pageSize=1000&_filter=&_sortField=recordId',
    valueField: 'recordId',
    displayField: 'name'
  },
  [ResourceIds.ClientGroups]: {
    type: COMBOBOX,
    endpoint: SaleRepository.ClientGroups.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.SalesZoneLevels]: {
    type: COMBOBOX,
    endpoint: SaleRepository.SaleZoneLevel.qry,
    valueField: 'levelId',
    displayField: 'name'
  },
  [ResourceIds.SalesTeam]: {
    type: COMBOBOX,
    endpoint: SaleRepository.SalesTeam.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Client]: {
    type: LOOKUP,
    endpoint: SaleRepository.Client.snapshot,
    valueField: 'reference',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' },
      { key: 'szName', value: 'Sale Zone' }
    ]
  },
  [ResourceIds.SalesOrder]: {
    type: LOOKUP,
    endpoint: SaleRepository.SalesOrder.snapshot,
    valueField: 'reference',
    valueOnSelection: 'recordId',
    secondValueShow: false,
    displayFieldWidth: 2,
    firstFieldWidth: '40%'
  },
  [ResourceIds.SalesPerson]: {
    type: COMBOBOX,
    endpoint: SaleRepository.SalesPerson.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['spRef', 'name'],
    columnsInDropDown: [
      { key: 'spRef', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Driver]: {
    type: COMBOBOX,
    endpoint: DeliveryRepository.Driver.qry,
    valueField: 'recordId',
    displayField: 'name'
  },
  [ResourceIds.Vehicle]: {
    type: COMBOBOX,
    endpoint: DeliveryRepository.Vehicle.qry,
    valueField: 'recordId',
    displayField: 'name'
  },
  [ResourceIds.SecurityGroupsFilter]: {
    type: COMBOBOX,
    endpoint: AccessControlRepository.SecurityGroup.qry,
    parameters: '_startAt=0&_pageSize=1000',
    valueField: 'recordId',
    displayField: 'name'
  },
  [ResourceIds.SiteGroups]: {
    type: COMBOBOX,
    endpoint: InventoryRepository.SiteGroups.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.AssetClass]: {
    type: COMBOBOX,
    endpoint: FixedAssetsRepository.Asset.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.AssetGroup]: {
    type: COMBOBOX,
    endpoint: FixedAssetsRepository.AssetGroup.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Location]: {
    type: COMBOBOX,
    endpoint: FixedAssetsRepository.Location.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.MDAssets]: {
    type: COMBOBOX,
    endpoint: FixedAssetsRepository.Assets.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.StockCounts]: {
    type: COMBOBOX,
    endpoint: StockCountRepository.StockCount.qry,
    parameters: '_startAt=0&_pageSize=1000&_params=',
    valueField: 'recordId',
    displayField: 'reference'
  },
  [ResourceIds.Labor]: {
    type: COMBOBOX,
    endpoint: ManufacturingRepository.Labor.qry,
    parameters: '_startAt=0&_pageSize=1000',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.MFJobOrders]: {
    type: LOOKUP,
    endpoint: ManufacturingRepository.MFJobOrder.snapshot,
    valueOnSelection: 'recordId',
    displayField: 'itemName',
    valueField: 'reference',
    displayFieldWidth: 2,
    firstFieldWidth: '40%',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'itemName', value: 'Name' },
      { key: 'description', value: 'Description' }
    ]
  },
  [ResourceIds.IRReplenishmentGrps]: {
    type: COMBOBOX,
    endpoint: IVReplenishementRepository.ReplenishmentGroups.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.PointOfSale]: {
    type: COMBOBOX,
    endpoint: POSRepository.PointOfSale.qry,
    valueField: 'recordId',
    displayField: 'reference'
  },
  [ResourceIds.Design]: {
    type: LOOKUP,
    endpoint: ManufacturingRepository.Design.snapshot,
    valueField: 'reference',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.GovernmentOrganizationFilter]: {
    type: COMBOBOX,
    endpoint: SystemRepository.GovernmentOrganization.qry,
    valueField: 'recordId',
    displayField: 'name'
  },
  [ResourceIds.NotificationTransaction]: {
    //NotificationLabelFilter
    type: COMBOBOX,
    endpoint: AccessControlRepository.NotificationLabel.qry,
    valueField: 'recordId',
    displayField: 'label'
  },
  [ResourceIds.Address]: {
    //FIX AFTER LOOKUP FIX //fix display format
    type: LOOKUP,
    endpoint: SystemRepository.Address.snapshot,
    valueField: ['name', 'city', 'email1'],
    secondDisplayField: false,
    valueOnSelection: 'recordId',
    displayField: ['name', 'city', 'email1'],
    //displayFieldWidth: 1,
    //firstFieldWidth: '40%',
    columnsInDropDown: [
      { key: 'name', value: 'Name' },
      { key: 'city', value: 'City' },
      { key: 'street1', value: 'Street1' },
      { key: 'email1', value: 'Email1' },
      { key: 'phone', value: 'Phone' }
    ]
  },
  [ResourceIds.IVDimension]: {
    type: COMBOBOX,
    endpoint: InventoryRepository.Dimension.qry,
    //_dimension appended
    valueField: 'id',
    displayField: 'name'
  },
  [ResourceIds.FIDimValues]: {
    type: COMBOBOX,
    endpoint: FinancialRepository.FIDimension.qry,
    //_dimension appended
    valueField: 'id',
    displayField: 'name'
  },
  [ResourceIds.CostCenterGroup]: {
    type: COMBOBOX,
    endpoint: GeneralLedgerRepository.CostCenterGroup.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  }

  //check fields of lookups.. //fix fawzis resources
}
