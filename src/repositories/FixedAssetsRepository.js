const service = 'FA.asmx/'

export const FixedAssetsRepository = {
  Asset: {
    qry: service + 'qryCLS',
    get: service + 'getCLS',
    set: service + 'setCLS',
    del: service + 'delCLS'
  },
  AssetGroup: {
    qry: service + 'qryGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  Location: {
    qry: service + 'qryLOC',
    get: service + 'getLOC',
    set: service + 'setLOC',
    del: service + 'delLOC'
  },
  Assets: {
    qry: service + 'qryAST',
    get: service + 'getAST',
    set: service + 'setAST',
    del: service + 'delAST'
  }
}
