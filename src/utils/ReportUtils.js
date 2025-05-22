import { DevExpressRepository } from 'src/repositories/DevExpressRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

export const generateReport = async ({
  paramsDict,
  postRequest,
  selectedReport,
  selectedFormat,
  resourceId,
  outerGrid,
  isReport,
  recordId,
  functionId,
  scId,
  siteId,
  controllerId
}) => {
  const buildParameters = () => {
    switch (resourceId) {
      case ResourceIds.JournalVoucher:
        return `?_recordId=${recordId}&_functionId=${functionId}`
      case ResourceIds.IVPhysicalCountItem:
      case ResourceIds.PhysicalCountSerialSummary:
        return `?_stockCountId=${scId}&_siteId=${siteId}`
      case ResourceIds.IVPhysicalCountItemDetails:
        return `?_stockCountId=${scId}&_siteId=${siteId}&_controllerId=${controllerId}`
      default:
        return `?_recordId=${recordId}`
    }
  }

  const parameters = !outerGrid ? (!isReport ? buildParameters() : '?_params=') : ''

  const payload = {
    api_url: selectedReport.api_url + parameters,
    assembly: selectedReport.assembly,
    format: selectedFormat,
    reportClass: selectedReport.reportClass,
    functionId: functionId,
    paramsDict: paramsDict || ''
  }

  const response = await postRequest({
    url: process.env.NEXT_PUBLIC_REPORT_URL,
    extension: DevExpressRepository.generate,
    record: JSON.stringify(payload)
  })

  return response.recordId
}
