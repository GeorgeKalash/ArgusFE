import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SCRepository } from 'src/repositories/SCRepository'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const CategoryForm = ({ labels, maxAccess, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Category.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      caRef: '',
      name: '',
      parentId: '',
      lotCategoryId: '',
      nraId: '',
      spfId: '',
      msId: '',
      isMetal: false,
      procurementMethod: '',
      valuationMethod: '',
      metalPurity: '',
      metalId: '',
      priceType: '',
      taxId: '',
      applyVAT: false,
      allowNegativeQty: false,
      isInactive: false
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      metalId: yup
        .string()
        .nullable()
        .test('', function (value) {
          const { isMetal } = this.parent
          if (isMetal) {
            return !!value
          }

          return true
        }),
      taxId: yup
        .string()
        .nullable()
        .test('', function (value) {
          const { applyVAT } = this.parent
          if (applyVAT) {
            return !!value
          }

          return true
        }),
      spfId: yup
        .string()
        .nullable()
        .test('', function (value) {
          const { trackBy } = this.parent
          if (trackBy === 1 || trackBy === '1') {
            return !!value
          }

          return true
        }),
      lotCategoryId: yup
        .string()
        .nullable()
        .test('', function (value) {
          const { trackBy } = this.parent
          if (trackBy === 2 || trackBy === '2') {
            return !!value
          }

          return true
        }),
      caRef: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: InventoryRepository.Category.set,
          record: JSON.stringify(obj)
        })

        if (!obj.recordId) {
          toast.success(platformLabels.Added)

          formik.setFieldValue('recordId', response.recordId)
          setStore(prevStore => ({
            ...prevStore,
            recordId: response.recordId,
            ref: formik.values.caRef,
            name: formik.values.name
          }))
        } else {
          toast.success(platformLabels.Edited)
        }
        invalidate()
      } catch (error) {}
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: InventoryRepository.Category.get,
            parameters: `_recordId=${recordId}`
          })

          setStore(prevStore => ({
            ...prevStore,
            ref: res.record.caRef,
            name: res.record.name
          }))

          formik.setValues({
            ...res.record,
            allowNegativeQty: Boolean(res.record.allowNegativeQty)
          })
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell form={formik} resourceId={ResourceIds.Category} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grid container gap={2}>
          <Grid item xs={7}>
            <Grow>
              <Grid container gap={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='caRef'
                    label={labels.reference}
                    value={formik.values.caRef}
                    required
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('caRef', '')}
                    error={formik.touched.caRef && Boolean(formik.errors.caRef)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='name'
                    label={labels.name}
                    value={formik.values.name}
                    required
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('name', '')}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Category.qry}
                    parameters='_pagesize=30&_startAt=0&_name='
                    name='parentId'
                    label={labels.parentCat}
                    valueField='recordId'
                    displayField={['name', 'caRef']}
                    columnsInDropDown={[
                      { key: 'name', value: 'Name' },
                      { key: 'caRef', value: 'Reference' }
                    ]}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('parentId', newValue?.recordId)
                    }}
                    error={formik.touched.parent && Boolean(formik.errors.parent)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={SystemRepository.NumberRange.snapshot}
                    form={formik}
                    name='nraId'
                    label={labels.nra}
                    valueField='reference'
                    displayField='description'
                    firstValue={formik.values.nraRef}
                    secondValue={formik.values.nraDescription}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('nraId', newValue ? newValue.recordId : null)
                      formik.setFieldValue('nraRef', newValue ? newValue.reference : null)
                      formik.setFieldValue('nraDescription', newValue ? newValue.description : null)
                    }}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Measurement.qry}
                    parameters='_name='
                    name='msId'
                    label={labels.measurementSchedule}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('msId', newValue ? newValue.recordId : '')
                    }}
                    error={formik.touched.msId && Boolean(formik.errors.msId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.PRICE_TYPE}
                    name='priceType'
                    label={labels.pT}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('priceType', newValue?.key)
                    }}
                    error={formik.touched.priceType && Boolean(formik.errors.priceType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.PROCUREMENT_METHOD}
                    name='procurementMethod'
                    label={labels.procurement}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('procurementMethod', newValue?.key)
                    }}
                    error={formik.touched.procurementMethod && Boolean(formik.errors.procurementMethod)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.VALUATION_METHOD}
                    name='valuationMethod'
                    label={labels.valuation}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('valuationMethod', newValue?.key)
                    }}
                    error={formik.touched.valuationMethod && Boolean(formik.errors.valuationMethod)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SCRepository.LabelTemplate.qry}
                    name='labelTemplateId'
                    label={labels.templateLable}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('labelTemplateId', newValue ? newValue.recordId : '')
                    }}
                    error={formik.touched.labelTemplateId && Boolean(formik.errors.labelTemplateId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={IVReplenishementRepository.ReplenishmentGroups.qry}
                    name='replenishmentGroupId'
                    label={labels.replenishmentGroup}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('replenishmentGroupId', newValue ? newValue.recordId : '')
                    }}
                    error={formik.touched.replenishmentGroupId && Boolean(formik.errors.replenishmentGroupId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grow>
          </Grid>
          <Grid item xs={4}>
            <Grow>
              <Grid container gap={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='applyVAT'
                        maxAccess={maxAccess}
                        checked={formik.values?.applyVAT}
                        onChange={e => {
                          formik.setFieldValue('applyVAT', e.target.checked)
                          if (e.target.checked == false) {
                            formik.setFieldValue('taxId', '')
                          }
                        }}
                      />
                    }
                    label={labels.applyVat}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={FinancialRepository.TaxSchedules.qry}
                    name='taxId'
                    label={labels.vatSchedule}
                    readOnly={!formik.values.applyVAT}
                    required={formik.values.applyVAT}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('taxId', newValue ? newValue.recordId : '')
                    }}
                    error={formik.touched.taxId && Boolean(formik.errors.taxId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.IV_TRACK_BY}
                    name='trackBy'
                    label={labels.trackBy}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('trackBy', newValue?.key)
                      formik.setFieldValue('lotCategoryId', '')
                      formik.setFieldValue('spfId', '')
                    }}
                    error={formik.touched.trackBy && Boolean(formik.errors.trackBy)}
                  />
                </Grid>
                {(formik.values.trackBy === '1' || formik.values.trackBy === 1) && (
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={InventoryRepository.SerialNumber.qry}
                      name='spfId'
                      required={formik.values.trackBy === '1' || formik.values.trackBy === 1}
                      label={labels.spf}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('spfId', newValue ? newValue.recordId : '')
                      }}
                      error={
                        formik.touched.spfId &&
                        Boolean(formik.errors.spfId) &&
                        (formik.values.trackBy === '1' || formik.values.trackBy === 1)
                      }
                      maxAccess={maxAccess}
                    />
                  </Grid>
                )}

                {(formik.values.trackBy === '2' || formik.values.trackBy === 2) && (
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={InventoryRepository.LotCategory.qry}
                      name='lotCategoryId'
                      label={labels.lotCategory}
                      required={formik.values.trackBy === '2' || formik.values.trackBy === 2}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('lotCategoryId', newValue ? newValue.recordId : '')
                      }}
                      error={
                        formik.touched.lotCategoryId &&
                        Boolean(formik.errors.lotCategoryId) &&
                        (formik.values.trackBy === '2' || formik.values.trackBy === 2)
                      }
                      maxAccess={maxAccess}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='isMetal'
                        maxAccess={maxAccess}
                        checked={formik.values?.isMetal}
                        onChange={e => {
                          formik.setFieldValue('isMetal', e.target.checked)
                          if (e.target.checked == false) {
                            formik.setFieldValue('metalId', '')
                            formik.setFieldValue('metalPurity', '')
                          }
                        }}
                      />
                    }
                    label={labels.isMetal}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Metals.qry}
                    name='metalId'
                    label={labels.metal}
                    valueField='recordId'
                    displayField={['reference']}
                    readOnly={!formik.values.isMetal}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('metalId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('metalPurity', newValue ? newValue.purity : '')
                    }}
                    error={formik.touched.metalId && Boolean(formik.errors.metalId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='metalPurity'
                    label={labels.purity}
                    value={formik.values.metalPurity}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='allowNegativeQty'
                        maxAccess={maxAccess}
                        checked={formik.values?.allowNegativeQty}
                        onChange={formik.handleChange}
                      />
                    }
                    label={labels.allowNegativeQty}
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
                    label={labels.isInactive}
                  />
                </Grid>
              </Grid>
            </Grow>
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}

export default CategoryForm
