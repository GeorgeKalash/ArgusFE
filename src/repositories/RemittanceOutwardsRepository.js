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
  Beneficiary: {
    qry: service + 'qryBEN',
    get: service + 'getBEN',
    snapshot: service + 'snapshotBEN'
  },
  BeneficiaryBank: {
    qry: service + 'qryBEB',
    get: service + 'getBEB',
    set: service + 'set2BEB'
  },
  BeneficiaryCash: {
    qry: service + 'qryBEC',
    get: service + 'getBEC',
    set: service + 'set2BEC',
    del: service + 'delBEC'
  }
}
