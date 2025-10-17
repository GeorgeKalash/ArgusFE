import { Grid } from '@mui/material'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import ResourceGlobalForm from 'src/components/Shared/ResourceGlobalForm'
import Form from 'src/components/Shared/Form'

const SecurityGroupsForm = ({ labels, maxAccess, row, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data: sgData },
    paginationParameters,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: AccessControlRepository.SecurityGroup.qry,
    datasetId: ResourceIds.SettingsResources
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 20 } = options

    const response = await getRequest({
      extension: AccessControlRepository.SecurityGroup.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      resourceId: row.resourceId,
      moduleId: row.moduleId,
      resourceName: row.resourceName,
      items: [
        {
          id: 1,
          accessLevelName: '',
          resourceId: '',
          sgId: null,
          moduleId: ''
        }
      ]
    },
    onSubmit: values => {
      postData(values)
    }
  })

  const postData = async obj => {
    const filteredItems =
      obj?.items
        ?.filter(item => item.accessLevel !== null && item.accessLevel !== '')
        .map((item, index) => ({
          ...item,
          resourceId: row.resourceId
        })) || []

    const data = {
      resourceId: row.resourceId,
      data: filteredItems
    }

    await postRequest({
      extension: AccessControlRepository.ModuleClass.set2,
      record: JSON.stringify(data)
    })

    toast.success(platformLabels.Updated)
    window.close()
  }

  const columns = [
    {
      headerName: labels.name,
      field: 'name',
      flex: 1
    },
    {
      headerName: labels.description,
      field: 'description',
      flex: 2
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  function openForm(row) {
    stack({
      Component: ResourceGlobalForm,
      props: {
        labels,
        maxAccess,
        row: {
          resourceId: formik.values?.resourceId,
          resourceName: formik.values?.resourceName,
          sgId: row?.recordId,
          moduleId: formik.values?.moduleId
        },
        resourceId: ResourceIds.SecurityGroup
      }
    })
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <CustomTextField
                name='resourceId'
                label={labels.resourceId}
                value={formik.values.resourceId}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid xs={5}></Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='resourceName'
                label={labels.resourceName}
                value={formik.values.resourceName}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name='items'
            columns={columns}
            gridData={sgData}
            onEdit={edit}
            rowId={['recordId']}
            maxAccess={maxAccess}
            refetch={refetch}
            pageSize={20}
            paginationType='api'
            paginationParameters={paginationParameters}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SecurityGroupsForm
