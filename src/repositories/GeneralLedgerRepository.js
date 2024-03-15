const service = 'GL.asmx/'

export const GeneralLedgerRepository = {

    //IntegrationLogic
    IntegrationLogic: {
        qry: service + 'qryIL',
    },

    //CostCenter
    CostCenter: {
      page:   service + 'pageCC', 
      qry: service + 'qryCC',
      get: service + 'getCC',
      set: service + 'setCC',
      del: service + 'delCC',
      snapshot : service + "snapshotCC",
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
    }, 
     CostCenterGroup: {
      page:   service + 'pageCCG', 
      qry: service + 'qryCCG',
      get: service + 'getCCG',
      set: service + 'setCCG',
      del: service + 'delCCG',
      
    },JournalVoucher: {
      page:   service + 'pageJV', 
      qry: service + 'qryJV',
      get: service + 'getJV',
      set: service + 'setJV',
      del: service + 'delJV',
    },GeneralLedger:{
      qry: service + 'qryTRX',
      get: service + 'getTRX',
      set: service + 'setTRX',
      del: service + 'delTRX',
    },Account:{
    snapshot:service + "snapshotAC"}


}