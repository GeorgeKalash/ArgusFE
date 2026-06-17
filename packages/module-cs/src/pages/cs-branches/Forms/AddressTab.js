import { Grid } from '@mui/material'
import * as yup from 'yup'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'

const AddressTab = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId, addressId } = store

  const { formik } = useForm({
    initialValues: {
      recordId: addressId || null,
      branchId: recordId || null,
      name: '',
      street1: '',
      street2: '',
      postalCode: '',
      countryId: null,
      stateId: null,
      cityId: null,
      phone: ''
    },
    maxAccess,
    validationSchema: yup.object({
      street1: yup.string().required(),
      name: yup.string().required(),
      cityId: yup.number().required(),
    }),
    onSubmit: async values => {
      await postRequest({
        extension: SystemRepository.Address.set,
        record: JSON.stringify(values)
      })
      toast.success(platformLabels.Updated)
    }
  })

  useEffect(() => {
    ;(async function () {
      if (addressId) {
        const res = await getRequest({
          extension: SystemRepository.Address.get,
          parameters: `_recordId=${addressId}`
        })
        if (res?.record) formik.setValues(res.record)
      }
    })()
  }, [addressId])

  return (
    <FormShell
      resourceId={ResourceIds.Branches}
      form={formik}
      maxAccess={maxAccess}
      editMode={!!addressId}
      isCleared={false}
      isInfo={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                maxAccess={maxAccess}
                maxLength='50'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='street1'
                label={labels.street}
                value={formik.values.street1}
                maxAccess={maxAccess}
                maxLength='100'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('street1', '')}
                error={formik.touched.street1 && Boolean(formik.errors.street1)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='street2'
                label={labels.street2}
                value={formik.values.street2}
                maxAccess={maxAccess}
                maxLength='100'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('street2', '')}
                error={formik.touched.street2 && Boolean(formik.errors.street2)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='postalCode'
                label={labels.postalCode}
                value={formik.values.postalCode}
                maxLength='5'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('postalCode', '')}
                error={formik.touched.postalCode && Boolean(formik.errors.postalCode)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                label={labels.country}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('countryId', newValue?.recordId ?? null)
                  formik.setFieldValue('stateId', null)
                }}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.State.qry}
                parameters={formik.values.countryId ? `_countryId=${formik.values.countryId}` : ''}
                name='stateId'
                label={labels.state}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                readOnly={!formik.values.countryId}
                onChange={(_, newValue) => {
                  formik.setFieldValue('stateId', newValue?.recordId || null)
                }}
                error={formik.touched.stateId && Boolean(formik.errors.stateId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.City.snapshot}
                parameters={{
                  _countryId: formik.values.countryId,
                  _stateId: formik.values.stateId || 0
                }}
                valueField='reference'
                displayField='name'
                name='city'
                label={labels.city}
                required
                form={formik}
                secondDisplayField={false}
                firstValue={formik.values.city}
                onChange={(_, newValue) => {
                  formik.setFieldValue('cityId', newValue?.recordId || null)
                }}
                errorCheck={'cityId'}
                maxAccess={maxAccess}
                readOnly={!formik.values.countryId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='phone'
                label={labels.phone}
                value={formik.values.phone}
                maxLength='40'
                phone={true}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('phone', '')}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default AddressTab