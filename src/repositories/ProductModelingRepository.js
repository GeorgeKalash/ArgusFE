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
  Rubber: {
    page: service + 'pageRBR',
    get: service + 'getRBR',
    set: service + 'setRBR',
    del: service + 'delRBR',
    qry: service + 'qryRBR',
    snapshot: service + 'snapshotRBR',
    post: service + 'postRBR'
  },
  Modeling: {
    qry: service + 'qryMDL'
  },
  Printing: {
    get3: service + 'get3DP'
  },
  Casting: {
    page: service + 'pageCAS',
    get: service + 'getCAS',
    set: service + 'setCAS',
    del: service + 'delCAS',
    snapshot: service + 'snapshotCAS',
    post: service + 'postCAS'
  },
  Printing: {
    qry: service + 'qry3DP'
  }
}
