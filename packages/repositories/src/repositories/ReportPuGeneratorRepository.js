const service = 'RG.PU.asmx/'

export const ReportPuGeneratorRepository = {
  OpenPurchaseOrder: {
    open: service + 'openPO'
  },
  OpenPurchaseRequisition: {
    open: service + 'openPR'
  }
}
