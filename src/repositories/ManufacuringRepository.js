const service = 'MF.asmx/'

export const ManufacuringRepository = {

  LaborGroup: {
    snapshot : service + "snapshotLBG",
    page : service + "pageLBG",
    set: service + 'setLBG',
    get: service + 'getLBG',
    del: service + 'delLGB',

  }

}
