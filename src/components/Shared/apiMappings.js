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
import { SCRepository } from 'src/repositories/SCRepository'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { companyStructureRepository } from 'src/repositories/companyStructureRepository'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import { LoanManagementRepository } from 'src/repositories/LoanManagementRepository'
import { PayrollRepository } from 'src/repositories/PayrollRepository'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { PointofSaleRepository } from 'src/repositories/PointofSaleRepository'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

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
    type: COMBOBOX,
    endpoint: CashBankRepository.CashAccount.qry,
    parameters: '_type=0',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
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
  [ResourceIds.Assemblies]: {
    type: LOOKUP,
    endpoint: ManufacturingRepository.Assembly.snapshot,
    firstField: 'reference',
    secondDisplayField: false,
    valueOnSelection: 'recordId'
  },
  [ResourceIds.ProductionOrder]: {
    type: LOOKUP,
    endpoint: ManufacturingRepository.ProductionOrder.snapshot,
    firstField: 'reference',
    secondDisplayField: false,
    valueOnSelection: 'recordId'
  },
  [ResourceIds.Accounts]: {
    type: LOOKUP,
    endpoint: FinancialRepository.Account.snapshot,
    firstField: 'reference',
    secondField: 'name',
    valueOnSelection: 'recordId',
    displayFieldWidth: 2,
    firstFieldWidth: 5
  },
  [ResourceIds.DocumentTypes]: {
    type: COMBOBOX,
    endpoint: SystemRepository.DocumentType.qry2,
    parameters: '', //_functionIds appended
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
  [ResourceIds.Countries]: {
    type: COMBOBOX,
    endpoint: SystemRepository.Country.qry, //filterNationality
    parameters: '_filter=',
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
      _filter: '',
      _countryId: 0,
      _stateId: 0
    },
    valueOnSelection: 'recordId',
    firstField: 'reference',
    secondField: 'name',
    displayFieldWidth: 2
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
    firstField: 'accountRef',
    valueOnSelection: 'recordId',
    secondField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: 5
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
    parameters: '_params=',
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
    firstField: 'accountRef',
    secondField: 'name',
    valueOnSelection: 'recordId',
    displayFieldWidth: 2,
    firstFieldWidth: 5
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
    parameters: '_filter=&_pageSize=1000&_params=',
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
    firstField: 'sku',
    secondField: 'name',
    valueOnSelection: 'recordId',
    displayFieldWidth: 3,
    firstFieldWidth: 4,
    columnsInDropDown: [
      { key: 'sku', value: 'Sku' },
      { key: 'name', value: 'Name', grid: 5 }
    ]
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
    firstField: 'reference',
    secondField: 'name',
    valueOnSelection: 'recordId',
    displayFieldWidth: 2,
    firstFieldWidth: 5
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
  [ResourceIds.PuVendors]: {
    type: LOOKUP,
    endpoint: PurchaseRepository.Vendor.snapshot,
    firstField: 'reference',
    secondField: 'name',
    valueOnSelection: 'recordId',
    displayFieldWidth: 2,
    firstFieldWidth: 5,
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
    firstField: 'reference',
    secondValueShow: false,
    displayFieldWidth: 2,
    firstFieldWidth: 5
  },
  [ResourceIds.Expense_Types]: {
    type: LOOKUP,
    endpoint: FinancialRepository.ExpenseTypes.snapshot,
    firstField: 'reference',
    secondField: 'name',
    valueOnSelection: 'recordId',
    displayFieldWidth: 2,
    firstFieldWidth: 5
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
    firstField: 'reference',
    secondField: 'name',
    valueOnSelection: 'recordId',
    displayFieldWidth: 2,
    firstFieldWidth: 5,
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' },
      { key: 'szName', value: 'Sale Zone' }
    ]
  },
  [ResourceIds.SalesOrder]: {
    type: LOOKUP,
    endpoint: SaleRepository.SalesOrder.snapshot,
    firstField: 'reference',
    valueOnSelection: 'recordId',
    secondValueShow: false,
    displayFieldWidth: 1,
    firstFieldWidth: 5
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
  [ResourceIds.Drivers]: {
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
    //true resourceId: SecurityGroup = 23102, security groups report asp broken!

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
    endpoint: SCRepository.StockCount.qry,
    parameters: '_startAt=0&_pageSize=1000&_params=',
    valueField: 'recordId',
    displayField: 'reference'
  },
  [ResourceIds.Labor]: {
    type: COMBOBOX,
    endpoint: ManufacturingRepository.Labor.qry,
    parameters: '_startAt=0&_pageSize=1000&_params=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Modeling]: {
    type: COMBOBOX,
    endpoint: ProductModelingRepository.Modeling.qry,
    parameters: '_startAt=0&_pageSize=1000&_params=',
    valueField: 'recordId',
    displayField: 'reference'
  },
  [ResourceIds.MFJobOrders]: {
    type: LOOKUP,
    endpoint: ManufacturingRepository.MFJobOrder.snapshot,
    valueOnSelection: 'recordId',
    firstField: 'reference',
    secondField: 'itemName',
    displayFieldWidth: 2,
    firstFieldWidth: 5,
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
  [ResourceIds.FoMoulds]: {
    type: COMBOBOX,
    endpoint: FoundryRepository.Mould.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000`,
    valueField: 'recordId',
    displayField: 'reference',
    columnsInDropDown: [
      { key: 'reference', value: 'Mould' },
      { key: 'lineName', value: 'Production Line' }
    ]
  },
  [ResourceIds.PointOfSale]: {
    type: COMBOBOX,
    endpoint: PointofSaleRepository.PointOfSales.qry,
    valueField: 'recordId',
    displayField: 'reference'
  },
  [ResourceIds.Design]: {
    type: LOOKUP,
    endpoint: ManufacturingRepository.Design.snapshot,
    firstField: 'reference',
    secondField: 'name',
    valueOnSelection: 'recordId',
    displayFieldWidth: 2,
    firstFieldWidth: 5,
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.NotificationTransaction]: {
    //NotificationLabelFilter
    type: COMBOBOX,
    endpoint: AccessControlRepository.NotificationLabel.qry,
    valueField: 'recordId',
    displayField: 'label'
  },
  [ResourceIds.Address]: {
    type: LOOKUP,
    endpoint: SystemRepository.Address.snapshot,
    firstField: ['name', 'city', 'street1', 'email1', 'phone'],
    secondDisplayField: false,
    valueOnSelection: 'recordId',
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
  },
  [ResourceIds.Correspondent]: {
    type: LOOKUP,
    endpoint: RemittanceSettingsRepository.Correspondent.snapshot,
    firstField: 'reference',
    secondField: 'name',
    valueOnSelection: 'recordId',
    displayFieldWidth: 2,
    firstFieldWidth: 5,
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.CorrespondentGroup]: {
    type: COMBOBOX,
    endpoint: RemittanceSettingsRepository.CorrespondentGroup.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Currencies]: {
    type: COMBOBOX,
    endpoint: SystemRepository.Currency.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000&_filter=`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Interface]: {
    type: COMBOBOX,
    endpoint: RemittanceSettingsRepository.Interface.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.ProductMaster]: {
    type: LOOKUP,
    endpoint: RemittanceSettingsRepository.ProductMaster.snapshot,
    firstField: 'reference',
    secondField: 'name',
    valueOnSelection: 'recordId',
    displayFieldWidth: 2,
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Beneficiary]: {
    type: LOOKUP,
    endpoint: RemittanceOutwardsRepository.Beneficiary.snapshot,
    parameters: {
      _clientId: 0,
      _dispersalType: 0,
      _currencyId: 0
    },
    secondDisplayField: false,
    firstField: ['name', 'currencyName', 'countryName', 'dispersalTypeName'],
    valueOnSelection: 'beneficiaryId',
    columnsInDropDown: [
      { key: 'name', value: 'Name' },
      { key: 'currencyName', value: 'Currency Name' },
      { key: 'countryName', value: 'Country Name' },
      { key: 'dispersalTypeName', value: 'Dispersal Type Name' }
    ]
  },
  [ResourceIds.ClientList]: {
    type: LOOKUP,
    endpoint: CTCLRepository.CtClientIndividual.snapshot,
    parameters: {
      _category: 1
    },
    secondDisplayField: false,
    firstField: ['reference', 'name', 'cellPhone'],
    valueOnSelection: 'recordId',
    displayFieldWidth: 2,
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' },
      { key: 'cellPhone', value: 'cellPhone' }
    ]
  },

  //HR filters

  [ResourceIds.EmployeeFilter]: {
    type: LOOKUP,
    endpoint: EmployeeRepository.Employee.snapshot,
    parameters: {
      _branchId: 0
    },
    firstField: 'reference',
    secondField: 'fullName',
    valueOnSelection: 'recordId',
    displayFieldWidth: 1,
    firstFieldWidth: 5,
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'fullName', value: 'Name' }
    ]
  },
  [ResourceIds.GovernmentOrganizationFilter]: {
    type: COMBOBOX,
    endpoint: SystemRepository.GovernmentOrganization.qry,
    valueField: 'recordId',
    displayField: ['name'],
    columnsInDropDown: [{ key: 'name', value: 'Name' }]
  },
  [ResourceIds.DivisionFilter]: {
    type: COMBOBOX,
    endpoint: companyStructureRepository.DivisionFilters.qry,
    valueField: 'recordId',
    displayField: ['name'],
    columnsInDropDown: [{ key: 'name', value: 'Name' }]
  },
  [ResourceIds.BranchFilter]: {
    type: COMBOBOX,
    endpoint: companyStructureRepository.BranchFilters.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.CompanyPosition]: {
    type: COMBOBOX,
    endpoint: companyStructureRepository.CompanyPositions.qry,
    parameters: `_filter=&_size=1000&_startAt=0&_sortBy=recordId`,
    valueField: 'recordId',
    displayField: ['positionRef', 'name'],
    columnsInDropDown: [
      { key: 'positionRef', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.DepartmentFilter]: {
    type: COMBOBOX,
    endpoint: companyStructureRepository.DepartmentFilters.qry,
    parameters: `_filter=&_size=1000&_startAt=0&_type=0&_activeStatus=0&_sortBy=recordId`,
    valueField: 'recordId',
    displayField: ['departmentRef', 'name'],
    columnsInDropDown: [
      { key: 'departmentRef', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.CertificateLevels]: {
    type: COMBOBOX,
    endpoint: EmployeeRepository.CertificateFilters.qry,
    valueField: 'recordId',
    displayField: ['name'],
    columnsInDropDown: [{ key: 'name', value: 'Name' }]
  },
  [ResourceIds.HRDocTypeFilter]: {
    type: COMBOBOX,
    endpoint: EmployeeRepository.HRDocTypeFilters.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.SalaryChangeReasonFilter]: {
    type: COMBOBOX,
    endpoint: EmployeeRepository.SalaryChangeReasonFilters.qry,
    valueField: 'recordId',
    displayField: ['name'],
    columnsInDropDown: [{ key: 'name', value: 'Name' }]
  },
  [ResourceIds.EmploymentStatusFilter]: {
    type: COMBOBOX,
    endpoint: EmployeeRepository.EmploymentStatusFilters.qry,
    valueField: 'recordId',
    displayField: ['name'],
    columnsInDropDown: [{ key: 'name', value: 'Name' }]
  },
  [ResourceIds.SponsorFilter]: {
    type: COMBOBOX,
    endpoint: EmployeeRepository.SponsorFilters.qry,
    valueField: 'recordId',
    displayField: ['name'],
    columnsInDropDown: [{ key: 'name', value: 'Name' }]
  },
  [ResourceIds.AttendanceScheduleFilter]: {
    type: COMBOBOX,
    endpoint: TimeAttendanceRepository.AttendanceScheduleFilters.qry,
    parameters: `_filter=&_size=1000&_startAt=0&_sortBy=recordId&_scId=0`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.IndemnityAccuralsFilter]: {
    type: COMBOBOX,
    endpoint: LoanManagementRepository.IndemnityAccuralsFilters.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.LeaveScheduleFilter]: {
    type: COMBOBOX,
    endpoint: LoanManagementRepository.LeaveScheduleFilters.qry,
    valueField: 'recordId',
    displayField: ['name'],
    columnsInDropDown: [{ key: 'name', value: 'Name' }]
  },
  [ResourceIds.PayrollFilter]: {
    type: COMBOBOX,
    endpoint: PayrollRepository.PayrollFilters.qry,
    parameters: `_year=0&_salaryType=5&_status=0`,
    valueField: 'recordId',
    displayField: ['reference'],
    columnsInDropDown: [{ key: 'reference', value: 'Reference' }]
  },
  [ResourceIds.BankTransferFilter]: {
    type: COMBOBOX,
    endpoint: PayrollRepository.BankTransferFilters.qry,
    valueField: 'recordId',
    displayField: ['name'],
    columnsInDropDown: [{ key: 'name', value: 'Name' }]
  },
  [ResourceIds.Printing]: {
    type: COMBOBOX,
    endpoint: ProductModelingRepository.Printing.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000`,
    valueField: 'recordId',
    displayField: 'reference'
  },
  [ResourceIds.Designer]: {
    type: COMBOBOX,
    endpoint: ProductModelingRepository.Designer.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Sketch]: {
    type: LOOKUP,
    endpoint: ProductModelingRepository.Sketch.snapshot,
    secondDisplayField: false,
    firstField: ['reference', 'sourceName', 'designerRef'],
    valueOnSelection: 'recordId',
    displayFieldWidth: 1,
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'sourceName', value: 'Source' },
      { key: 'designerRef', value: 'designer' }
    ]
  },
  [ResourceIds.Metals]: {
    type: COMBOBOX,
    endpoint: InventoryRepository.Metals.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000`,
    valueField: 'recordId',
    displayField: 'reference'
  },
  [ResourceIds.ProductionClass]: {
    type: COMBOBOX,
    endpoint: ManufacturingRepository.ProductionClass.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.ProductionStandard]: {
    type: COMBOBOX,
    endpoint: ManufacturingRepository.ProductionStandard.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000`,
    valueField: 'recordId',
    displayField: 'reference'
  },
  [ResourceIds.Collections]: {
    type: COMBOBOX,
    endpoint: InventoryRepository.Collections.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.ThreeDPrint]: {
    type: COMBOBOX,
    endpoint: ProductModelingRepository.Printing.qry,
    parameters: `_params=`,
    valueField: 'recordId',
    displayField: 'reference'
  },
  [ResourceIds.ThreeDDesign]: {
    type: LOOKUP,
    endpoint: ProductModelingRepository.ThreeDDrawing.snapshot,
    valueOnSelection: 'recordId',
    firstField: 'reference',
    secondDisplayField: false
  },
  [ResourceIds.Routings]: {
    type: COMBOBOX,
    endpoint: ManufacturingRepository.Routing.qry,
    parameters: `_params=`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Damages]: {
    type: COMBOBOX,
    endpoint: ManufacturingRepository.Damage.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000&_jobId=0`,
    valueField: 'recordId',
    displayField: ['reference'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'jobRef', value: 'Job Order' }
    ]
  },
  [ResourceIds.PriceGroups]: {
    type: COMBOBOX,
    endpoint: SaleRepository.PriceGroups.qry,
    parameters: '_startAt=0&_pageSize=1000&_name=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.BPMasterData]: {
    type: COMBOBOX,
    endpoint: BusinessPartnerRepository.MasterData.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000&_sortBy=recordId`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.LoCollectors]: {
    type: COMBOBOX,
    endpoint: LogisticsRepository.LoCollector.qry,
    parameters: `_params=&_startAt=0&_pageSize=1000`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.PaymentReasons]: {
    type: COMBOBOX,
    endpoint: FinancialRepository.PaymentReasons.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.ReleaseIndicators]: {
    type: COMBOBOX,
    endpoint: DocumentReleaseRepository.ReleaseIndicator.qry,
    parameters: `_startAt=0&_pageSize=1000`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.ItemSizes]: {
    type: COMBOBOX,
    endpoint: InventoryRepository.ItemSizes.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Currency]: {
    type: COMBOBOX,
    endpoint: SystemRepository.Currency.qry2,
    parameters: '',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.FoWaxes]: {
    type: LOOKUP,
    endpoint: FoundryRepository.Wax.snapshot,
    firstField: 'reference',
    secondDisplayField: false,
    valueOnSelection: 'recordId'
  },
  [ResourceIds.FeeSchedule]: {
    type: COMBOBOX,
    endpoint: RemittanceOutwardsRepository.FeeSchedule.qry,
    parameters: '_startAt=0&_pageSize=50&filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.RiskLevel]: {
    type: COMBOBOX,
    endpoint: CurrencyTradingSettingsRepository.RiskLevel.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.ProfessionGroups]: {
    type: COMBOBOX,
    endpoint: RemittanceSettingsRepository.ProfessionGroups.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.SalaryRange]: {
    type: COMBOBOX,
    endpoint: RemittanceSettingsRepository.SalaryRange.qry,
    valueField: 'recordId',
    displayField: ['min', 'max'],
    separator: '->',
    columnsInDropDown: [
      { key: 'min', value: 'MIN' },
      { key: 'max', value: 'MAX' }
    ]
  },
  [ResourceIds.SourceOfIncomeType]: {
    type: COMBOBOX,
    endpoint: RemittanceSettingsRepository.SourceOfIncomeType.qry,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.PurposeExchangeGroup]: {
    type: COMBOBOX,
    endpoint: CurrencyTradingSettingsRepository.PurposeExchangeGroup.qry,
    valueField: 'recordId',
    displayField: 'name'
  }
}
