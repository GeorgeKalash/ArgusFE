import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { Grid } from '@mui/material'
import { useInvalidate } from 'src/hooks/resource'

const AgingForm = ({ recordId, labels, maxAccess, name, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.AgingProfile.qry
  })

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      agingLeg: yup
        .array()
        .of(
          yup.object().shape({
            days: yup.string().required(),
            caption: yup.string().required()
          })
        )
        .required()
    }),
    initialValues: {
      name: name,
      recordId: recordId || '',
      agingLeg: [
        {
          id: 1,
          agpId: recordId || '',
          days: '',
          caption: ''
        }
      ]
    },
    onSubmit: values => {
      const { agingLeg } = values

      if (agingLeg.length === 1 && isRowEmpty(agingLeg[0])) {
        formik.setValues({ ...values, agingLeg: [] })
        postData([])
      } else {
        postData(values)
      }
    }
  })

  const isRowEmpty = row => {
    return !row.caption && !row.days
  }

  const postData = async obj => {
    const items =
      obj?.agingLeg?.map((item, index) => ({
        ...item,
        agpId: recordId,
        seqNo: index + 1
      })) || []

    const data = {
      header: {
        recordId: recordId || '',
        name: formik.values.name
      },
      items: items
    }

    const response = await postRequest({
      extension: FinancialRepository.AgingProfile.set2,
      record: JSON.stringify(data)
    })

    if (!obj.recordId) {
      formik.setFieldValue('recordId', response.recordId)
      toast.success(platformLabels.Added)
      window.close()
    } else {
      toast.success(platformLabels.Edited)
    }
    invalidate()
  }

  const columns = [
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'days'
    },
    {
      component: 'textfield',
      label: labels.caption,
      name: 'caption'
    }
  ]

  function getData() {
    getRequest({
      extension: FinancialRepository.AgingLeg.qry,
      parameters: `_agpId=${recordId}`
    }).then(res => {
      const modifiedList = res.list?.map((agingLegItems, index) => ({
        ...agingLegItems,
        id: index + 1
      }))
      formik.setValues({
        ...formik.values,
        agingLeg: modifiedList
      })
    })
  }

  const editMode = !!formik.values.recordId

  useEffect(() => {
    if (recordId) {
      getData()
    }
  }, [recordId])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.FIAgingProfile}
      isCleared={false}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={formik.values.name}
              required
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('name', '')}
              error={formik.touched.name && Boolean(formik.errors.name)}
              maxAccess={maxAccess}
            />
          </Grid>
          <DataGrid
            onChange={value => formik.setFieldValue('agingLeg', value)}
            value={formik.values.agingLeg || []}
            error={formik.errors.agingLeg}
            allowDelete
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default AgingForm
