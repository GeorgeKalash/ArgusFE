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
import CreditOrderForm from '@argus/shared-ui/src/components/Shared/Forms/CreditOrderForm'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import CreditInvoiceForm from '@argus/shared-ui/src/components/Shared/Forms/CreditInvoiceForm'
import TransactionForm from '@argus/shared-ui/src/components/Shared/Forms/TransactionForm'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ClientTemplateForm from '@argus/shared-ui/src/components/Shared/Forms/ClientTemplateForm'
import { RTCLRepository } from '@argus/repositories/src/repositories/RTCLRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CashCountForm from '@argus/shared-ui/src/components/Shared/Forms/CashCountForm'
import CashTransferTab from '@argus/shared-ui/src/components/Shared/Forms/CashTransferTab'
import OutwardsModificationForm from '@argus/shared-ui/src/components/Shared/Forms/OutwardsModificationForm'
import OutwardsReturnForm from '@argus/shared-ui/src/components/Shared/Forms/OutwardsReturnForm'
import InwardTransferForm from '@argus/shared-ui/src/components/Shared/Forms/InwardTransferForm'
import InwardSettlementForm from '@argus/shared-ui/src/components/Shared/Forms/InwardSettlementForm'
import OutwardsForm from '@argus/shared-ui/src/components/Shared/Forms/OutwardsForm'
import SketchForm from '@argus/shared-ui/src/components/Shared/Forms/SketchForm'
import ThreeDDesignForm from '@argus/shared-ui/src/components/Shared/Forms/ThreeDDesignForm'
import SalesOrderForm from '@argus/shared-ui/src/components/Shared/Forms/SalesOrderForm'
import PurchaseRquisitionForm from '@argus/shared-ui/src/components/Shared/Forms/PurchaseRquisitionForm'
import LoanWindow from '@argus/shared-ui/src/components/Shared/Forms/LoanWindow'
import PurchaseOrderForm from '@argus/shared-ui/src/components/Shared/Forms/PurchaseOrderForm'
import MaterialRequestForm from '@argus/shared-ui/src/components/Shared/Forms/MaterialRequestForm'
import PuCostAllocationWindow from '@argus/shared-ui/src/components/Shared/Forms/PuCostAllocationWindow'
import ResignationReqForm from '@argus/shared-ui/src/components/Shared/Forms/ResignationReqForm'
import LeaveRequestForm from '@argus/shared-ui/src/components/Shared/Forms/LeaveRequestForm'
import SamplesForm from '@argus/shared-ui/src/components/Shared/Forms/SamplesForm'
import PayrollListForm from '@argus/shared-ui/src/components/Shared/Forms/PayrollListForm'
import MatPlaningForm from '@argus/shared-ui/src/components/Shared/Forms/matPlaningForm'
import LeaveReturnForm from '@argus/shared-ui/src/components/Shared/Forms/LeaveReturnForm'
import EmpPenaltyForm from '@argus/shared-ui/src/components/Shared/Forms/EmpPenaltyForm'
import TimeVariatrionForm from '@argus/shared-ui/src/components/Shared/Forms/TimeVariatrionForm'
import TaDslForm from '@argus/shared-ui/src/components/Shared/Forms/TaDslForm'
import JobInfoForm from '@argus/shared-ui/src/components/Shared/Forms/jobInfoForm'
import PaymentOrdersForm from '@argus/shared-ui/src/components/Shared/Forms/PaymentOrdersForm'
import WCConsumpForm from '@argus/shared-ui/src/components/Shared/Forms/WCConsumpForm'
import ProductionOrderForm from '@argus/shared-ui/src/components/Shared/Forms/ProductionOrderForm'
import CycleCountsWindow from '@argus/shared-ui/src/components/Shared/Forms/CycleCountsWindow'

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

    switch (obj.functionId) {
       case SystemFunction.CurrencyCreditOrderSale:
      case SystemFunction.CurrencyCreditOrderPurchase:
        relevantComponent = CreditOrderForm
        break
      case SystemFunction.CreditInvoiceSales:
      case SystemFunction.CreditInvoicePurchase:
        relevantComponent = CreditInvoiceForm
        break
      case SystemFunction.CashCountTransaction:
        relevantComponent = CashCountForm
        break
      case SystemFunction.CurrencyPurchase:
      case SystemFunction.CurrencySale:
        relevantComponent = TransactionForm
        break

      case SystemFunction.KYC:
        await getRequest({
          extension: RTCLRepository.CtClientIndividual.get,
          parameters: `_recordId=${obj.recordId}`
        }).then(res => {
          recordId = res.record.clientId
        })

        relevantComponent = ClientTemplateForm
        break
      case SystemFunction.ResignationRequest:
        relevantComponent = ResignationReqForm
        break
      case SystemFunction.LeaveRequest:
        relevantComponent = LeaveRequestForm
      break
      case SystemFunction.Samples:
        relevantComponent = SamplesForm
      break
      case SystemFunction.PayrollList:
        relevantComponent = PayrollListForm
      break
      case SystemFunction.OutwardsOrder:
        relevantComponent = OutwardsForm
        break
      case SystemFunction.CashTransfer:
        relevantComponent = CashTransferTab
        break
      case SystemFunction.OutwardsModification:
        relevantComponent = OutwardsModificationForm
        break
      case SystemFunction.OutwardsReturn:
        relevantComponent = OutwardsReturnForm
        break
      case SystemFunction.InwardTransfer:
        relevantComponent = InwardTransferForm
        break
      case SystemFunction.InwardSettlement:
        relevantComponent = InwardSettlementForm
        break
      case SystemFunction.Sketch:
        relevantComponent = SketchForm
        break
      case SystemFunction.SalesOrder:
        relevantComponent = SalesOrderForm
        break
      case SystemFunction.ThreeDDesign:
        relevantComponent = ThreeDDesignForm
        break
      case SystemFunction.LoanRequest:
        relevantComponent = LoanWindow
        break
      case SystemFunction.PurchaseRequisition:
        relevantComponent = PurchaseRquisitionForm
        break
      case SystemFunction.PurchaseOrder:
        relevantComponent = PurchaseOrderForm
        break
      case SystemFunction.MaterialRequest:
        relevantComponent = MaterialRequestForm
        break
      case SystemFunction.CostAllocation:
        relevantComponent = PuCostAllocationWindow
        break
      case SystemFunction.MRP:
        relevantComponent = MatPlaningForm
        break
      case SystemFunction.ReturnFromLeave:
        relevantComponent = LeaveReturnForm
        break
      case SystemFunction.Penalty:
        relevantComponent = EmpPenaltyForm
        break
      case SystemFunction.TimeVariation:
        relevantComponent = TimeVariatrionForm
        break
      case SystemFunction.DuringShiftLeave:
        relevantComponent = TaDslForm
        break
      case SystemFunction.JobInfo:
        relevantComponent = JobInfoForm
        break
      case SystemFunction.PaymentOrder:
        relevantComponent = PaymentOrdersForm
        break
      case SystemFunction.WorkCenterConsumption:
        relevantComponent = WCConsumpForm
        break
      case SystemFunction.ProductionOrder:
        relevantComponent = ProductionOrderForm
        break
      case SystemFunction.StockCount:
        relevantComponent = CycleCountsWindow
      default:
        break
    }

    if (relevantComponent) {
      const userData = window.sessionStorage.getItem('userData')
        ? JSON.parse(window.sessionStorage.getItem('userData'))
        : null

      const plantId = await getPlantId(userData)

      stack({
        Component: relevantComponent,
        props: {
          recordId: recordId,
          plantId: plantId,
          userData: userData
        }
      })
    }
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
