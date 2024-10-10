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
  OutwardsCash: {
    qry: service + 'qryOWC'
  },
  OutwardsOrder: {
    qry: service + 'qryOWO',
    qry2: service + 'qryOWO2',
    page: service + 'pageOWO',
    get: service + 'getOWO',
    get2: service + 'get2OWO',
    set: service + 'setOWO',
    set2: service + 'set2OWO',
    del: service + 'delOWO',
    close: service + 'closeOWO',
    reopen: service + 'reopenOWO',
    post: service + 'postOWO',
    snapshot: service + 'snapshotOWO'
  },
  InwardSettlement: {
    qry: service + 'qryIWS',
    page: service + 'pageIWS',
    get: service + 'getIWS',
    set: service + 'setIWS',
    del: service + 'delIWS',
    close: service + 'closeIWS',
    reopen: service + 'reopenIWS',
    post: service + 'postIWS',
    snapshot: service + 'snapshotIWS'
  },
  InwardsTransfer: {
    get: service + 'getIW',
    set: service + 'setIW',
    del: service + 'delIW',
    snapshot: service + 'snapshotIW',
    snapshot2: service + 'snapshotIW2',
    close: service + 'closeIW',
    reopen: service + 'reopenIW',
    post: service + 'postIW'
  },
  InwardGLInformation: {
    get: service + 'getIWI'
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
    qry2: service + 'qryOWR2',
    get: service + 'getOWR',
    set: service + 'setOWR',
    close: service + 'closeOWR',
    reopen: service + 'reopenOWR',
    post: service + 'postOWR',
    snapshot: service + 'snapshotOWR'
  },
  CorrespondentOutwards: {
    qry: service + 'qryACE',
    set: service + 'setACE'
  },
  ReceiptVouchers: {
    qry: service + 'qryRV',
    page: service + 'pageRV',
    get: service + 'getRV',
    set: service + 'setRV',
    set2: service + 'set2RV',
    del: service + 'delRV',
    post: service + 'postRV',
    snapshot: service + 'snapshotRV'
  },
  OutwardsTransfer: {
    get: service + 'getOWT',
    snapshot: service + 'snapshotOWT'
  }
}
