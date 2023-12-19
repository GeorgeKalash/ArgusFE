const service = 'GL.asmx/'

export const GeneralLedgerRepository = {

    //IntegrationLogic
    IntegrationLogic: {
        qry: service + 'qryIL',
    },

    //CostCenter
    CostCenter: {
        qry: service + 'qryCC',
    }
}