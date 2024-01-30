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
  },   CostCenter: {
    qry: service + 'qryCC',
},
CostCenterGroup: {
page:   service + 'pageCCG', 
qry: service + 'qryCCG',
get: service + 'getCCG',
set: service + 'setCCG',
del: service + 'delCCG'
},


}