import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { useContext } from 'react'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import ReleaseCodeForm from './ReleaseCodeForm'
import { ControlContext } from 'src/providers/ControlContext'

const ReleaseCodeTab = ({ labels, maxAccess, storeRecordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const columns = [
    {
      field: 'codeRef',
      headerName: labels.codeRef,
      flex: 1
    },
    {
      field: 'code',
      headerName: labels.code,
      flex: 1
    }
  ]

  const {
    query: { data },
    labels: _labels,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: Boolean(storeRecordId),
    endpointId: AccessControlRepository.UserReleaseCode.qry,
    datasetId: ResourceIds.Users
  })

  async function fetchGridData() {
    try {
      if (!storeRecordId) {
        return { list: [] }
      }

      return await getRequest({
        extension: AccessControlRepository.UserReleaseCode.qry,
        parameters: `_userId=${storeRecordId}&_filter=`
      })
    } catch (error) {}
  }

  function openForm() {
    stack({
      Component: ReleaseCodeForm,
      props: {
        labels: _labels,
        storeRecordId: storeRecordId ? storeRecordId : null,
        maxAccess,
        invalidate
      },
      width: 600,
      height: 400,
      title: _labels.releaseCode
    })
  }

  const add = () => {
    openForm()
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: AccessControlRepository.UserReleaseCode.del,
        record: JSON.stringify(obj)
      })
      toast.success(platformLabels.Deleted)
      invalidate()
    } catch (error) {}
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data ? data : { list: [] }}
          rowId={['codeId', 'userId']}
          onDelete={del}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default ReleaseCodeTab
