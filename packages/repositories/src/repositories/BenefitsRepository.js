const service = 'BE.asmx/'

export const BenefitsRepository = {
  BenefitSchedule: {
    qry: service + 'qrySC',
    page: service + 'pageSC',
    get: service + 'getSC',
    set: service + 'setSC',
    del: service + 'delSC',
  },
  ScheduleBenefits: {
    qry: service + 'qrySB',
    get: service + 'getSB'
  },
  BenefitAcquisition: {
    page: service + 'pageBA',
    qry: service + 'qryBA',
    get: service + 'getBA',
    set: service + 'setBA',
    del: service + 'delBA',
    snapshot: service + 'snapshotBA'
  },
  Settlement: {
    qry: service + 'qrySE',
    page: service + 'pageSE',
    get: service + 'getSE',
    set: service + 'setSE',
    del: service + 'delSE',
    preview: service + 'previewSE',
  }
}
