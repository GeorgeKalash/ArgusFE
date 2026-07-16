import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import BenefitAcquisitionForm from './Forms/BenefitAcquisitionForm'
import { BenefitsRepository } from '@argus/repositories/src/repositories/BenefitsRepository'

const BenefitAcquisition = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: BenefitsRepository.BenefitAcquisition.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_employeeId=0&_benefitId=0`
    })

    return { ...response, _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access: maxAccess,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: BenefitsRepository.BenefitAcquisition.page,
    datasetId: ResourceIds.BenefitAcquisitions
  })

  const columns = [
    {
      field: 'employeeName',
      headerName: labels.employeeName,
      flex: 2
    },
    {
      field: 'benefitName',
      headerName: labels.benefit,
      flex: 1
    },
    {
      field: 'aqDate',
      headerName: labels.acquisitionDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'dateFrom',
      headerName: labels.from,
      flex: 1,
      type: 'date'
    },
    {
      field: 'dateTo',
      headerName: labels.to,
      flex: 1,
      type: 'date'
    }
  ]

  const add = () => openForm()

  const edit = obj => openForm(obj?.recordId)

  const del = async obj => {
    await postRequest({
      extension: BenefitsRepository.BenefitAcquisition.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: BenefitAcquisitionForm,
      props: {
        labels,
        recordId,
        maxAccess
      },
      width: 900,
      height: 700,
      title: labels.BenefitAcquisition
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default BenefitAcquisition