import { useContext } from 'react'
import { Box, IconButton } from '@mui/material'
import Icon from '@argus/shared-core/src/@core/components/icon'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import DocumentsForm from './DocumentsForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
// import CreditOrderForm from '../../pages/credit-order/Forms/CreditOrderForm'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
// import CreditInvoiceForm from '../../pages/credit-invoice/Forms/CreditInvoiceForm'
// import TransactionForm from '../../pages/currency-trading/forms/TransactionForm'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
// import ClientTemplateForm from '../../pages/clients-list/forms/ClientTemplateForm'
import { RTCLRepository } from '@argus/repositories/src/repositories/RTCLRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
// import CashCountForm from '../../pages//cash-count/forms/CashCountForm'
// import CashTransferTab from '../../pages/cash-transfer/Tabs/CashTransferTab'
// import OutwardsModificationForm from '../../pages/outwards-modification/Forms/OutwardsModificationForm'
// import OutwardsReturnForm from '../../pages/outwards-return/Forms/OutwardsReturnForm'
// import InwardTransferForm from '../../pages/inward-transfer/forms/InwardTransferForm'
// import InwardSettlementForm from '../../pages/inward-settlement/forms/InwardSettlementForm'
// import OutwardsForm from '../../pages/outwards-order/Tabs/OutwardsForm'
// import SketchForm from '../../pages/pm-sketch/Forms/SketchForm'
// import ThreeDDesignForm from '../../pages/pm-3d-design/forms/ThreeDDesignForm'
// import SalesOrderForm from '../../pages/sales-order/Tabs/SalesOrderForm'
// import PurchaseRquisitionForm from '../../pages/purchase-requisition/form/PurchaseRquisitionForm'
// import LoanWindow from '../../pages/hr-loans/Window/LoanWindow'
// import PurchaseOrderForm from 'src/pages/pu-ord/forms/PurchaseOrderForm'

const ApprovalsTable = ({ pageSize = 50 }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0 } = options

    const response = await getRequest({
      extension: DocumentReleaseRepository.DocumentsOnHold.qry,
      parameters: `_startAt=${_startAt}&_reference=&_sortBy=reference desc&_pageSize=${pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    filterBy,
    clearFilter,
    refetch,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: DocumentReleaseRepository.DocumentsOnHold.qry,
    datasetId: ResourceIds.DocumentsOnHold,
    filter: {
      endpointId: DocumentReleaseRepository.DocumentsOnHold.qry,
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ options = {}, filters }) {
    const { _startAt = 0 } = options

    return (
      filters.qry &&
      (await getRequest({
        extension: DocumentReleaseRepository.DocumentsOnHold.qry,
        parameters: `&_reference=${filters.qry}&_sortBy=reference desc&_pageSize=${pageSize}&_startAt=${_startAt}`
      }))
    )
  }

  const getPlantId = async userData => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${userData && userData.userId}&_key=plantId`
      })

      return res?.record?.value
    } catch (error) {
      return ''
    }
  }

  const popupComponent = async obj => {
    let relevantComponent
    let recordId = obj.recordId

    // switch (obj.functionId) {
    //   case SystemFunction.CurrencyCreditOrderSale:
    //   case SystemFunction.CurrencyCreditOrderPurchase:
    //     relevantComponent = CreditOrderForm
    //     break

    //   case SystemFunction.CreditInvoiceSales:
    //   case SystemFunction.CreditInvoicePurchase:
    //     relevantComponent = CreditInvoiceForm
    //     break
    //   case SystemFunction.CashCountTransaction:
    //     relevantComponent = CashCountForm
    //     break
    //   case SystemFunction.CurrencyPurchase:
    //   case SystemFunction.CurrencySale:
    //     relevantComponent = TransactionForm
    //     break

    //   case SystemFunction.KYC:
    //     await getRequest({
    //       extension: RTCLRepository.CtClientIndividual.get,
    //       parameters: `_recordId=${obj.recordId}`
    //     }).then(res => {
    //       recordId = res.record.clientId
    //     })

    //     relevantComponent = ClientTemplateForm
    //     break
    //   case SystemFunction.OutwardsOrder:
    //     relevantComponent = OutwardsForm
    //     break
    //   case SystemFunction.CashTransfer:
    //     relevantComponent = CashTransferTab
    //     break
    //   case SystemFunction.OutwardsModification:
    //     relevantComponent = OutwardsModificationForm
    //     break
    //   case SystemFunction.OutwardsReturn:
    //     relevantComponent = OutwardsReturnForm
    //     break
    //   case SystemFunction.InwardTransfer:
    //     relevantComponent = InwardTransferForm
    //     break
    //   case SystemFunction.InwardSettlement:
    //     relevantComponent = InwardSettlementForm
    //     break
    //   case SystemFunction.Sketch:
    //     relevantComponent = SketchForm
    //     break
    //   case SystemFunction.SalesOrder:
    //     relevantComponent = SalesOrderForm
    //     break
    //   case SystemFunction.ThreeDDesign:
    //     relevantComponent = ThreeDDesignForm
    //     break
    //   case SystemFunction.LoanRequest:
    //     relevantComponent = LoanWindow
    //     break
    //   case SystemFunction.PurchaseRequisition:
    //     relevantComponent = PurchaseRquisitionForm
    //     break
    //   case SystemFunction.PurchaseOrder:
    //     relevantComponent = PurchaseOrderForm
    //   default:
    //     // Handle default case if needed
    //     break
    // }

    // if (relevantComponent) {
    //   const userData = window.sessionStorage.getItem('userData')
    //     ? JSON.parse(window.sessionStorage.getItem('userData'))
    //     : null

    //   const plantId = await getPlantId(userData)

    //   stack({
    //     Component: relevantComponent,
    //     props: {
    //       recordId: recordId,
    //       plantId: plantId,
    //       userData: userData
    //     }
    //   })
    // }
  }

  const openPopup = async obj => {
    await popupComponent(obj)
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 2
    },
    {
      field: 'functionName',
      headerName: _labels.functionName,
      flex: 2
    },
    {
      field: 'thirdParty',
      headerName: _labels.thirdParty,
      flex: 2
    },
    {
      field: 'strategyName',
      headerName: _labels.strategy,
      flex: 2
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 2,
      type: 'date'
    },
    {
      field: 'approval',
      flex: 1,
      cellRenderer: row => (
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <IconButton size='small' onClick={() => edit(row.data)}>
            <Icon icon='mdi:application-edit-outline' fontSize={18} />
          </IconButton>
        </Box>
      )
    }
  ]

  const edit = obj => {
    stack({
      Component: DocumentsForm,
      props: {
        labels: _labels,
        maxAccess: _labels,
        maxAccess: access,
        recordId: obj.recordId,
        functionId: obj.functionId,
        seqNo: obj.seqNo
      }
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          maxAccess={access}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={_labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['functionId', 'seqNo', 'recordId']}
          onEdit={openPopup}
          isLoading={false}
          pageSize={pageSize}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default ApprovalsTable
