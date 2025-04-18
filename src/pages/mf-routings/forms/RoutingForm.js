import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ControlContext } from 'src/providers/ControlContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function RoutingForm({ labels, maxAccess, setStore, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store
  const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Routing.page
  })

  const formik = useFormik({
    initialValues: {
      recordId: null,
      reference: '',
      name: '',
      isInactive: false
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: ManufacturingRepository.Routing.set,
        record: JSON.stringify(obj)
      })

      formik.setFieldValue('recordId', res.recordId)
      setStore(prevStore => ({
        ...prevStore,
        recordId: res.recordId
      }))
      toast.success(!recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: ManufacturingRepository.Routing.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res.record
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Routings} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            rows={2}
            maxLength='10'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            maxLength='50'
            required
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={ManufacturingRepository.ProductionLine.qry}
            name='lineId'
            label={labels.lineId}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            valueField='recordId'
            displayField={['reference', 'name']}
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('lineId', newValue?.recordId || null)
            }}
            maxAccess={maxAccess}
            error={formik.touched.lineId && Boolean(formik.errors.lineId)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomCheckBox
            name='isInactive'
            value={formik.values?.isInactive}
            onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
            label={labels.isInactive}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
