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
    post: service + 'postSKH'
  },
  Printing: {
    page: service + 'page3DP',
    get: service + 'get3DP',
    set: service + 'set3DP',
    del: service + 'del3DP',
    start: service + 'start3DP',
    snapshot: service + 'snapshot3DP',
    post: service + 'post3DP',
    qry: service + 'qry3DP'
  },
  ThreeDDrawing: {
    snapshot: service + 'snapshot3DD',
  },
  Casting: {
    page: service + 'pageCAS',
    get: service + 'getCAS',
    set: service + 'setCAS',
    del: service + 'delCAS',
    snapshot: service + 'snapshotCAS',
    post: service + 'postCAS'
  }
}
