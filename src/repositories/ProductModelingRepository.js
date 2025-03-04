const service = 'PM.asmx/'

export const ProductModelingRepository = {
  Designer: {
    page: service + 'pageDSR',
    get: service + 'getDSR',
    set: service + 'setDSR',
    del: service + 'delDSR',
    qry: service + 'qryDSR',
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
  ThreeDPrint: {
    page: service + 'page3DP',
    get: service + 'get3DP',
    set: service + 'set3DP',
    del: service + 'del3DP',
    start: service + 'start3DP',
    snapshot: service + 'snapshot3DP',
    post: service + 'post3DP'
  },
  ThreeDDrawing: {
    snapshot: service + 'snapshot3DD',
  }
}
