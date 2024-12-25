import { Grid } from '@mui/material'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'

const CustomRulesForm = ({ labels, maxAccess, row, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const isRowEmpty = row => {
    return !row.seqNo && !row.description && !row.name
  }

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      items: yup
        .array()
        .of(
          yup.object().shape({
            seqNo: yup.string().test(function (value) {
              const row = this.parent
              const isAnyFieldFilled = row.seqNo || row.description || row.name

              if (this.options.from[1]?.value?.items?.length === 1) {
                if (isAnyFieldFilled) {
                  return !!value
                }

                return true
              }

              return !!value
            }),

            name: yup.string().test(function (value) {
              const row = this.parent
              const isAnyFieldFilled = row.seqNo || row.description || row.name

              if (this.options.from[1]?.value?.items?.length === 1) {
                if (isAnyFieldFilled) {
                  return !!value
                }

                return true
              }

              return !!value
            }),

            description: yup.string().test(function (value) {
              const row = this.parent
              const isAnyFieldFilled = row.seqNo || row.description || row.name

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

          resourceId: '',
          seqNo: '',
          name: '',
          description: ''
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
        moduleId: 0
      })) || []

    const data = {
      resourceId: row.resourceId,
      data: items || []
    }

    await postRequest({
      extension: SystemRepository.Rules.set2,
      record: JSON.stringify(data)
    })

    toast.success(platformLabels.Updated)
    window.close()
  }

  const columns = [
    {
      component: 'numberfield',
      label: labels.ruleId,
      name: 'seqNo'
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'name'
    },
    {
      component: 'textfield',
      label: labels.description,
      name: 'description'
    }
  ]

  useEffect(() => {
    getRequest({
      extension: SystemRepository.Rules.qry,
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
          <Grid item width={'50.1%'}>
            <CustomTextField
              name='resourceId'
              label={labels.resourceId}
              value={formik.values.resourceId}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item width={'50.1%'}>
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
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default CustomRulesForm
