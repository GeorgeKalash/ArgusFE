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
    qry2: service + 'qryOW2',
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
    qry2: service + 'qryBEN2',
    qry3: service + 'qryBEN3',
    get: service + 'getBEN',
    del: service + 'delBEN',
    snapshot: service + 'snapshotBEN',
    snapshot2: service + 'snapshotBEN2 '
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
  FeeSchedule: {
    qry: service + 'qryFSC',
    get: service + 'getFSC',
    set: service + 'setFSC',
    del: service + 'delFSC'
  },
  FeeScheduleDetail: {
    qry: service + 'qryFSD',
    get: service + 'getFSD',
    set2: service + 'set2FSD',
    del: service + 'delFSD'
  },
  FeeScheduleOutwards: {
    qry: service + 'qryFSO',
    get: service + 'getFSO',
    set: service + 'setFSO',
    del: service + 'delFSO'
  },
  FeeScheduleInwards: {
    qry: service + 'qryFSI',
    get: service + 'getFSI',
    set: service + 'setFSI',
    del: service + 'delFSI'
  },
  OutwardGLInformation: {
    get: service + 'getOWI'
  },
  AutoPostExclusion: {
    qry: service + 'qryAPX',
    get: service + 'getAPX',
    set: service + 'setAPX',
    del: service + 'delAPX'
  },
  OutwardsModification: {
    qry: service + 'qryOWM',
    page: service + 'pageOWM',
    snapshot: service + 'snapshotOWM',
    get: service + 'getOWM',
    set2: service + 'set2OWM',
    del: service + 'delOWM',
    post: service + 'postOWM',
    reopen: service + 'reopenOWM',
    close: service + 'closeOWM'
  },
  Postoutwards: {
    qry: service + 'qryOW3',
    post2: service + 'post2OW'
  },
  OutwardsReturn: {
    page: service + 'pageOWR',
    get: service + 'getOWR',
    set: service + 'setOWR'
  },
  CorrespondentOutwards: {
    qry: service + 'qryACE',
    set: service + 'setACE'
  }
}
