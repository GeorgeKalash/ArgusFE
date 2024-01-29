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

}