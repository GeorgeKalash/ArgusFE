const service = 'SS.asmx/'

export const SelfServiceRepository = {
  SSUserInfo: {
    set: service + 'setUS',
    get: service + 'getUS'
  },
  SSLeaveRequest: {
    set2: service + 'set2LR',
    get: service + 'getLR',
    page: service + 'pageLR',
    del: service + 'delLR'
  }
}
