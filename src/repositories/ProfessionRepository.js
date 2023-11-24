const service = 'CTSET.asmx/'

export const ProfessionRepository = {
  getLabels: service + 'qryLBL',
  Profession: {
    qry: service + 'qryPRO',
    get: service + 'getPRO',
    set: service + 'setPRO',
    del: service + 'delPRO'
  },
}
