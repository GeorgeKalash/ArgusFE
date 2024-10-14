import { Grid } from '@mui/material'
import React, { useContext, useEffect, useRef } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import useResourceParams from 'src/hooks/useResourceParams'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { useForm } from 'src/hooks/form'
import ImageUpload from 'src/components/Inputs/ImageUpload'
import { getStorageData } from 'src/storage/storage'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const CompanyInfo = () => {
  const imageUploadRef = useRef()

  const { getRequest, postRequest } = useContext(RequestsContext)

  const { labels: labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.CompanyInfo
  })

  useEffect(() => {
    getData()
  }, [])

  async function getData() {
    try {
      const res = await getRequest({
        extension: SystemRepository.CompanyInfo.get,
        parameters: `_filter=`
      })

      formik.setValues({
        ...formik.values,
        name: res.record.name,
        webSite: res.record.taxNo,
        taxNo: res.record.taxNo,
        licenseNo: res.record.licenseNo,
        plantId: res.record.plantId,
        crNo: res.record.crNo,
        logoUrl: res.record.logoUrl,
        flName: res.record.flName
      })
    } catch (e) {}
  }

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      plantId: '',
      accountId: getStorageData('userData')?.accountId,
      name: '',
      webSite: '',
      taxNo: '',
      licenseNo: '',
      crNo: '',
      logoUrl: '',
      flName: ''
    },
    onSubmit: async values => {
      await post(values)
    }
  })

  const post = async obj => {
    try {
      await postRequest({
        extension: SystemRepository.CompanyInfo.set,
        record: JSON.stringify({ ...obj, attachment: null })
      })
      if (imageUploadRef.current) {
        await imageUploadRef.current.submit()
      }
      toast.success('Record Edited Successfully')
    } catch (e) {}
  }

  return (
    <FormShell
      resourceId={ResourceIds.CompanyInfo}
      form={formik}
      infoVisible={false}
      isCleared={false}
      isSavedClear={false}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='accountId'
              label={labels.accountId}
              value={formik.values?.accountId}
              onChange={formik.handleChange}
              readOnly={true}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={formik.values?.name}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('posMsg', '')}
              error={formik.errors && Boolean(formik.errors.posMsg)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='flName'
              label={labels.foreignLanguage}
              value={formik.values?.flName}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('flName', '')}
              error={formik.errors && Boolean(formik.errors.flName)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='taxNo'
              label={labels.taxNo}
              value={formik.values?.taxNo}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('taxNo', '')}
              error={formik.errors && Boolean(formik.errors.taxNo)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Plant.qry}
              name='plantId'
              label={labels.plant}
              valueField='recordId'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('plantId', newValue?.recordId || '')
              }}
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='licenseNo'
              label={labels.licenseNo}
              value={formik.values?.licenseNo}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('licenseNo', '')}
              error={formik.errors && Boolean(formik.errors.licenseNo)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='crNo'
              label={labels.commercialRegister}
              value={formik.values?.crNo}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('crNo', '')}
              error={formik.errors && Boolean(formik.errors.crNo)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='webSite'
              label={labels.website}
              value={formik.values?.webSite}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('webSite', '')}
              error={formik.errors && Boolean(formik.errors.webSite)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ImageUpload ref={imageUploadRef} resourceId={ResourceIds.CompanyInfo} seqNo={0} recordId={1} />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}

export default CompanyInfo
