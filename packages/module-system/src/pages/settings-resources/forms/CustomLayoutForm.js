import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

const CustomLayoutForm = ({ labels, maxAccess, row, invalidate, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const conditions = {
    reportName: row => row.reportName,
    wsName: row => row.wsName,
    caption: row => row.caption,
    assembly: row => ({
      optional: row.reportEngine != 1,
      valid: row.reportEngine != 1 || !!row.assembly
    }),
    schemaFile: row => ({
      optional: row.reportEngine != 2,
      valid: row.reportEngine != 2 || !!row.schemaFile
    })
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    conditionSchema: ['items'],
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    maxAccess,
    initialValues: {
      resourceId: row.resourceId,
      resourceName: row.resourceName,
      items: [
        {
          id: 1,
          seqNo: '',
          resourceId: '',
          wsName: '',
          reportName: '',
          assembly: '',
          parameters: '',
          caption: '',
          isInactive: false
        }
      ]
    },
    onSubmit: async values => {
      const filteredItems = values.items.filter(item =>
        Object.values(requiredFields)?.every(fn => fn(item))
      )

      await postData({
        resourceId: row.resourceId,
        items: filteredItems
      })
    }
  })

  const postData = async obj => {
    const items =
      obj?.items?.map((item, index) => ({
        ...item,
        resourceId: row.resourceId,
        seqNo: index + 1
      })) || []

    const data = {
      resourceId: row.resourceId,
      data: items
    }

    await postRequest({
      extension: SystemRepository.ReportTemplate.set2,
      record: JSON.stringify(data)
    })

    toast.success(platformLabels.Updated)
    fetchData()
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.id,
      name: 'savedIndex',
      props: { disabled: true }
    },
    {
      component: 'resourcecombobox',
      name: 'reportEngineName',
      label: labels.reportEngineName,
      flex: 1,
      props: {
        datasetId: DataSets.REPORT_ENGINE,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'reportEngine' },
          { from: 'value', to: 'reportEngineName' }
        ]
      },
      async onChange({ row: { update } }) {
        update({
          assembly: null,
          schemaFile: null
        })
      }
    },
    {
      component: 'textfield',
      label: labels.api,
      name: 'wsName'
    },
    {
      component: 'textfield',
      label: labels.instanceName,
      name: 'reportName'
    },
    {
      component: 'textfield',
      label: labels.assembly,
      name: 'assembly',
      propsReducer({ row, props }) {
        return {
          ...props,
          readOnly: row.reportEngine != 1,
          required: row.reportEngine == 1
        }
      }
    },
    {
      component: 'textfield',
      label: labels.params,
      name: 'parameters'
    },
    {
      component: 'textfield',
      label: labels.layoutName,
      name: 'caption'
    },
    {
      component: 'checkbox',
      label: labels.isInactive,
      name: 'isInactive'
    },
    {
      component: 'textfield',
      label: labels.schemaFile,
      name: 'schemaFile',
      propsReducer({ row, props }) {
        return {
          ...props,
          readOnly: row.reportEngine != 2,
          required: row.reportEngine == 2
        }
      }
    },
    {
      component: 'textfield',
      valueGetter: (params) =>
        params?.data?.originalInactive !== true && params?.data?.savedIndex != null
          ? labels.default
          : '',
      flex: 0.5,
      props: { disabled: true },
      link: {   
        enabled: true,     
        onClick: async (row) => {
          await postRequest({
            extension: SystemRepository.DefaultLayout.setDefaultLayout,
            record: JSON.stringify({
              resourceId: row.resourceId,
              defaultLayoutId: row.id
            })
          })

          toast.success(platformLabels.Updated)
          invalidate()
          window.close()
        }
      }
    }
  ]
  const fetchData = async () => {
    getRequest({
      extension: SystemRepository.ReportTemplate.qry,
      parameters: `_resourceId=${row.resourceId}`
    }).then(res => {
      const modifiedList = res.list
        ?.map((itemPartsItem, index) => ({
          ...itemPartsItem,
          originalInactive: itemPartsItem.isInactive,
          savedIndex: itemPartsItem.id
        }))
      formik.setValues({
        ...formik.values,
        items: modifiedList
      })
    })

  }

  useEffect(() => {
    fetchData()
  }, [])

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
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            allowDelete
            name='items'
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default CustomLayoutForm
