import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function ItemsForm({ labels, recordId, maxAccess }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const { platformLabels } = useContext(ControlContext)
  const [showLotCategories, setShowLotCategories] = useState(false)
  const [showSerialProfiles, setShowSerialProfiles] = useState(false)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Items.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      sku: '',
      categoryId: null,
      flName: '',
      shortName: '',
      groupId: null,
      msId: null,
      description: '',
      priceType: null,
      ptName: '',
      procurementMethod: null,
      valuationMethod: null,
      volume: '',
      weght: '',
      trackBy: null,
      unitPrice: '',
      ivtItem: false,
      kitItem: false,
      salesItem: false,
      purchaseItem: false,
      taxId: null,
      lotCategoryId: null,
      spfId: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      categoryId: yup.string().required(' '),
      sku: yup.string().required(' '),
      name: yup.string().required(' '),
      priceType: yup.string().required(' '),
      msId: yup.string().required(' '),
      lotCategoryId: yup
        .string()
        .nullable()
        .test('is-lotcategory-required', 'Lot Category is required', function (value) {
          const { trackBy } = this.parent

          return trackBy === '2' || trackBy === 2 ? value != null && value.trim() !== '' : true
        }),
      spfId: yup
        .string()
        .nullable()
        .test('is-spfId-required', 'spfId is required', function (value) {
          const { trackBy } = this.parent

          return trackBy === '1' || trackBy === 1 ? value != null && value.trim() !== '' : true
        })
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: InventoryRepository.Items.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success(platformLabels.Edited)
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: InventoryRepository.Items.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch {}
    })()
  }, [])

  useEffect(() => {
    setShowLotCategories(formik.values.trackBy === '2' || formik.values.trackBy === 2)
    setShowSerialProfiles(formik.values.trackBy === '1' || formik.values.trackBy === 1)
  }, [formik.values.trackBy])

  console.log(formik.values, 'formikkkk')

  //   useEffect(() => {
  //     ;(async function () {
  //       try {
  //         const response = await getRequest({
  //           extension: InventoryRepository.Items.pack
  //         })

  //         setValues(formattedCategories)
  //         console.log(formattedCategories, 'formattedC')
  //       } catch (error) {}
  //     })()
  //   }, [])

  console.log(formik.values, 'formikkkk')

  return (
    <FormShell resourceId={ResourceIds.Items} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={5.9}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Items.pack}
                    getList={response => {
                      return response.record.categories
                    }}
                    values={formik.values}
                    name='categoryId'
                    label={labels.category}
                    valueField='recordId'
                    displayField='name'
                    displayFieldWidth={1}
                    columnsInDropDown={[
                      { key: 'caRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('categoryId', newValue?.recordId || '')
                      formik.setFieldValue('categoryName', newValue?.name || '')
                      formik.setFieldValue('categoryRef', newValue?.caRef || '')
                    }}
                    error={formik.touched.categoryId && formik.errors.categoryId}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Items.pack}
                    getList={response => {
                      const formattedPriceTypes = response.record.priceTypes.map(priceTypes => ({
                        key: parseInt(priceTypes.key),
                        value: priceTypes.value
                      }))

                      return formattedPriceTypes
                    }}
                    values={formik.values}
                    name='priceType'
                    label={labels.priceType}
                    valueField='key'
                    displayField='value'
                    displayFieldWidth={1}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('priceType', newValue?.key || '')
                      formik.setFieldValue('ptName', newValue?.value || '')
                    }}
                    error={formik.touched.priceType && formik.errors.priceType}
                  />
                </Grid>
                <Grid item xs={5.9}>
                  <CustomTextField
                    name='sku'
                    label={labels.reference}
                    value={formik.values.sku}
                    required
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('sku', '')}
                    error={formik.touched.sku && formik.errors.sku}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Items.pack}
                    getList={response => {
                      const formattedprocurementMethod = response.record.procurementMethods.map(procurementMethods => ({
                        key: parseInt(procurementMethods.key),
                        value: procurementMethods.value
                      }))

                      return formattedprocurementMethod
                    }}
                    name='procurementMethod'
                    label={labels.procurement}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('procurementMethod', newValue?.key || '')
                      formik.setFieldValue('procurementName', newValue?.value || '')
                    }}
                    error={formik.touched.procurementMethod && formik.errors.procurementMethod}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    name='name'
                    label={labels.name}
                    value={formik.values.name}
                    required
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('name', '')}
                    error={formik.touched.name && formik.errors.name}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    name='flName'
                    label={labels.flName}
                    value={formik.values.flName}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('flName', '')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    name='shortName'
                    label={labels.shortName}
                    value={formik.values.shortName}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('shortName', '')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Items.pack}
                    getList={response => {
                      return response.record.itemGroups
                    }}
                    values={formik.values}
                    name='groupId'
                    label={labels.itemGroup}
                    valueField='recordId'
                    displayField='name'
                    displayFieldWidth={1}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('groupId', newValue?.recordId || '')
                    }}
                    error={formik.touched.groupId && formik.errors.groupId}
                  />
                </Grid>

                <Grid item xs={5.9}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Items.pack}
                    getList={response => {
                      return response.record.measurementSchedules
                    }}
                    values={formik.values}
                    name='msId'
                    label={labels.measure}
                    valueField='recordId'
                    displayField='name'
                    displayFieldWidth={1}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('msId', newValue?.recordId || '')
                      formik.setFieldValue('msName', newValue?.name || '')
                    }}
                    error={formik.touched.msId && formik.errors.msId}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Items.pack}
                    getList={response => {
                      const formattedvaluationMethod = response.record.valuations.map(valuations => ({
                        key: parseInt(valuations.key),
                        value: valuations.value
                      }))

                      return formattedvaluationMethod
                    }}
                    values={formik.values}
                    name='valuationMethod'
                    label={labels.valation}
                    valueField='key'
                    displayField='value'
                    displayFieldWidth={1}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('valuationMethod', newValue?.key || '')
                    }}
                    error={formik.touched.valuationMethod && formik.errors.valuationMethod}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='description'
                    label={labels.description}
                    value={formik.values.description}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('description', '')}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='ivtItem'
                        checked={formik.values.ivtItem}
                        onChange={formik.handleChange}
                        maxAccess={maxAccess}
                      />
                    }
                    label={labels.inventory}
                  />
                </Grid>

                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='kitItem'
                        checked={formik.values.kitItem}
                        onChange={formik.handleChange}
                        maxAccess={maxAccess}
                      />
                    }
                    label={labels.kitItem}
                  />
                </Grid>

                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='salesItem'
                        checked={formik.values.salesItem}
                        onChange={formik.handleChange}
                        maxAccess={maxAccess}
                      />
                    }
                    label={labels.sales}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='purchaseItem'
                        checked={formik.values.purchaseItem}
                        onChange={formik.handleChange}
                        maxAccess={maxAccess}
                      />
                    }
                    label={labels.purchase}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='unitPrice'
                    label={labels.unitPrice}
                    value={formik.values.unitPrice}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('unitPrice', '')}
                    error={formik.touched.unitPrice && formik.errors.unitPrice}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Items.pack}
                    getList={response => {
                      return response.record.taxSchedules
                    }}
                    values={formik.values}
                    name='taxId'
                    label={labels.vatSchedule}
                    valueField='recordId'
                    displayField='name'
                    displayFieldWidth={1}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('taxId', newValue?.recordId || '')
                    }}
                    error={formik.touched.taxId && formik.errors.taxId}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Items.pack}
                    getList={response => {
                      const formattedtrackByList = response.record.trackByList.map(trackByList => ({
                        key: parseInt(trackByList.key),
                        value: trackByList.value
                      }))

                      return formattedtrackByList
                    }}
                    values={formik.values}
                    name='trackBy'
                    label={labels.trackBy}
                    valueField='key'
                    displayField='value'
                    displayFieldWidth={1}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('trackBy', newValue?.key || '')
                    }}
                    error={formik.touched.trackBy && formik.errors.trackBy}
                  />
                </Grid>

                {showLotCategories && (
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={InventoryRepository.Items.pack}
                      getList={response => {
                        return response.record.lotCategories
                      }}
                      values={formik.values}
                      name='lotCategoryId'
                      label={labels.lotCategory}
                      valueField='recordId'
                      displayField='name'
                      displayFieldWidth={1}
                      required
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('lotCategoryId', newValue?.recordId || '')
                        formik.setFieldValue('lotCategoryName', newValue?.name || '')
                      }}
                      error={
                        formik.touched.lotCategoryId &&
                        Boolean(formik.errors.lotCategoryId) &&
                        !formik.values.lotCategoryName
                      }
                    />
                  </Grid>
                )}

                {showSerialProfiles && (
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={InventoryRepository.Items.pack}
                      getList={response => {
                        return response.record.serialProfiles
                      }}
                      required
                      values={formik.values}
                      name='spfId'
                      label={labels.sprofile}
                      valueField='recordId'
                      displayField='name'
                      displayFieldWidth={1}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('spfId', newValue?.recordId || '')
                        formik.setFieldValue('spfName', newValue?.name || '')
                      }}
                      error={formik.touched.spfId && Boolean(formik.errors.spfId) && !formik.values.spfName}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

// Procurement
// Item Group

// Valuation
// Vat Schedule
// Track By
// Unit Price
// Lot Category
//
