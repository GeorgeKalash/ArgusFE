const service = 'PM.asmx/'

export const ProductModelingRepository = {
  Designer: {
    page: service + 'pageDSR',
    get: service + 'getDSR',
    set: service + 'setDSR',
    del: service + 'delDSR',
    snapshot: service + 'snapshotDSR'
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
  }
}
