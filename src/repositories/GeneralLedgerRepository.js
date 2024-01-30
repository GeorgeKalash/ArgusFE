const service = 'GL.asmx/'

export const GeneralLedgerRepository = {

    //IntegrationLogic
    IntegrationLogic: {
        qry: service + 'qryIL',
    },

    //CostCenter
    CostCenter: {
        qry: service + 'qryCC',
    },
    IntegrationPostTypes: {
    page:   service + 'pageIPT', 
    qry: service + 'qryIPT',
    get: service + 'getIPT',
    set: service + 'setIPT',
    del: service + 'delIPT'
  },
   GLAccountGroups :{
    page:   service + 'pageGRP', 
    qry: service + 'qryGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  }

}