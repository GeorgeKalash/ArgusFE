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
import FixingForm from '@argus/shared-ui/src/components/Shared/Forms/FixingForm'
import EventOrderForm from '@argus/shared-ui/src/components/Shared/Forms/EventOrderForm'
import CreditLimitHoldForm from '@argus/shared-ui/src/components/Shared/Forms/CreditLimitHoldForm'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'

const ApprovalsTable = ({ pageSize = 50 }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { userDefaults } = useContext(DefaultsContext)

  const getPlantId = () =>
    parseInt(userDefaults?.list?.find(({ key }) => key === 'plantId')?.value) || null

  const getUserId = () => getStorageData('userData')?.userId || null

  const popupConfigs = {
    [SystemFunction.CurrencyCreditOrderSale]: {
      component: CreditOrderForm
    },
    [SystemFunction.CurrencyCreditOrderPurchase]: {
      component: CreditOrderForm
    },
    [SystemFunction.CreditInvoiceSales]: {
      component: CreditInvoiceForm
    },
    [SystemFunction.CreditInvoicePurchase]: {
      component: CreditInvoiceForm
    },
    [SystemFunction.CashCountTransaction]: {
      component: CashCountForm
    },
    [SystemFunction.CurrencyPurchase]: {
      component: TransactionForm,
      props: {
        plantId: getPlantId
      }
    },
    [SystemFunction.CurrencySale]: {
      component: TransactionForm,
      props: {
        plantId: getPlantId
      }
    },
    [SystemFunction.KYC]: {
      component: ClientTemplateForm,
      prepare: async ({ recordId }) => {
        const response = await getRequest({
          extension: RTCLRepository.CtClientIndividual.get,
          parameters: `_recordId=${recordId}`
        })

        return response?.record?.clientId || null
      },
      props: {
        plantId: getPlantId
      }
    },
    [SystemFunction.ResignationRequest]: {
      component: ResignationReqForm
    },
    [SystemFunction.LeaveRequest]: {
      component: LeaveRequestForm
    },
    [SystemFunction.Samples]: {
      component: SamplesForm
    },
    [SystemFunction.PayrollList]: {
      component: PayrollListForm
    },
    [SystemFunction.OutwardsOrder]: {
      component: OutwardsForm,
      props: {
        plantId: getPlantId,
        userId: getUserId
      }
    },
    [SystemFunction.CashTransfer]: {
      component: CashTransferTab
    },
    [SystemFunction.OutwardsModification]: {
      component: OutwardsModificationForm
    },
    [SystemFunction.OutwardsReturn]: {
      component: OutwardsReturnForm,
      props: {
        plantId: getPlantId
      }
    },
    [SystemFunction.InwardTransfer]: {
      component: InwardTransferForm,
      props: {
        plantId: getPlantId,
        userId: getUserId
      }
    },
    [SystemFunction.InwardSettlement]: {
      component: InwardSettlementForm,
      props: {
        plantId: getPlantId,
        userId: getUserId
      }
    },
    [SystemFunction.Sketch]: {
      component: SketchForm
    },
    [SystemFunction.SalesOrder]: {
      component: SalesOrderForm
    },
    [SystemFunction.ThreeDDesign]: {
      component: ThreeDDesignForm
    },
    [SystemFunction.LoanRequest]: {
      component: LoanWindow
    },
    [SystemFunction.PurchaseRequisition]: {
      component: PurchaseRquisitionForm
    },
    [SystemFunction.PurchaseOrder]: {
      component: PurchaseOrderForm
    },
    [SystemFunction.MaterialRequest]: {
      component: MaterialRequestForm
    },
    [SystemFunction.CostAllocation]: {
      component: PuCostAllocationWindow
    },
    [SystemFunction.MRP]: {
      component: MatPlaningForm
    },
    [SystemFunction.ReturnFromLeave]: {
      component: LeaveReturnForm
    },
    [SystemFunction.Penalty]: {
      component: EmpPenaltyForm
    },
    [SystemFunction.TimeVariation]: {
      component: TimeVariatrionForm
    },
    [SystemFunction.DuringShiftLeave]: {
      component: TaDslForm
    },
    [SystemFunction.JobInfo]: {
      component: JobInfoForm
    },
    [SystemFunction.PaymentOrder]: {
      component: PaymentOrdersForm
    },
    [SystemFunction.WorkCenterConsumption]: {
      component: WCConsumpForm
    },
    [SystemFunction.ProductionOrder]: {
      component: ProductionOrderForm
    },
    [SystemFunction.StockCount]: {
      component: CycleCountsWindow,
      props: {
        plantId: getPlantId
      }
    },
    [SystemFunction.FixingSales]: {
      component: FixingForm
    },
    [SystemFunction.FixingPurchases]: {
      component: FixingForm
    },
    [SystemFunction.EventOrder]: {
      component: EventOrderForm
    },
    [SystemFunction.CreditLimitHold]: {
      component: CreditLimitHoldForm
    }
  }

  const getPopupProps = async (obj, config) => {
    const preparedRecordId = config.prepare
      ? await config.prepare(obj)
      : obj.recordId

    const dynamicProps = Object.fromEntries(
      await Promise.all(
        Object.entries(config.props || {}).map(async ([key, resolver]) => [
          key,
          await resolver(obj)
        ])
      )
    )

    return {
      recordId: preparedRecordId,
      functionId: obj.functionId,
      ...dynamicProps
    }
  }

  const openPopup = async obj => {
    const config = popupConfigs[obj.functionId]
    if (!config) return

    const props = await getPopupProps(obj, config)

    stack({
      Component: config.component,
      props
    })
  }

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
