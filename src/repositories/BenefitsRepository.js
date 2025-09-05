const service = 'BE.asmx/'

export const BenefitsRepository = {
  BenefitSchedule: {
    qry: service + 'qrySC',
    page: service + 'pageSC',
    get: service + 'getSC',
    set: service + 'setSC',
    del: service + 'delSC',
  }
}
