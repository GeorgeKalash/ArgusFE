const service = 'PM.asmx/'

export const ProductModelingRepository = {
  Designer: {
    page: service + 'pageDSR',
    get: service + 'getDSR',
    set: service + 'setDSR',
    del: service + 'delDSR',
    qry: service + 'qryDSR'
  },
  Sketch: {
    page: service + 'pageSKH',
    get: service + 'getSKH',
    set: service + 'setSKH',
    del: service + 'delSKH',
    close: service + 'closeSKH',
    reopen: service + 'reopenSKH',
    snapshot: service + 'snapshotSKH',
    post: service + 'postSKH'
  },
  ModelMaker: {
    snapshot: service + 'snapshotMDL',
    page: service + 'pageMDL',
    get: service + 'getMDL',
    set: service + 'setMDL',
    del: service + 'delMDL',
    post: service + 'postMDL',
    close: service + 'closeMDL',
    reopen: service + 'reopenMDL'
  },
  ModellingMaterial: {
    qry: service + 'qryMDLM',
    set2: service + 'set2MDLM'
  },
  ThreeDPrint: {
    qry: service + 'qry3DP',
    snapshot: service + 'snapshot3DP'
  }
}
