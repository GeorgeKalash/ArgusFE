import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function CbBanksForms({ labels, maxAccess, store, setStore }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

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
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      swiftCode: yup.string().required(),
      countryId: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: CashBankRepository.CbBank.set,
        record: JSON.stringify(obj)
      })

      !obj.recordId &&
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      !obj.recordId &&
        setStore({
          recordId: response.recordId,
          name: obj.name
        })
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
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
    })()
  }, [recordId])

  return (
    <FormShell resourceId={ResourceIds.CbBanks} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
                required
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
