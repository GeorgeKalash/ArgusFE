// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataSets } from 'src/resources/DataSets'

export default function LoCarriersForms({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    reference: '',
    name: '',
    type:null,
    siteId:null,
    bpId:null,
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  //const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: LogisticsRepository.LoCarrier.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(' '),
      name: yup.string().required(' '),
      type: yup.string().required(' '),
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: LogisticsRepository.LoCarrier.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          recordId: response.recordId // Update only the recordId field
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: LogisticsRepository.LoCarrier.get,
            parameters: `_recordId=${recordId}`
          })

          setInitialData(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.LoCarriers}
      form={formik}
      height={300}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            maxAccess={maxAccess}
            maxLength='10'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}

            // helperText={formik.touched.reference && formik.errors.reference}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            required
            maxAccess={maxAccess}
            maxLength='30'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}

            // helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
              datasetId={DataSets.LO_TYPE}
              name='type'
              label={labels.type}
              valueField='key'
              required
              displayField='value'
              values={formik.values} 
              onChange={(event, newValue) => {
                  if (newValue) {
                      formik.setFieldValue('type', newValue?.key)
                  } else {
                      formik.setFieldValue('type', '')
                  }
              }}
              error={formik.touched.type && Boolean(formik.errors.type)}

              // helperText={formik.touched.type && formik.errors.type}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={InventoryRepository.Site.qry}
            name='siteId'
            label={labels.site}
            values={formik.values}
            displayField='name'
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('siteId', newValue?.recordId)
            }}
            error={formik.touched.siteId && Boolean(formik.errors.siteId)}

            // helperText={formik.touched.siteId && formik.errors.siteId}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='bpId'
            label={labels.businessPartner}
            value={formik.values.bpId}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('bpId', '')}
            error={formik.touched.bpId && Boolean(formik.errors.bpId)}

            // helperText={formik.touched.bpId && formik.errors.bpId}
          />
        </Grid>
        
      </Grid>
    </FormShell>
  )
}
