import { Grid } from '@mui/material'
import { useContext, useEffect, useState, useRef } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import ImageUpload from 'src/components/Inputs/ImageUpload'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useRefBehavior } from 'src/hooks/useReferenceProxy'
import { MasterSource } from 'src/resources/MasterSource'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { DataSets } from 'src/resources/DataSets'

export default function ItemsForm({ labels, maxAccess: access, setStore, store, setFormikInitial, window }) {
  const { platformLabels } = useContext(ControlContext)
  const [showLotCategories, setShowLotCategories] = useState(false)
  const [showSerialProfiles, setShowSerialProfiles] = useState(false)
  const { recordId } = store
  const [onKitItem, setOnKitItem] = useState(false)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Items.qry
  })
  const imageUploadRef = useRef(null)

  const { changeDT, maxAccess } = useRefBehavior({
    access: access,
    readOnlyOnEditMode: store.recordId,
    name: 'sku'
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
      ivtItem: true,
      salesItem: true,
      purchaseItem: true,
      kitItem: false,
      taxId: '',
      lotCategoryId: null,
      spfId: '',
      categoryName: '',
      defSaleMUId: '',
      pgId: '',
      productionLevel: '',
      collectionId: null,
      isInactive: false
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      categoryId: yup.string().required(),
      name: yup.string().required(),
      priceType: yup.number().required(),
      msId: yup.string().required(),
      lotCategoryId: yup
        .string()
        .nullable()
        .test(function (value) {
          const { trackBy } = this.parent

          return trackBy === 2 ? value != null && value.trim() !== '' : true
        }),
      spfId: yup
        .string()
        .nullable()
        .test(function (value) {
          const { trackBy } = this.parent

          return trackBy === 1 ? value != null && value.trim() !== '' : true
        })
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: InventoryRepository.Items.set,
        record: JSON.stringify({ ...obj, attachment: null })
      })

      if (!obj.recordId) {
        setOnKitItem(false)
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
        setStore(prevStore => ({
          ...prevStore,
          recordId: response.recordId,
          _msId: formik.values.msId,
          _kit: formik.values.kitItem,
          _name: formik.values.name,
          _reference: formik.values.sku
        }))
      } else {
        toast.success(platformLabels.Edited)
      }
      setFormikInitial(formik.values)

      if (imageUploadRef.current) {
        imageUploadRef.current.value = response.recordId

        await imageUploadRef.current.submit()
      }

      const res = await getRequest({
        extension: InventoryRepository.Items.get,
        parameters: `_recordId=${response.recordId}`
      })

      setStore(prevStore => ({
        ...prevStore,
        _reference: res.record.sku
      }))

      formik.setFieldValue('sku', res.record.sku)
      if (window.setTitle && !editMode) {
        window.setTitle(res.record.sku ? `${labels.items} ${res.record.sku}` : labels.items)
      }

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: InventoryRepository.Items.get,
          parameters: `_recordId=${recordId}`
        })

        const res2 = await getRequest({
          extension: InventoryRepository.Category.get,
          parameters: `_recordId=${res?.record?.categoryId}`
        })

        res.record.isInactive = res.record.isInactive || false

        setFormikInitial(res.record)

        formik.setValues({ ...res.record, kitItem: !!res.record.kitItem })
        setShowLotCategories(res.record.trackBy === 2)
        setShowSerialProfiles(res.record.trackBy === 1)
        setStore(prevStore => ({
          ...prevStore,
          nraId: res2?.record?.nraId,
          _msId: res.record.msId,
          _kit: res.record.kitItem,
          productionLevel: res.record.productionLevel,
          measurementId: res.record.defSaleMUId,
          priceGroupId: res.record.pgId,
          returnPolicy: res.record.returnPolicyId,
          _name: res.record.name,
          _reference: res.record.sku
        }))
      }
    })()
  }, [])

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Integration Account',
      condition: true,
      onClick: 'onClickGIA',
      masterSource: MasterSource.Item,
      disabled: !editMode
    }
  ]
  useEffect(() => {
    if (formik.values.kitItem) {
      setOnKitItem(true)

      formik.setFieldValue('ivtItem', false)
      formik.setFieldValue('trackBy', '')
      formik.setFieldValue('valuationMethod', '')
    } else {
      setOnKitItem(false)
      formik.setFieldValue('priceType', '')
    }
  }, [formik.values.kitItem])

  return (
    <FormShell resourceId={ResourceIds.Items} form={formik} maxAccess={maxAccess} editMode={editMode} actions={actions}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <ResourceComboBox
                    dataGrid
                    endpointId={InventoryRepository.Items.pack}
                    reducer={response => {
                      return response?.record?.categories
                    }}
                    values={formik.values}
                    name='categoryId'
                    label={labels.category}
                    valueField='recordId'
                    displayField={['caRef', 'name']}
                    displayFieldWidth={1}
                    columnsInDropDown={[
                      { key: 'caRef', value: 'Reference' },
                      { key: 'name', value: 'Name', width: 8 }
                    ]}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      changeDT(newValue)
                      setStore(prevStore => ({
                        ...prevStore,
                        nraId: newValue?.nraId
                      }))
                      formik.setFieldValue('categoryId', newValue?.recordId || '')
                      if (!formik.values.kitItem) {
                        formik.setFieldValue('priceType', newValue?.priceType || '')
                      }
                      formik.setFieldValue('trackBy', newValue?.trackBy || '')
                      formik.setFieldValue('procurementMethod', newValue?.procurementMethod || '')
                      formik.setFieldValue('msId', newValue?.msId || '')
                      formik.setFieldValue('valuationMethod', newValue?.valuationMethod || '')
                      formik.setFieldValue('taxId', newValue?.taxId || ''),
                        formik.setFieldValue('lotCategoryId', newValue?.lotCategoryId || ''),
                        formik.setFieldValue('spfId', newValue?.spfId || '')
                      setShowLotCategories(newValue?.trackBy === '2' || newValue?.trackBy === 2)
                      setShowSerialProfiles(newValue?.trackBy === '1' || newValue?.trackBy === 1)
                      setStore(prevStore => ({
                        ...prevStore,
                        _metal: formik.values.metalId,
                        _isMetal: newValue?.isMetal
                      }))
                    }}
                    error={formik.touched.categoryId && formik.errors.categoryId}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    dataGrid
                    endpointId={InventoryRepository.Items.pack}
                    reducer={response => {
                      const formattedPriceTypes = response?.record?.priceTypes?.map(priceTypes => ({
                        key: parseInt(priceTypes.key),
                        value: priceTypes.value
                      }))

                      return formattedPriceTypes
                    }}
                    values={formik.values}
                    defaultIndex={onKitItem && 0}
                    name='priceType'
                    label={labels.priceType}
                    readOnly={formik.values.kitItem}
                    valueField='key'
                    displayField='value'
                    displayFieldWidth={1}
                    required
                    maxAccess={maxAccess}
                    onChange={(e, newValue) => {
                      formik.setFieldValue('priceType', newValue?.key || null)
                    }}
                    error={formik.touched.priceType && formik.errors.priceType}
                  />
                </Grid>
                <Grid item xs={8}>
                  <CustomTextField
                    name='sku'
                    required
                    label={labels.reference}
                    value={formik.values.sku}
                    maxAccess={access}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('sku', '')}
                    error={formik.touched.sku && formik.errors.sku}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    dataGrid
                    endpointId={InventoryRepository.Items.pack}
                    reducer={response => {
                      const formattedprocurementMethod = response?.record?.procurementMethods.map(
                        procurementMethods => ({
                          key: parseInt(procurementMethods.key),
                          value: procurementMethods.value
                        })
                      )

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
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('shortName', '')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Items.pack}
                    dataGrid
                    reducer={response => {
                      return response?.record?.itemGroups
                    }}
                    values={formik.values}
                    name='groupId'
                    label={labels.itemGroup}
                    valueField='recordId'
                    displayField={['reference', 'name']}
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
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Collections.qry}
                    name='collectionId'
                    label={labels.collection}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    maxAccess={maxAccess}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('collectionId', newValue?.recordId)
                    }}
                    error={formik.touched.collectionId && Boolean(formik.errors.collectionId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Items.pack}
                    reducer={response => {
                      return response?.record?.measurementSchedules
                    }}
                    values={formik.values}
                    name='msId'
                    label={labels.measure}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    displayFieldWidth={1}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('msId', newValue?.recordId || '')
                    }}
                    error={formik.touched.msId && formik.errors.msId}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Items.pack}
                    reducer={response => {
                      const formattedvaluationMethod = response?.record?.valuations.map(valuations => ({
                        key: parseInt(valuations.key),
                        value: valuations.value
                      }))

                      return formattedvaluationMethod
                    }}
                    values={formik.values}
                    name='valuationMethod'
                    label={labels.valation}
                    readOnly={formik.values.kitItem}
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
            </Grid>

            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ImageUpload ref={imageUploadRef} resourceId={ResourceIds.Items} seqNo={0} recordId={recordId} />
                </Grid>
                <Grid item xs={4}>
                  <CustomCheckBox
                    name='ivtItem'
                    value={formik.values?.ivtItem}
                    onChange={event => formik.setFieldValue('ivtItem', event.target.checked)}
                    label={labels.inventory}
                    maxAccess={maxAccess}
                    disabled={formik.values.kitItem}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomCheckBox
                    name='salesItem'
                    value={formik.values?.salesItem}
                    onChange={event => formik.setFieldValue('salesItem', event.target.checked)}
                    label={labels.sales}
                    maxAccess={maxAccess}
                  />
                </Grid>

                <Grid item xs={4}>
                  <CustomCheckBox
                    name='purchaseItem'
                    value={formik.values?.purchaseItem}
                    onChange={event => formik.setFieldValue('purchaseItem', event.target.checked)}
                    label={labels.purchase}
                    maxAccess={maxAccess}
                  />
                </Grid>

                <Grid item xs={4}>
                  <CustomCheckBox
                    name='kitItem'
                    value={formik.values?.kitItem}
                    onChange={event => formik.setFieldValue('kitItem', event.target.checked)}
                    label={labels.kitItem}
                    disabled={editMode}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.PRODUCTION_LEVEL}
                    name='productionLevel'
                    label={labels.productionLevel}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('productionLevel', newValue?.key || '')
                      setStore(prevStore => ({
                        ...prevStore,
                        productionLevel: newValue?.key
                      }))
                    }}
                    maxAccess={maxAccess}
                    error={formik.touched.productionLevel && Boolean(formik.errors.productionLevel)}
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
                    reducer={response => {
                      return response?.record?.taxSchedules
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
                    reducer={response => {
                      const formattedtrackByList = response?.record?.trackByList.map(trackByList => ({
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
                    readOnly={editMode || formik.values.kitItem}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      const trackByValue = newValue?.key || ''
                      formik.setFieldValue('trackBy', trackByValue)
                      setShowLotCategories(trackByValue === '2' || trackByValue === 2)
                      setShowSerialProfiles(trackByValue === '1' || trackByValue === 1)
                    }}
                    error={formik.touched.trackBy && formik.errors.trackBy}
                  />
                </Grid>

                {showLotCategories && !formik.values.kitItem && (
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={InventoryRepository.Items.pack}
                      reducer={response => {
                        return response?.record?.lotCategories
                      }}
                      values={formik.values}
                      name='lotCategoryId'
                      label={labels.lotCategory}
                      valueField='recordId'
                      displayField='name'
                      readOnly={editMode}
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

                {showSerialProfiles && !formik.values.kitItem && (
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={InventoryRepository.Items.pack}
                      reducer={response => {
                        return response?.record?.serialProfiles
                      }}
                      required
                      values={formik.values}
                      readOnly={editMode}
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
