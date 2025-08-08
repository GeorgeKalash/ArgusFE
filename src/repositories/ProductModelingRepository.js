const service = 'PM.asmx/'

export const ProductModelingRepository = {
  Designer: {
    page: service + 'pageDSR',
    get: service + 'getDSR',
    set: service + 'setDSR',
    del: service + 'delDSR',
    snapshot: service + 'snapshotDSR',
    qry: service + 'qryDSR'
  },
  ThreeDDesign: {
    page: service + 'page3DD',
    get: service + 'get3DD',
    set: service + 'set3DD',
    del: service + 'del3DD',
    post: service + 'post3DD',
    close: service + 'close3DD',
    reopen: service + 'reopen3DD',
    snapshot: service + 'snapshot3DD'
  },
  Sketch: {
    page: service + 'pageSKH',
    get: service + 'getSKH',
    set: service + 'setSKH',
    del: service + 'delSKH',
    close: service + 'closeSKH',
    reopen: service + 'reopenSKH',
    snapshot: service + 'snapshotSKH',
    snapshot2: service + 'snapshot2SKH',
    snapshot3: service + 'snapshot3SKH',
    post: service + 'postSKH'
  },
  ModelMaker: {
    snapshot: service + 'snapshotMDL',
    snapshot2: service + 'snapshot2MDL',
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
  Printing: {
    page: service + 'page3DP',
    get: service + 'get3DP',
    set: service + 'set3DP',
    del: service + 'del3DP',
    start: service + 'start3DP',
    snapshot: service + 'snapshot3DP',
    snapshot2: service + 'snapshot3DP2',
    post: service + 'post3DP',
    qry: service + 'qry3DP'
  },
  ThreeDDrawing: {
    snapshot: service + 'snapshot3DD',
    snapshot2: service + 'snapshot23DD',
    get: service + 'get3DD',
    snapshot3DD2: service + 'snapshot3DD2'
  },
  Rubber: {
    page: service + 'pageRBR',
    get: service + 'getRBR',
    set: service + 'setRBR',
    del: service + 'delRBR',
    snapshot: service + 'snapshotRBR',
    post: service + 'postRBR',
    start: service + 'startRBR'
  },
  Modeling: {
    qry: service + 'qryMDL'
  },
  Casting: {
    page: service + 'pageCAS',
    get: service + 'getCAS',
    set: service + 'setCAS',
    del: service + 'delCAS',
    snapshot: service + 'snapshotCAS',
    post: service + 'postCAS'
  },
  DocumentTypeDefault: {
    page: service + 'pageDTD',
    get: service + 'getDTD',
    set: service + 'setDTD',
    del: service + 'delDTD'
  },
  Samples: {
    page: service + 'pageSPL',
    get2: service + 'get2SPL',
    set: service + 'setSPL',
    del: service + 'delSPL',
    snapshot: service + 'snapshotSPL',
    set2: service + 'set2SPL',
    close: service + 'closeSPL',
    reopen: service + 'reopenSPL',
    post: service + 'postSPL'
  }
}
