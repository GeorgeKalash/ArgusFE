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
  Warehouse: {
    page: service + 'pageWH',
    set: service + 'setWH',
    get: service + 'getWH',
    del: service + 'delWH'
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
  }
}
