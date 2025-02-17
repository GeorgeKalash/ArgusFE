const service = 'FO.asmx/'

export const FoundryRepository = {
  WorkCenter: {
    page: service + 'pageWCT',
    qry: service + 'qryWCT',
    set: service + 'setWCT',
    get: service + 'getWCT',
    del: service + 'delWCT'
  },
  MetalSettings: {
    page: service + 'pageMTS',
    set: service + 'setMTS',
    get: service + 'getMTS',
    del: service + 'delMTS'
  },
  Scrap: {
    qry: service + 'qryMSC',
    set2: service + 'set2MSC',
  },
  JobWaxInquiry: {
    qry2: service + 'qry2WAJ'
  }
}
