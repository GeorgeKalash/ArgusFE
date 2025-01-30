import { useContext, useEffect } from 'react'
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
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function BPMasterDataForm({ labels, maxAccess, setEditMode, store, setStore }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!recordId

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId || null,
      reference: '',
      name: '',
      category: null,
      categoryName: null,
      groupId: null,
      flName: '',
      defaultInc: '',
      defaultId: '',
      isInactive: false,
      keywords: '',
      plId: null,
      shipAddressId: null,
      billAddressId: null,
      birthDate: null,
      birthPlace: '',
      nationalityId: null,
      legalStatusId: null,
      isBlackListed: false
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      category: yup.string().required(),
      groupId: yup.string().required(),
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      obj.recordId = recordId
      const date = obj?.birthDate && formatDateToApi(obj?.birthDate)
      const data = { ...obj, birthDate: date }

      const res = await postRequest({
        extension: BusinessPartnerRepository.MasterData.set,
        record: JSON.stringify(data)
      })

      if (!recordId) {
        toast.success(platformLabels.Added)
        setEditMode(true)
        formik.setFieldValue('recordId', res.recordId)
        if (obj.defaultId) {
          const data = {
            bpId: res.recordId,
            idNum: obj.defaultId,
            incId: obj.defaultInc
          }
          await postRequest({
            extension: BusinessPartnerRepository.MasterIDNum.set,
            record: JSON.stringify(data)
          })
        }

        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))
      } else {
        toast.success(platformLabels.Edited)
      }
      setEditMode(true)
      invalidate()
    }
  })

  const filterIdCategory = async categId => {
    const res = await getRequest({
      extension: BusinessPartnerRepository.CategoryID.qry,
      parameters: `_startAt=0&_pageSize=1000`
    })

    return categId
      ? res.list.filter(
          item =>
            (parseInt(categId) === 1 && item.person) ||
            (parseInt(categId) === 2 && item.org) ||
            (parseInt(categId) === 3 && item.group)
        )
      : []
  }

  const getDefaultId = async incId => {
    if (incId && recordId) {
      const res = await getRequest({
        extension: BusinessPartnerRepository.MasterIDNum.get,
        parameters: `_bpId=${recordId}&_incId=${incId}`
      })
      if (res.record) {
        formik.setFieldValue('defaultId', res.record.idNum)
      }
    }
  }

  const invalidate = useInvalidate({
    endpointId: BusinessPartnerRepository.MasterData.qry
  })

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    }
  ]
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: BusinessPartnerRepository.MasterData.get,
          parameters: `_recordId=${recordId}`
        })

        res.record.birthDate = formatDateFromApi(res.record.birthDate)
        formik.setValues(res.record)
        await getDefaultId(res.record.defaultInc)
      }
    })()
  }, [recordId])

  useEffect(() => {
    ;(async function () {
      if (formik?.values?.category) {
        const _category = await filterIdCategory(formik?.values?.category)

        setStore(prevStore => ({
          ...prevStore,
          category: _category
        }))
      }
    })()
  }, [formik?.values?.category])

  return (
    <FormShell
      resourceId={ResourceIds.BPMasterData}
      actions={actions}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Grid container spacing={3}>
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
                      formik.setFieldValue('defaultInc', '')
                      formik.setFieldValue('defaultId', '')
                    }}
                    error={formik.touched.category && Boolean(formik.errors.category)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={BusinessPartnerRepository.Group.qry}
                    name='groupId'
                    label={labels.groupName}
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='birthDate'
                    label={labels.birthDate}
                    value={formik.values.birthDate}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('birthDate', '')}
                    error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='flName'
                    label={labels.flName}
                    value={formik.values.flName}
                    maxLength='70'
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('flName', '')}
                    error={formik.touched.flName && Boolean(formik.errors.flName)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={3}>
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomComboBox
                    name='defaultInc'
                    label={labels.idCategory}
                    valueField='recordId'
                    displayField='name'
                    readOnly={!formik.values.category || !store?.category?.length > 0}
                    store={store.category}
                    value={store?.category?.filter(item => item.recordId === parseInt(formik.values.defaultInc))[0]}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('defaultId', '')
                      formik.setFieldValue('defaultInc', newValue ? newValue.recordId : null)
                      getDefaultId(newValue?.recordId)
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='defaultId'
                    label={labels.defaultId}
                    value={formik.values.defaultId}
                    maxAccess={maxAccess}
                    readOnly={!formik.values?.defaultInc}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('defaultId', '')}
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomCheckBox
                    name='isInactive'
                    value={formik.values.isInactive}
                    onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                    label={labels.inactive}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomCheckBox
                    name='isBlackListed'
                    value={formik.values?.isBlackListed}
                    onChange={event => formik.setFieldValue('isBlackListed', event.target.checked)}
                    label={labels.isBlackListed}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
