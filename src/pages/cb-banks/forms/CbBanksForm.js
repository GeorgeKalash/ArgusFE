import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ControlContext } from 'src/providers/ControlContext'

export default function CbBanksForms({ labels, maxAccess, store, setStore, setEditMode }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CbBank.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      reference: '',
      name: '',
      swiftCode: '',
      accNoLength: '',
      countryId: ''
    },
    maxAccess: maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      swiftCode: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: CashBankRepository.CbBank.set,
          record: JSON.stringify(obj)
        })

        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          formik.setValues({
            ...obj,
            recordId: response.recordId
          })
          setStore({
            recordId: response.recordId,
            name: obj.name
          })
          setEditMode(true)
        } else {
          toast.success(platformLabels.Edited)
        }

        invalidate()
      } catch (error) {}
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: CashBankRepository.CbBank.get,
            parameters: `_recordId=${recordId}`
          })
          formik.setValues(res.record)
          setStore({
            recordId: res.record.recordId,
            name: res.record.name
          })
        }
      } catch (exception) {}
    })()
  }, [recordId])

  return (
    <FormShell resourceId={ResourceIds.CbBanks} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxAccess={maxAccess}
                maxLength='20'
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
                required
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='swiftCode'
                label={labels.swiftCode}
                value={formik.values.swiftCode}
                maxLength='20'
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('swiftCode', '')}
                error={formik.touched.swiftCode && Boolean(formik.errors.swiftCode)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='accNoLength'
                label={labels.accNoLength}
                value={formik.values.accNoLength}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('accNoLength', '')}
                error={formik.touched.accNoLength && Boolean(formik.errors.accNoLength)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                label={labels.Country}
                valueField='recordId'
                displayField={['reference', 'name', 'flName']}
                columnsInDropDown={[
                  { key: 'reference', value: 'reference' },
                  { key: 'name', value: 'name' },
                  { key: 'flName', value: 'flName' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('countryId', newValue?.recordId || null)
                }}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
