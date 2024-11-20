const service = 'FA.asmx/'

export const FixedAssetsRepository = {
  Asset: {
    page: service + 'pageCLS',
    qry: service + 'qryCLS',
    get: service + 'getCLS',
    set: service + 'setCLS',
    del: service + 'delCLS'
  },
  AssetGroup: {
    page: service + 'pageGRP',
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
  },
  AssetsDescription: {
    qry: service + 'qryDEP',
    get: service + 'getDEP',
    set2: service + 'set2DEP',
    set: service + 'setDEP',
    del: service + 'delDEP',
    snapshot: service + 'snapshotDEP',
    preview: service + 'previewDEP',
    post: service + 'postDEP'
  },
  AssetsTableData: {
    qry: service + 'qryDEA'
  }
}
