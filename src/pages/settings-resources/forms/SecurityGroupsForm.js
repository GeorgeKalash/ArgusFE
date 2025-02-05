import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { DataSets } from 'src/resources/DataSets'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

const SecurityGroupsForm = ({ labels, maxAccess, row, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,

    initialValues: {
      resourceId: row.resourceId,
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
      component: 'textfield',
      label: labels.name,
      name: 'sgName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.description,
      name: 'sgDescription',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      name: 'accessLevel',
      label: labels.accessLevel,
      props: {
        datasetId: DataSets.ACCESS_LEVEL,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'accessLevel' },
          { from: 'value', to: 'accessLevelName' }
        ]
      }
    }
  ]

  useEffect(() => {
    const fetchData = async () => {
      const res1 = await getRequest({
        extension: AccessControlRepository.SecurityGroup.qry,
        parameters: '_startAt=0&_pageSize=1000'
      })

      const res2 = await getRequest({
        extension: AccessControlRepository.ModuleClass.qry0,
        parameters: `_resourceId=${row.resourceId}`
      })

      const list1 = res1.list || []
      const list2 = res2.list || []

      const combinedList = list1.map((item1, index) => {
        const match = list2.find(item2 => item2.sgId === item1.recordId)

        return {
          id: index + 1,
          accessLevelName: match ? match.accessLevelName : '',
          accessLevel: match ? match.accessLevel : null,
          resourceId: row.resourceId,
          sgId: item1.recordId,
          moduleId: row.moduleId,
          sgName: item1.name,
          sgDescription: item1.description
        }
      })

      formik.setValues({
        ...formik.values,
        items: combinedList
      })
    }

    fetchData()
  }, [])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.SettingsResources}
      isCleared={false}
      infoVisible={false}
      maxAccess={maxAccess}
    >
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
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            allowDelete={false}
            allowAddNewLine={false}
            columns={columns}
            maxAccess={maxAccess}
            name='items'
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SecurityGroupsForm
