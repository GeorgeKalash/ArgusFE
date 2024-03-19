import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function BPMasterDataForm({ labels, maxAccess, defaultValue, recordId, height , store, setStore}) {
  const [isLoading, setIsLoading] = useState(false)


  const [initialValues, setInitialData] = useState({
    recordId: null,
    reference: '',
    name: '',
    category: null,
    categoryName: null,
    groupId: null,
    groupName: null,
    flName: '',
    defaultInc: '',
    isInactive: false,
    keywords: '',
    plId: null,
    shipAddressId: null,
    billAddressId: null,
    birthDate: null,
    birthPlace: '',
    nationalityId: null,
    legalStatusId: null,
    isBlackListed: false,
    groupName: null,
    nationalityName: null,
    nationalityRef: null,
    legalStatus: null
  })

  const { getRequest, postRequest } = useContext(RequestsContext)
  const {category} = store
  const editMode = !!recordId

  const filterIdCategory = async categId => {
    try {
      const res = await getRequest({
        extension: BusinessPartnerRepository.CategoryID.qry,
        parameters: `_startAt=0&_pageSize=1000`
      })

     return  categId
        ? res.list.filter(
            item => (categId === 1 && item.person) || (categId === 2 && item.org) || (categId === 3 && item.group)
          )

        : []



    } catch (error) {

      return []
    }
  }

  const invalidate = useInvalidate({
    endpointId: BusinessPartnerRepository.MasterData.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      category: yup.string().required('This field is required'),
      groupId: yup.string().required('This field is required'),
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      await postRequest({
        extension: BusinessPartnerRepository.MasterData.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) toast.success('Record Added Successfully')
      else toast.success('Record Edited Successfully')

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: BusinessPartnerRepository.MasterData.get,
            parameters: `_recordId=${recordId}`
          })

          setInitialData(res.record)
        }
      } catch (exception) {
      }
      setIsLoading(false)
    })()
  }, [])

  useEffect(() => {
    ;(async function () {
      if (formik?.values?.category){

     const _category = await filterIdCategory(formik.values.category)


        setStore(prevStore => ({
          ...prevStore,
          category: _category
        }));
}
    })()
  }, [formik?.values?.category])

  return (
    <FormShell
      resourceId={ResourceIds.BPMasterData}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.BP_CATEGORY}
              name='category'
              label={labels.category}
              valueField='key'
              displayField='value'
              values={formik.values}
              required
              readOnly={editMode}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('category', newValue?.key)
              }}
              error={formik.touched.category && Boolean(formik.errors.category)}
              helperText={formik.touched.category && formik.errors.category}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={BusinessPartnerRepository.Group.qry}
              name='groupId'
              label={labels.group}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              required
              readOnly={editMode}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('groupId', newValue?.recordId)
              }}
              error={formik.touched.groupId && Boolean(formik.errors.groupId)}
              helperText={formik.touched.groupId && formik.errors.groupId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={formik.values.reference}
              required
              readOnly={editMode}
              maxLength='15'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('reference', '')}
              error={formik.touched.reference && Boolean(formik.errors.reference)}
              helperText={formik.touched.reference && formik.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={formik.values.name}
              required
              maxLength='70'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('name', '')}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker
              name='birthDate'
              label={labels.birthDate}
              value={formik.values.birthDate}
              onChange={formik.handleChange}
              maxAccess={maxAccess}
              onClear={() => formik.setFieldValue('birthDate', '')}
              error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
              helperText={formik.touched.birthDate && formik.errors.birthDate}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='birthPlace'
              label={labels.birthPlace}
              value={formik.values.birthPlace}
              maxLength='30'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('birthPlace', '')}
              error={formik.touched.birthPlace && Boolean(formik.errors.birthPlace)}
              helperText={formik.touched.birthPlace && formik.errors.birthPlace}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='flName'
              label={labels.foreignLanguage}
              value={formik.values.flName}
              maxLength='70'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('flName', '')}
              error={formik.touched.flName && Boolean(formik.errors.flName)}
              helperText={formik.touched.flName && formik.errors.flName}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='keywords'
              label={labels.keywords}
              value={formik.values.keywords}
              maxLength='30'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('keywords', '')}
              error={formik.touched.keywords && Boolean(formik.errors.keywords)}
              helperText={formik.touched.keywords && formik.errors.keywords}
            />
          </Grid>
          <Grid item xs={12}>
            {category && (
              <CustomComboBox
                name='defaultInc'
                label={labels.idCategory}
                valueField='recordId'
                displayField='name'
                store={category}
                value={category.filter(item => item.recordId === formik.values.defaultInc)[0]}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('defaultInc', newValue?.recordId)
                }}
                error={formik.touched.defaultInc && Boolean(formik.errors.defaultInc)}
                helperText={formik.touched.defaultInc && formik.errors.defaultInc}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              label={labels.defaultId}
              value={defaultValue}
              maxAccess={maxAccess}
              readOnly={!formik.values?.defaultInc}
              onClear={() => formik.setFieldValue('defaultId', '')}
              error={formik.touched.defaultId && Boolean(formik.errors.defaultId)}
              helperText={formik.touched.defaultId && formik.errors.defaultId}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Country.qry}
              name='nationalityId'
              label={labels.nationalityId}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              valueField='recordId'
              displayField='name'
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('nationalityId', newValue?.recordId)
              }}
              error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
              helperText={formik.touched.nationalityId && formik.errors.nationalityId}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={BusinessPartnerRepository.LegalStatus.qry}
              parameters={`_startAt=0&_pageSize=100`}
              name='legalStatusId'
              label={labels.legalStatus}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('legalStatusId', newValue?.recordId)
              }}
              error={formik.touched.legalStatusId && Boolean(formik.errors.legalStatusId)}
              helperText={formik.touched.legalStatusId && formik.errors.legalStatusId}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='isInactive'
                  maxAccess={maxAccess}
                  checked={formik.values?.isInactive}
                  onChange={formik.handleChange}
                />
              }
              label={labels.inactive}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='isBlackListed'
                  maxAccess={maxAccess}
                  checked={formik.values?.isBlackListed}
                  onChange={formik.handleChange}
                />
              }
              label={labels.isBlackListed}
            />
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}
