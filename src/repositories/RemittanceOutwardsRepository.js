const service = 'RTOW.asmx/'

export const RemittanceOutwardsRepository = {
  Country: {
    qry: service + 'qryPCO2'
  },
  DispersalType: {
    qry: service + 'qryPMO2'
  },
  Currency: {
    qry: service + 'qryPMO3'
  },
  Agent: {
    qry: service + 'qryPDA2'
  },
  ProductDispersalEngine: {
    qry: service + 'qryPDE'
  },
  OutwardsTransfer: {
    qry: service + 'qryOW',
    page: service + 'pageOW',
    get: service + 'getOW',
    get2: service + 'get2OW',
    set: service + 'setOW',
    set2: service + 'set2OW',
    del: service + 'delOW',
    close: service + 'closeOW',
    reopen: service + 'reopenOW',
    post: service + 'postOW',
    snapshot: service + 'snapshotOW'
  },
  InwardsTransfer: {
    get: service + 'getIW',
    set: service + 'setIW',
    del: service + 'delIW',
    snapshot: service + 'snapshotIW',
    close: service + 'closeIW',
    reopen: service + 'reopenIW'
  },
  Beneficiary: {
    qry: service + 'qryBEN',
    get: service + 'getBEN',
    del: service + 'delBEN',
    snapshot: service + 'snapshotBEN'
  },
  BeneficiaryBank: {
    qry: service + 'qryBEB',
    get: service + 'getBEB',
    set: service + 'set2BEB',
    del: service + 'delBEB'
  },
  BeneficiaryCash: {
    qry: service + 'qryBEC',
    get: service + 'getBEC',
    set: service + 'set2BEC',
    del: service + 'delBEC'
  },
  FreeSchedule: {
    qry: service + 'qryFSC',
    get: service + 'getFSC',
    set: service + 'setFSC',
    del: service + 'delFSC'
  },
  FreeScheduleDetail: {
    qry: service + 'qryFSD',
    get: service + 'getFSD',
    set2: service + 'set2FSD',
    del: service + 'delFSD'
  },
  FreeScheduleMap: {
    qry: service + 'qryFSM',
    get: service + 'getFSM',
    set: service + 'setFSM',
    del: service + 'delFSM'
  }
}
