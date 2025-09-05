const service = 'BE.asmx/'

export const BenefitsRepository = {
  BenefitSchedule: {
    page: service + 'pageSC',
    get: service + 'getSC',
    set: service + 'setSC',
    del: service + 'delSC',
  }
}