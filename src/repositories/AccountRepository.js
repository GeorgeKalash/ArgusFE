const service = 'MA.asmx/'

export const AccountRepository = {
  Identity: {
    set: service + 'setID',
    get: service + 'getID'
  },
  UserIdentity: {
    check: service + 'check'
  },
  changePW: service + 'changePW'
}
