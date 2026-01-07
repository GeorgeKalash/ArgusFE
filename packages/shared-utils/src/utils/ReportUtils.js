import { DevExpressRepository } from '@argus/repositories/src/repositories/DevExpressRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

export const generateReport = async ({
  paramsDict,
  postRequest,
  selectedReport,
  selectedFormat,
  resourceId,
  params,
  isReport = false,
  recordId,
  functionId,
  scId,
  siteId,
  controllerId,
  previewBtnClicked
}) => {
  const buildParameters = () => {
    switch (resourceId) {
      case ResourceIds.JournalVoucher:
        return `?_recordId=${recordId}&_functionId=${functionId}`
      case ResourceIds.IVPhysicalCountItem:
      case ResourceIds.PhysicalCountSerialSummary:
        return `?_stockCountId=${scId}&_siteId=${siteId}`
      case ResourceIds.IVPhysicalCountItemDetails:
      case ResourceIds.PhysicalCountSerialDetail:
        return `?_stockCountId=${scId}&_siteId=${siteId}&_controllerId=${controllerId}`
      default:
        return recordId ? `?_recordId=${recordId}` : ''
    }
  }

  const payload = {
    api_url: selectedReport.api_url + (isReport ? '?_params=' + params || '' : buildParameters()),
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
  previewBtnClicked && previewBtnClicked()

  return response.recordId
}
