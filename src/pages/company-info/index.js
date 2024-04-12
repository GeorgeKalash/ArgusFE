import { Box, Grid } from '@mui/material'
import { useFormik } from 'formik'
import React, { useContext, useEffect, useState } from 'react'
import CustomImage from 'src/components/Inputs/CustomImage'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import useResourceParams from 'src/hooks/useResourceParams'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'

const CompanyInfo = () => {
  const [initialValues, setInitialData] = useState({
    plantId: '',
    accountId: JSON.parse(window.sessionStorage.getItem('userData')).accountId,
    name: '',
    webSite: '',
    taxNo: '',
    licenseNo: '',
    crNo: '',
    logoUrl: '',
    flName: ''
  })
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { labels: labels, access } = useResourceParams({
    datasetId: ResourceIds.CompanyInfo
  })

  const [file, setFile] = useState()

  useEffect(() => {
    getData()
  }, [])
  async function getData() {
    const res = await getRequest({
      extension: SystemRepository.CompanyInfo.get,
      parameters: `_filter=`
    })

    setInitialData(res.record)

    const resu = await getRequest({
      extension: SystemRepository.Attachment.get,
      parameters: `_resourceId=20120&_seqNo=0&_recordId=1`
    })
  }

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit: values => {
      post(values)
    }
  })

  const post = obj => {
    postRequest({
      extension: SystemRepository.CompanyInfo.set,

      record: JSON.stringify({ ...obj, logoUrl: null })
    })
      .then(res => {
        if (res && !file) toast.success('Record Edited Successfully')
      })
      .catch(error => {})

    const dateObject = new Date(file.lastModifiedDate)

    const year = dateObject.getFullYear()
    const month = dateObject.getMonth() + 1
    const day = dateObject.getDate()

    if (file) {
      const data = {
        resourceId: ResourceIds.CompanyInfo,
        recordId: 1,
        seqNo: 0,
        fileName: file.name,
        folderId: null,
        folderName: null,
        date: day + '/' + month + '/' + year,
        url: null
      }
      postRequest({
        extension: SystemRepository.Attachment.set,
        record: JSON.stringify(data),
        file: obj.logoUrl
      }).then(res => {
        if (res) toast.success('Record Edited Successfully')
      })
    } else {
      if (obj.logoUrl) {
      }
    }
  }

  return (
    <Box sx={{ height: `calc(100vh - 48px)`, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
      <FormShell resourceId={ResourceIds.CompanyInfo} form={formik}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='accountId'
              label={labels.accountId}
              value={formik.values.accountId}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('posMsg', '')}
              error={formik.errors && Boolean(formik.errors.posMsg)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={formik.values.name}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('posMsg', '')}
              error={formik.errors && Boolean(formik.errors.posMsg)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='flName'
              label={labels.foreignLanguage}
              value={formik.values.flName}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('flName', '')}
              error={formik.errors && Boolean(formik.errors.flName)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='taxNo'
              label={labels.taxNo}
              value={formik.values.taxNo}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('taxNo', '')}
              error={formik.errors && Boolean(formik.errors.taxNo)}
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
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='licenseNo'
              label={labels.licenseNo}
              value={formik.values.licenseNo}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('licenseNo', '')}
              error={formik.errors && Boolean(formik.errors.licenseNo)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='crNo'
              label={labels.commercialRegister}
              value={formik.values.crNo}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('crNo', '')}
              error={formik.errors && Boolean(formik.errors.crNo)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='webSite'
              label={labels.website}
              value={formik.values.webSite}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('webSite', '')}
              error={formik.errors && Boolean(formik.errors.webSite)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomImage
              name='logoUrl'
              value={formik.values.logoUrl}
              onChange={formik.setFieldValue}
              setFile={setFile}
            />
          </Grid>
        </Grid>
      </FormShell>
    </Box>
  )
}

export default CompanyInfo
