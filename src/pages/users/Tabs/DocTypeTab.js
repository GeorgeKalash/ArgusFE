import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import USDocTypeForm from './USDocTypeForm'
import FormShell from 'src/components/Shared/FormShell'
import { useForm } from 'src/hooks/form'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'

const DocTypeTab = ({ labels, maxAccess, storeRecordId }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [filteredData, setFilteredData] = useState(null)

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      recordId: storeRecordId || null,
      search: ''
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

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)

    if (value) {
      const filtered = data.list.filter(
        item =>
          (item.sfName && item.sfName.toLowerCase().includes(value.toLowerCase())) ||
          (item.dtName && item.dtName.toLowerCase().includes(value.toLowerCase()))
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(data.list)
    }
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
          <Grid container>
            <Grid item xs={4}>
              <CustomTextField
                name='search'
                value={formik.values.search}
                label={labels.search}
                onClear={() => {
                  formik.setFieldValue('search', '')
                  setFilteredData(data.list)
                }}
                onChange={handleSearchChange}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={filteredData ? { list: filteredData } : data}
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
