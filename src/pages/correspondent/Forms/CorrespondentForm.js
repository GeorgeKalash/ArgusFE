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
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useInvalidate } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

const CorrespondentForm = ({ labels, editMode, maxAccess, setEditMode, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.Correspondent.page
  })

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      recordId: null,
      name: null,
      reference: null,
      bpId: null,
      cgId: null,
      currencyId: null,
      currencyRef: null,
      owRateTypeId: null,
      iwRateTypeId: null,
      isInactive: false,
      interfaceId: null,
      accountId: null,
      nraRef: null,
      nraDescription: null,
      nraId: null,
      minReviewTime: null
    },
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      bpId: yup.string().required(),
      cgId: yup.number().required(),
      bpRef: yup.string().required(),
      bpName: yup.string().required()
    }),
    onSubmit: async values => {
      await postCorrespondent(values)
    }
  })

  const postCorrespondent = async obj => {
    const recordId = obj?.recordId || ''
    await postRequest({
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
          getCorrespondentById(res.recordId)
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
                readOnly={editMode}
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
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='accountId'
                label={labels.accountRef}
                valueField='reference'
                displayField='name'
                valueShow='accountRef'
                secondValueShow='accountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId || '')
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
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
                endpointId={RemittanceSettingsRepository.CorrespondentGroup.qry}
                name='cgId'
                label={labels.group}
                valueField='recordId'
                required
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cgId', newValue?.recordId)
                }}
                error={formik.touched.cgId && Boolean(formik.errors.cgId)}
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
              <ResourceComboBox
                endpointId={MultiCurrencyRepository.RateType.qry}
                name='owRateTypeId'
                label={labels.owRateType}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('owRateTypeId', newValue?.recordId)
                }}
                error={formik.touched.owRateTypeId && Boolean(formik.errors.owRateTypeId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={MultiCurrencyRepository.RateType.qry}
                name='iwRateTypeId'
                label={labels.iwRateType}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('iwRateTypeId', newValue?.recordId)
                }}
                error={formik.touched.iwRateTypeId && Boolean(formik.errors.iwRateTypeId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.NumberRange.snapshot}
                valueField='reference'
                displayField='description'
                name='nraId'
                valueShow='nraRef'
                secondValueShow='nraDescription'
                label={labels.nuRange}
                form={formik}
                secondDisplayField={true}
                firstValue={formik.values.nraRef}
                secondValue={formik.values.nraDescription}
                onChange={(event, newValue) => {
                  formik.setFieldValue('nraId', newValue?.recordId || null)
                  formik.setFieldValue('nraRef', newValue?.reference || null)
                  formik.setFieldValue('nraDescription', newValue?.description || null)
                }}
                errorCheck={'nraId'}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='minReviewTime'
                label={labels.minReviewTime}
                value={formik.values.minReviewTime}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('minReviewTime', '')}
                error={formik.touched.minReviewTime && Boolean(formik.errors.minReviewTime)}
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
