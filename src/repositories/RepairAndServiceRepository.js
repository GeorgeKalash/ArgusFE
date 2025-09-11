const service = 'RS.asmx/'

export const RepairAndServiceRepository = {
  RepairName: {
    page: service + 'pageRNA',
    get: service + 'getRNA',
    set: service + 'setRNA',
    del: service + 'delRNA'
  },
  WorkOrderTypes: {
    page: service + 'pageWOT',
    get: service + 'getWOT',
    set: service + 'setWOT',
    del: service + 'delWOT'
  },
  RepairType: {
    page: service + 'pageRT',
    get: service + 'getRT',
    set: service + 'setRT',
    del: service + 'delRT'
  },
  SpareParts: {
    page: service + 'pageSP',
    get: service + 'getSP',
    set: service + 'setSP',
    del: service + 'delSP'
  },
  SparePartsCategory: {
    qry: service + 'qrySPC'
  },
  Manufacturer: {
    qry: service + 'qrySPM'
  },
  InspectionTemplate: {
    get2: service + 'get2ITE',
    page: service + 'pageITE',
    set2: service + 'set2ITE',
    del: service + 'delITE'
  },
  Department: {
    page: service + 'pageDEP',
    get: service + 'getDEP',
    set: service + 'setDEP',
    del: service + 'delDEP'
  },
  Warehouse: {
    page: service + 'pageWH',
    set: service + 'setWH',
    get: service + 'getWH',
    del: service + 'delWH'
  },
  PreventiveMaintenanceTasks: {
    page: service + 'pagePMT',
    qry: service + 'qryPMT',
    get: service + 'getPMT',
    set: service + 'setPMT',
    del: service + 'delPMT'
  },
  SpManufacturer: {
    page: service + 'pageSPM',
    get: service + 'getSPM',
    set: service + 'setSPM',
    del: service + 'delSPM'
  },
  JobPosition: {
    page: service + 'pagePOS',
    qry: service + 'qryPOS',
    get: service + 'getPOS',
    set: service + 'setPOS',
    del: service + 'delPOS'
  },
  SpCategory: {
    page: service + 'pageSPC',
    get: service + 'getSPC',
    set: service + 'setSPC',
    del: service + 'delSPC'
  },
  MaintenanceTemplates: {
    page: service + 'pageMTE',
    get: service + 'getMTE',
    set: service + 'setMTE',
    del: service + 'delMTE'
  },
  MaintenanceTemplateTask: {
    qry: service + 'qryMTT',
    get: service + 'getMTT',
    set: service + 'setMTT',
    del: service + 'delMTT'
  },
  RsLabors: {
    page: service + 'pageLBR',
    set: service + 'setLBR',
    get: service + 'getLBR',
    del: service + 'delLBR'
  }
}
