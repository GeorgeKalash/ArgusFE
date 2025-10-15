import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { useContext, useEffect, useState } from 'react'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomDateTimePicker from 'src/components/Inputs/CustomDateTimePicker'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import Form from 'src/components/Shared/Form'

const UserDefinedTab = ({  maxAccess, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const [fields, setFields] = useState([])

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.UserDefined.qry
  })

  const { formik } = useForm({
    initialValues: {},
    maxAccess,
    onSubmit: async values => {
      const payloadList = {
        items: Object.entries(values).map(([propertyId, value]) => ({
          propertyId: Number(propertyId),
          employeeId: recordId,
          value: value ?? ''
        }))
      }

      await postRequest({
        extension: EmployeeRepository.UserDefined.set2,
        record: JSON.stringify(payloadList)
      })

      toast.success(platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function fetchUserDefined() {
      if (!recordId) return

      const userValues = await getRequest({
        extension: EmployeeRepository.UserDefined.qry,
        parameters: `_employeeId=${recordId}`
      })

      const fieldDefs = await getRequest({
        extension: EmployeeRepository.CustomProperties.qry,
        parameters: `_employeeId=${recordId}`
      })

      const merged = fieldDefs?.list?.map(def => {
        const matchingValue = userValues?.list?.find(v => v.propertyId === def.recordId)

        return {
          ...def,
          value: matchingValue?.value ?? '',
          employeeId: recordId
        }
      })

      setFields(merged)

      const initialValues = merged?.reduce((acc, field) => {
        acc[field.recordId] = field.value

        return acc
      }, {})

      formik.setValues(initialValues)
    })()
  }, [recordId])

  const editMode = true

  const renderField = field => {
    const fieldId = field.recordId
    const value = formik.values[fieldId] ?? ''

    switch (field.mask) {
      case 1:
        return (
          <CustomTextField
            key={fieldId}
            name={String(fieldId)}
            label={field.name}
            value={value || ''}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue(String(fieldId), '')}
          />
        )

      case 2:
        return (
          <CustomNumberField
            key={fieldId}
            name={String(fieldId)}
            label={field.name}
            value={value || ''}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue(String(fieldId), '')}
          />
        )

      case 3:
        return (
          <CustomDateTimePicker
            key={fieldId}
            name={String(fieldId)}
            label={field.name}
            value={value ? new Date(value) : null}
            onChange={(name, newValue) => formik.setFieldValue(String(fieldId), newValue?.toISOString() || '')}
            onClear={() => formik.setFieldValue(String(fieldId), '')}
          />
        )

      case 4:
        return (
          <CustomDatePicker
            key={fieldId}
            name={String(fieldId)}
            label={field.name}
            value={value ? new Date(value) : null}
            onChange={(name, newValue) => formik.setFieldValue(String(fieldId), newValue?.toISOString() || '')}
            onClear={() => formik.setFieldValue(String(fieldId), '')}
          />
        )

      case 5:
        return (
          <CustomCheckBox
            key={fieldId}
            name={String(fieldId)}
            label={field.name}
            value={Boolean(value)}
            onChange={event => formik.setFieldValue(String(fieldId), event.target.checked)}
            maxAccess={maxAccess}
          />
        )

      default:
        return null
    }
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            {fields?.map(field => (
              <Grid item xs={12} key={field.recordId}>
                {renderField(field)}
              </Grid>
            ))}
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default UserDefinedTab
