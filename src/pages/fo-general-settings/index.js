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
import { getStorageData } from 'src/storage/storage'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { SCRepository } from 'src/repositories/SCRepository'

const FoGeneralSettings = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.GeneralSettings
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
    maxAccess: access,
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
    await postRequest({
      extension: SystemRepository.CompanyInfo.set,
      record: JSON.stringify({ ...obj, attachment: null })
    })

    toast.success('Record Edited Successfully')
  }

  return (
    <FormShell
      resourceId={ResourceIds.GeneralSettings}
      form={formik}
      infoVisible={false}
      isCleared={false}
      isSavedClear={false}
      maxAccess={access}
    >
      <VertLayout>
        <Grid container spacing={2} xs={6}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SCRepository.Sites.qry}
              name='siteId'
              label={labels.site}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('siteId', newValue?.recordId || null)
              }}
              required
              error={formik.touched.siteId && Boolean(formik.errors.siteId)}
            />
          </Grid>
          {/* <Grid item xs={12}>
            <ResourceComboBox
              endpointId={FinancialRepository.Account.snapshot}
              label={labels.module}
              name='moduleId'
              values={formik.values}
              valueField='key'
              displayField='value'
              maxAccess={access}
              required
              readOnly={formik.values.moduleId}
              onChange={(event, newValue) => {
                formik.setFieldValue('moduleId', newValue?.key || null)
              }}
            />
          </Grid> */}
          <Grid item xs={12}>
            <CustomTextField
              name='webSite'
              label={labels.website}
              value={formik.values?.webSite}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('webSite', '')}
              error={formik.errors && Boolean(formik.errors.webSite)}
              maxAccess={access}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}

export default FoGeneralSettings
