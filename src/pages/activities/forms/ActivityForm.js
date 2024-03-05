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

import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function ActivityForm({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    name: '',
    reference: '',
    flName:'',
    industry:''

  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  //const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId:CurrencyTradingSettingsRepository.Activity.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      reference: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: CurrencyTradingSettingsRepository.Activity.set,
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
            extension: CurrencyTradingSettingsRepository.Activity.get,
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
      resourceId={ResourceIds.SmsTemplates}
      form={formik}
      height={300}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4}>
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
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            rows={2}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
            helperText={formik.touched.reference && formik.errors.reference}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='flName'
            label={labels.flName}
            value={formik.values.flName}
            required
            rows={2}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.flName && Boolean(formik.errors.flName)}
            helperText={formik.touched.flName && formik.errors.flName}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
           datasetId={DataSets.DR_CHA_DATA_TYPE}
           name='dataType'
           label={labels.indId}
           valueField='key'
           displayField='value'
           values={characteristicValidation.values}
           required
           maxAccess={maxAccess}
           onChange={(event, newValue) => {
             characteristicValidation.setFieldValue('dataType', newValue?.key)
           }}
            error={activityValidation.touched.industry && Boolean(activityValidation.errors.industry)}
            helperText={activityValidation.touched.industry && activityValidation.errors.industry}
      
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}

        // <Grid item xs={12}>
        //   <CustomComboBox
        //     name='industry'
        //     label={_labels.industryId}
        //     valueField='key'
        //     displayField='value'
        //     required
        //     store={industryStore}
        //     value={industryStore.filter(item => item.key === activityValidation.values.industry?.toString())[0]}
        //     onChange={(event, newValue) => {
        //       activityValidation.setFieldValue('industry', newValue?.key)
        //     }}
        //     error={activityValidation.touched.industry && Boolean(activityValidation.errors.industry)}
        //     helperText={activityValidation.touched.industry && activityValidation.errors.industry}
        //     maxAccess={maxAccess}
        //   />
        // </Grid>
//       </Grid>
//     </>
//   )
// }

// export default ActivityTab
