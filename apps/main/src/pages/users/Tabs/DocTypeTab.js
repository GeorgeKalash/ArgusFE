import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useContext, useMemo } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import USDocTypeForm from './USDocTypeForm'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grid } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'

const DocTypeTab = ({ labels, maxAccess, storeRecordId }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    maxAccess,
    validateOnChange: true,
    initialValues: {
      recordId: storeRecordId || null,
      search: ''
    }
  })

  const columns = [
    {
      field: 'functionId',
      headerName: labels.functionId,
      flex: 1
    },
    {
      field: 'sfName',
      headerName: labels.systemFunction,
      flex: 2
    },
    {
      field: 'dtName',
      headerName: labels.docType,
      flex: 2
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

  const value = formik.values.search

  const filteredData = useMemo(() => {
    const list = data?.list || []

    if (!value) return data

    return {
      ...data,
      list: list.filter(
        item =>
          (item.sfName && item.sfName.toLowerCase().includes(value.toLowerCase())) ||
          (item.dtName && item.dtName.toLowerCase().includes(value.toLowerCase())) ||
          (item.functionId !== null && String(item.functionId).includes(value))
      )
    }
  }, [data?.list, value])

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
  }

  return (
    <VertLayout>
      <Fixed>
        <Grid container p={4}>
          <Grid item xs={4}>
            <CustomTextField
              name='search'
              value={formik.values.search}
              label={labels.search}
              onClear={() => {
                formik.setFieldValue('search', '')
              }}
              onChange={handleSearchChange}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          name='docType'
          columns={columns}
          gridData={filteredData}
          rowId={['userId', 'functionId']}
          onEdit={edit}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default DocTypeTab
