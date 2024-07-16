import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useInvalidate } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const CorrespondentForm = ({ labels, editMode, maxAccess, setEditMode, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.Correspondent.qry
  })

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      recordId: null,
      name: null,
      reference: null,
      bpId: null,
      currencyId: null,
      currencyRef: null,
      isInactive: false,
      interfaceId: null
    },
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      bpId: yup.string().required(),
      bpRef: yup.string().required(),
      bpName: yup.string().required()
    }),
    onSubmit: values => {
      postCorrespondent(values)
    }
  })

  const postCorrespondent = obj => {
    const recordId = obj?.recordId || ''
    postRequest({
      extension: RemittanceSettingsRepository.Correspondent.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!recordId) {
          setEditMode(true)
          setStore(prevStore => ({
            ...prevStore,
            recordId: res.recordId
          }))
          toast.success(platformLabels.Added)

          formik.setFieldValue('recordId', res.recordId)
        } else {
          toast.success(platformLabels.Edited)
        }
        invalidate()
      })
      .catch(error => {})
  }

  useEffect(() => {
    recordId && getCorrespondentById(recordId)
  }, [recordId])

  const getCorrespondentById = recordId => {
    const defaultParams = `_recordId=${recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.Correspondent.get,
      parameters: parameters
    })
      .then(res => {
        formik.setValues(res.record)
        setEditMode(true)
      })
      .catch(error => {})
  }

  return (
    <FormShell form={formik} resourceId={ResourceIds.Correspondent} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                onChange={formik.handleChange}
                maxLength='10'
                maxAccess={maxAccess}
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
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceLookup
                endpointId={BusinessPartnerRepository.MasterData.snapshot}
                name='bpRef'
                required
                label={labels.businessPartner}
                valueField='reference'
                displayField='name'
                valueShow='bpRef'
                secondValueShow='bpName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setValues({
                    ...formik.values,
                    bpId: newValue?.recordId || '',
                    bpRef: newValue?.reference || '',
                    bpName: newValue?.name || ''
                  })
                }}
                errorCheck={'bpId'}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceSettingsRepository.Interface.qry}
                name='interfaceId'
                label={labels.interface}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('interfaceId', newValue?.recordId)
                }}
                error={formik.touched.interfaceId && Boolean(formik.errors.interfaceId)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='isInactive'
                    checked={formik.values?.isInactive}
                    onChange={formik.handleChange}
                    maxAccess={maxAccess}
                  />
                }
                label={labels.isInActive}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default CorrespondentForm
