const service = 'SS.asmx/'

export const SelfServiceRepository = {
  SSUserInfo: {
    set: service + 'setUS',
    get: service + 'getUS'
  }
}
