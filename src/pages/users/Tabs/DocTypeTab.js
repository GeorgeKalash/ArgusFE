import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import USDocTypeForm from './USDocTypeForm'
import FormShell from 'src/components/Shared/FormShell'
import { useForm } from 'src/hooks/form'

const DocTypeTab = ({ labels, maxAccess, storeRecordId }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      recordId: storeRecordId || null
    }
  })

  const columns = [
    {
      field: 'sfName',
      headerName: labels.systemFunction,
      flex: 1
    },
    {
      field: 'dtName',
      headerName: labels.docType,
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
    endpointId: SystemRepository.UserFunction.qry,
    datasetId: ResourceIds.Users
  })

  async function fetchGridData() {
    if (!storeRecordId) {
      return { list: [] }
    }

    return await getRequest({
      extension: SystemRepository.UserFunction.qry,
      parameters: `_userId=${storeRecordId}&_filter=`
    })
  }

  const edit = async obj => {
    stack({
      Component: USDocTypeForm,
      props: {
        labels: _labels,
        storeRecordId: storeRecordId || null,
        functionId: obj.functionId,
        maxAccess: maxAccess,
        invalidate: invalidate
      },
      width: 600,
      height: 500,
      title: _labels.docType
    })
  }

  return (
    <FormShell
      resourceId={ResourceIds.Users}
      maxAccess={maxAccess}
      editMode={!!storeRecordId}
      isSaved={false}
      isCleared={false}
      form={formik}
    >
      <VertLayout>
        <Fixed>
          <GridToolbar maxAccess={maxAccess} />
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={data ? data : { list: [] }}
            rowId={['userId', 'functionId']}
            onEdit={edit}
            isLoading={false}
            maxAccess={maxAccess}
            pagination={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default DocTypeTab
