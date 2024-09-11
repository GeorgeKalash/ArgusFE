import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { useError } from 'src/error'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getStorageData } from 'src/storage/storage'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import OutwardsReturnForm from './Forms/OutwardsReturnForm'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'

const OutwardsReturn = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsReturn.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceOutwardsRepository.OutwardsReturn.page,
    datasetId: ResourceIds.OutwardsReturn,
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'outwardRef',
      headerName: _labels.outwardRef,
      flex: 1
    },
    {
      field: 'requestedByName',
      headerName: _labels.requestedBy,
      flex: 1
    }
  ]

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.OutwardsReturn,
    action: openForm,
    hasDT: false
  })

  const add = async () => {
    await proxyAction()
  }

  const userId = getStorageData('userData').userId

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const getPlantId = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${userId}&_key=plantId`
      })

      return res.record.value
    } catch (e) {
      return ''
    }
  }

  async function openOutwardsForm(plantId, recordId) {
    const dtId = await getDefaultDT()

    stack({
      Component: OutwardsReturnForm,
      props: {
        labels: _labels,
        recordId,
        plantId,
        maxAccess: access,
        dtId
      },
      width: 800,
      height: 630,
      title: _labels.outwardsReturn
    })
  }

  async function openForm(recordId) {
    const plantId = await getPlantId()

    plantId !== ''
      ? openOutwardsForm(plantId, recordId)
      : stackError({
          message: platformLabels.noDefaultPlant
        })
  }

  const getDefaultDT = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserFunction.get,
        parameters: `_userId=${userId}&_functionId=${SystemFunction.OutwardsReturn}`
      })
  
      return res?.record?.dtId
    } catch (error) {
      return ''
    }
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar hasSearch={false} onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default OutwardsReturn
