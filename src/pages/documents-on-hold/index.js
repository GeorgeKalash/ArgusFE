import { useState, useContext } from 'react'
import { Box, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import DocumentsWindow from './window/DocumentsWindow'
import { useWindow } from 'src/windows'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CreditOrderForm from '../credit-order/Forms/CreditOrderForm'
import { SystemFunction } from 'src/resources/SystemFunction'
import CreditInvoiceForm from '../credit-invoice/Forms/CreditInvoiceForm'
import { KVSRepository } from 'src/repositories/KVSRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import TransactionForm from '../currency-trading/forms/TransactionForm'
import ClientTemplateForm from '../clients-list/forms/ClientTemplateForm'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CashCountForm from '../cash-count/forms/CashCountForm'
import CashTransferTab from '../cash-transfer/Tabs/CashTransferTab'
import OutwardsModificationForm from '../outwards-modification/Forms/OutwardsModificationForm'
import OutwardsReturnForm from '../outwards-return/Forms/OutwardsReturnForm'
import InwardTransferForm from '../inward-transfer/forms/InwardTransferForm'
import InwardSettlementForm from '../inward-settlement/forms/InwardSettlementForm'
import { SystemRepository } from 'src/repositories/SystemRepository'
import OutwardsForm from '../outwards-order/Tabs/OutwardsForm'
import SketchForm from '../pm-sketch/Forms/SketchForm'
import ThreeDDesignForm from '../pm-3d-design/forms/ThreeDDesignForm'

const DocumentsOnHold = () => {
  const { getRequest } = useContext(RequestsContext)

  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [selectedFunctioId, setSelectedFunctioId] = useState(null)
  const [selectedSeqNo, setSelectedSeqNo] = useState(null)
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: DocumentReleaseRepository.DocumentsOnHold.qry,
      parameters: `_startAt=${_startAt}&_functionId=0&_reference=&_sortBy=reference desc&_response=0&_status=1&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    filterBy,
    clearFilter,
    refetch,
    clear,
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
    const { _startAt = 0, _pageSize = 50 } = options

    return (
      filters.qry &&
      (await getRequest({
        extension: DocumentReleaseRepository.DocumentsOnHold.qry,
        parameters: `_filter=${filters.qry}&_functionId=0&_reference=${filters.qry}&_sortBy=reference desc&_response=0&_status=1&_pageSize=${_pageSize}&_startAt=${_startAt}`
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
    let labels
    let relevantAccess

    let windowWidth
    let windowHeight
    let title

    const userData = window.sessionStorage.getItem('userData')
      ? JSON.parse(window.sessionStorage.getItem('userData'))
      : null

    const plantId = await getPlantId(userData)

    switch (obj.functionId) {
      case SystemFunction.CurrencyCreditOrderSale:
      case SystemFunction.CurrencyCreditOrderPurchase:
        relevantComponent = CreditOrderForm
        labels = await getLabels(ResourceIds.CreditOrder)
        relevantAccess = await getAccess(ResourceIds.CreditOrder)

        windowWidth = 950
        title = labels[1]
        break

      case SystemFunction.CreditInvoiceSales:
      case SystemFunction.CreditInvoicePurchase:
        relevantComponent = CreditInvoiceForm
        labels = await getLabels(ResourceIds.CreditInvoice)
        relevantAccess = await getAccess(ResourceIds.CreditInvoice)

        windowWidth = 950
        title = labels[1]
        break
      case SystemFunction.CashCountTransaction:
        relevantComponent = CashCountForm
        labels = await getLabels(ResourceIds.CashCountTransaction)
        relevantAccess = await getAccess(ResourceIds.CashCountTransaction)

        windowWidth = 1100
        windowHeight = 700
        title = labels.CashCount
        break
      case SystemFunction.CurrencyPurchase:
      case SystemFunction.CurrencySale:
        relevantComponent = TransactionForm
        labels = await getLabels(ResourceIds.CashInvoice)
        relevantAccess = await getAccess(ResourceIds.CashInvoice)

        windowWidth = 1200
        title = labels.cashInvoice
        break

      case SystemFunction.KYC:
        await getRequest({
          extension: RTCLRepository.CtClientIndividual.get,
          parameters: `_recordId=${obj.recordId}`
        }).then(res => {
          recordId = res.record.clientId
        })

        relevantComponent = ClientTemplateForm
        labels = await getLabels(ResourceIds.ClientMaster)
        relevantAccess = await getAccess(ResourceIds.ClientMaster)

        windowWidth = 1100
        title = labels.pageTitle

        break

      case SystemFunction.OutwardsOrder:
        relevantComponent = OutwardsForm
        labels = await getLabels(ResourceIds.OutwardsOrder)
        relevantAccess = await getAccess(ResourceIds.OutwardsOrder)

        windowWidth = 1100
        title = labels.OutwardsOrder
        break

      case SystemFunction.CashTransfer:
        relevantComponent = CashTransferTab
        labels = await getLabels(ResourceIds.CashTransfer)
        relevantAccess = await getAccess(ResourceIds.CashTransfer)

        windowWidth = 1100
        title = labels.CashTransfer
        break

      case SystemFunction.OutwardsModification:
        relevantComponent = OutwardsModificationForm
        labels = await getLabels(ResourceIds.OutwardsModification)
        relevantAccess = await getAccess(ResourceIds.OutwardsModification)

        windowWidth = 1260
        windowHeight = 720
        title = labels.outwardsModification
        break

      case SystemFunction.OutwardsReturn:
        relevantComponent = OutwardsReturnForm
        labels = await getLabels(ResourceIds.OutwardsReturn)
        relevantAccess = await getAccess(ResourceIds.OutwardsReturn)

        windowWidth = 800
        windowHeight = 630
        title = labels.outwardsReturn
        break

      case SystemFunction.InwardTransfer:
        relevantComponent = InwardTransferForm
        labels = await getLabels(ResourceIds.InwardTransfer)
        relevantAccess = await getAccess(ResourceIds.InwardTransfer)

        windowWidth = 1200
        title = labels.InwardTransfer
        break

      case SystemFunction.InwardSettlement:
        relevantComponent = InwardSettlementForm
        labels = await getLabels(ResourceIds.InwardSettlement)
        relevantAccess = await getAccess(ResourceIds.InwardSettlement)

        windowWidth = 1200
        title = labels.InwardSettlement
        break
      case SystemFunction.Sketch:
        relevantComponent = SketchForm
        labels = await getLabels(ResourceIds.Sketch)
        relevantAccess = await getAccess(ResourceIds.Sketch)

        windowWidth = 700
        windowHeight = 700
        title = labels.Sketch
        break
      case SystemFunction.ThreeDDesign:
        relevantComponent = ThreeDDesignForm
        labels = await getLabels(ResourceIds.ThreeDDesign)
        relevantAccess = await getAccess(ResourceIds.ThreeDDesign)

        windowWidth = 800
        windowHeight = 650
        title = labels.ThreeDDesign
      default:
        // Handle default case if needed
        break
    }

    if (relevantComponent && labels && relevantAccess) {
      stack({
        Component: relevantComponent,
        props: {
          recordId: recordId,
          labels: labels,
          maxAccess: relevantAccess,
          plantId: plantId,
          userData: userData
        },
        width: windowWidth,
        height: windowHeight,
        title: title
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
      flex: 1
    },
    {
      field: 'functionName',
      headerName: _labels.functionName,
      flex: 1
    },
    {
      field: 'thirdParty',
      headerName: _labels.thirdParty,
      flex: 1
    },
    {
      field: 'strategyName',
      headerName: _labels.strategy,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      width: 100,
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
    setSelectedSeqNo(obj.seqNo)
    setSelectedRecordId(obj.recordId)
    setSelectedFunctioId(obj.functionId)
    setWindowOpen(true)
  }

  async function getLabels(datasetId) {
    const res = await getRequest({
      extension: KVSRepository.getLabels,
      parameters: `_dataset=${datasetId}`
    })

    return res.list ? Object.fromEntries(res.list.map(({ key, value }) => [key, value])) : {}
  }

  async function getAccess(resourceId) {
    const res = await getRequest({
      extension: AccessControlRepository.maxAccess,
      parameters: `_resourceId=${resourceId}`
    })

    return res
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
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
      {windowOpen && (
        <DocumentsWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
          functionId={selectedFunctioId}
          seqNo={selectedSeqNo}
          setWindowOpen={setWindowOpen}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default DocumentsOnHold
