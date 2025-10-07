import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

const UserDefinedTab = ({ labels, maxAccess, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.Account.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      hair: '',
      weight: null,
      value: false,
      test1: null
    },
    maxAccess: maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({}),
    onSubmit: async values => {
      await postAccount(values)
    }
  })

  const postAccount = async obj => {
    const res = await postRequest({
      extension: FinancialRepository.Account.set,
      record: JSON.stringify(obj)
    })
    if (!obj.recordId) {
      setStore(prevStore => ({
        ...prevStore,
        recordId: res.recordId
      }))
      formik.setFieldValue('recordId', res.recordId)
    }
    invalidate()
    toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FinancialRepository.Account.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  const editMode = !!formik.values.recordId


  return (
    <FormShell
      resourceId={ResourceIds.EmployeeFilter}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='hair'
                label={labels.hair}
                value={formik.values.hair}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('hair', '')}
                error={formik.touched.hair && Boolean(formik.errors.hair)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='weight'
                label={labels.weight}
                value={formik.values.weight}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('weight', '')}
                error={formik.touched.weight && Boolean(formik.errors.weight)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='ableToTravel'
                value={formik.values?.ableToTravel}
                onChange={event => formik.setFieldValue('ableToTravel', event.target.checked)}
                label={labels.ableToTravel}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='test1'
                label={labels.test1}
                value={formik.values.test1}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('test1', '')}
                error={formik.touched.test1 && Boolean(formik.errors.test1)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default UserDefinedTab
