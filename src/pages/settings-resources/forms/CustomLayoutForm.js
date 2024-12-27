import { Grid } from '@mui/material'
import * as yup from 'yup'
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
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'

const CustomLayoutForm = ({ labels, maxAccess, row, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const isRowEmpty = row => {
    return !row.reportName && !row.caption && !row.assembly && !row.wsName
  }

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      items: yup
        .array()
        .of(
          yup.object().shape({
            reportName: yup.string().test(function (value) {
              const row = this.parent
              const isAnyFieldFilled = row.reportName || row.caption || row.assembly || row.wsName

              if (this.options.from[1]?.value?.items?.length === 1) {
                if (isAnyFieldFilled) {
                  return !!value
                }

                return true
              }

              return !!value
            }),

            wsName: yup.string().test(function (value) {
              const row = this.parent
              const isAnyFieldFilled = row.reportName || row.caption || row.assembly || row.wsName

              if (this.options.from[1]?.value?.items?.length === 1) {
                if (isAnyFieldFilled) {
                  return !!value
                }

                return true
              }

              return !!value
            }),

            caption: yup.string().test(function (value) {
              const row = this.parent
              const isAnyFieldFilled = row.reportName || row.caption || row.assembly || row.wsName

              if (this.options.from[1]?.value?.items?.length === 1) {
                if (isAnyFieldFilled) {
                  return !!value
                }

                return true
              }

              return !!value
            }),

            assembly: yup.string().test(function (value) {
              const row = this.parent
              const isAnyFieldFilled = row.reportName || row.caption || row.assembly || row.wsName

              if (this.options.from[1]?.value?.items?.length === 1) {
                if (isAnyFieldFilled) {
                  return !!value
                }

                return true
              }

              return !!value
            })
          })
        )
        .required()
    }),
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
    onSubmit: values => {
      const { items } = values

      if (items.length === 1 && isRowEmpty(items[0])) {
        postData({ resourceId: row.resourceId, items: [] })
      } else {
        postData(values)
      }
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
      data: items || []
    }

    await postRequest({
      extension: SystemRepository.ReportTemplate.set2,
      record: JSON.stringify(data)
    })

    toast.success(platformLabels.Updated)
    window.close()
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.api,
      name: 'wsName'
    },
    {
      component: 'textfield',
      label: labels.reportName,
      name: 'reportName'
    },
    {
      component: 'textfield',
      label: labels.assembly,
      name: 'assembly'
    },
    {
      component: 'textfield',
      label: labels.params,
      name: 'parameters'
    },
    {
      component: 'textfield',
      label: labels.caption,
      name: 'caption'
    },
    {
      component: 'checkbox',
      label: labels.isInactive,
      name: 'isInactive'
    }
  ]

  useEffect(() => {
    getRequest({
      extension: SystemRepository.ReportTemplate.qry,
      parameters: `_resourceId=${row.resourceId}`
    }).then(res => {
      const modifiedList = res.list?.map((itemPartsItem, index) => ({
        ...itemPartsItem,
        id: index + 1
      }))
      formik.setValues({
        ...formik.values,
        items: modifiedList
      })
    })
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
    </FormShell>
  )
}

export default CustomLayoutForm
