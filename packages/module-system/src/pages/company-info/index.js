import { Grid } from '@mui/material'
import React, { useContext, useEffect, useRef } from 'react'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ImageUpload from '@argus/shared-ui/src/components/Inputs/ImageUpload'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Form from '@argus/shared-ui/src/components/Shared/Form'

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
  }

  const { formik } = useForm({
    maxAccess,
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
    await postRequest({
      extension: SystemRepository.CompanyInfo.set,
      record: JSON.stringify({ ...obj, attachment: null })
    })
    if (imageUploadRef.current) {
      await imageUploadRef.current.submit()
    }
    toast.success('Record Edited Successfully')
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grid container spacing={2}>
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
    </Form>
  )
}

export default CompanyInfo
