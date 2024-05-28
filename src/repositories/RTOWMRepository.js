const service = 'RTOWM.asmx/'

//Remittance Outwards Modification Repository
export const RTOWMRepository = {
  OutwardsModification: {
    qry: service + 'qryOWM',
    get: service + 'getOWM',
    set2: service + 'set2OWM',
    del: service + 'delOWM',
    post: service + 'postOWM',
    reopen: service + 'reopenOWM',
    close: service + 'closeOWM'
  }
}
