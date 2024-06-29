import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useForm } from 'src/hooks/form'
import FormShell from './FormShell'
import { apiMappings, COMBOBOX, LOOKUP } from './apiMappings'
import ResourceComboBox from './ResourceComboBox'
import { ResourceLookup } from './ResourceLookup'
import { formatDateDefault } from 'src/lib/date-helper'
import CustomTextField from '../Inputs/CustomTextField'

const formatDateTo = value => {
  const date = new Date(value)
  const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, '')

  return formattedDate
}

const formatDateFrom = value => {
  let timestamp

  if (value.indexOf('-') > -1) {
    console.log('value', value)
    timestamp = new Date(value.toString()).getTime()
  } else {
    const year = value.slice(0, 4)
    const month = value.slice(4, 6)
    const day = value.slice(6, 8)
    const parsedDate = new Date(year, month - 1, day)
    timestamp = parsedDate.getTime()
  }

  console.log('formattedDate', timestamp)

  return timestamp
}

const GetLookup = ({ field, formik }) => {
  const apiDetails = field.apiDetails

  return (
    <Grid item xs={12} key={field.id}>
      <ResourceLookup
        endpointId={apiDetails.endpoint}
        parameters={apiDetails.parameters}
        firstFieldWidth={apiDetails.firstFieldWidth}
        valueField={apiDetails.displayField}
        displayField={apiDetails.valueField}
        name={field.key}
        displayFieldWidth={apiDetails.displayFieldWidth}
        required={field.mandatory}
        label={field.caption}
        form={formik}
        firstValue={formik.values.parameters?.[field.id]?.display}
        secondValue={formik.values.parameters?.[field.id]?.display2}
        onChange={(event, newValue) => {
          formik.setFieldValue(
            `parameters[${field.id}]`,
            newValue?.[apiDetails.valueOnSelection]
              ? {
                  fieldId: field.id,
                  fieldKey: field.key,
                  value: newValue?.[apiDetails.valueOnSelection] || '',
                  caption: field.caption,
                  display: newValue?.[apiDetails.displayField],
                  display2: newValue?.[apiDetails.valueField]
                }
              : ''
          )
        }}
      />
    </Grid>
  )
}

const GetComboBox = ({ field, formik }) => {
  const apiDetails = field?.apiDetails
  console.log(formik.values?.parameters?.[field?.id]?.value?.toString())
  return (
    <Grid item xs={12} key={field.id}>
      {field.classId ? (
        <ResourceComboBox
          endpointId={apiDetails.endpoint}
          parameters={apiDetails?.parameters}
          name={`parameters[${field.id}`}
          label={field.caption}
          valueField={apiDetails.valueField}
          displayField={apiDetails.displayField}
          columnsInDropDown={apiDetails?.columnsInDropDown}
          required={field.mandatory}
          value={formik.values?.parameters?.[field?.id]?.value}
          onChange={(event, newValue) => {
            const textValue = Array.isArray(apiDetails?.displayField)
              ? apiDetails?.displayField?.map(header => newValue[header]?.toString())?.join(' - ')
              : newValue?.[apiDetails?.displayField]
            field.mandatory && formik.setFieldTouched(`parameters[${field.id}]`, true) // Ensure touched is set

            formik.setFieldValue(
              `parameters[${field.id}]`,
              newValue
                ? {
                    fieldId: field.id,
                    fieldKey: field.key,
                    value: newValue?.[apiDetails?.valueField],
                    caption: field.caption,
                    display: textValue
                  }
                : ''
            )
          }}
          error={Boolean(formik.errors?.parameters?.[field?.id])}
        />
      ) : (
        <>
          <ResourceComboBox
            datasetId={field?.data}
            name={`parameters[${field.id}`}
            label={field.caption}
            valueField={'key'}
            displayField={'value'}
            columnsInDropDown={apiDetails?.columnsInDropDown}
            required={field.mandatory}
            value={formik.values?.parameters?.[field.id]?.value}
            onChange={(event, newValue) => {
              formik.setFieldValue(
                `parameters[${field.id}]`,
                newValue
                  ? {
                      fieldId: field.id,
                      fieldKey: field.key,
                      value: newValue?.key,
                      caption: field.caption,
                      display: newValue?.value
                    }
                  : ''
              )
            }}
            error={Boolean(formik.errors?.parameters?.[field?.id])}
          />
        </>
      )}
    </Grid>
  )
}

const GetDate = ({ field, formik }) => {
  return (
    <Grid item xs={12} key={field.id}>
      <CustomDatePicker
        name={`parameters[${field.id}`}
        label={field.caption}
        value={formik.values?.parameters?.[field.id]?.value}
        required={field.mandatory}
        onChange={(name, newValue) => {
          formik.setFieldValue(`parameters[${field.id}]`, {
            fieldId: field.id,
            fieldKey: field.key,
            value: newValue,
            caption: field.caption,
            display: formatDateDefault(newValue)
          })
        }}
        error={Boolean(formik.errors?.parameters?.[field?.id])}
        onClear={() => formik.setFieldValue(`parameters[${field.id}]`, {})}
      />
    </Grid>
  )
}

const GetTextField = ({ field, formik }) => {
  return (
    <Grid item xs={12} key={field.id}>
      <CustomTextField
        name={`parameters[${field.id}`}
        label={field.caption}
        value={formik.values?.parameters?.[field.id]?.value || null}
        required={field.mandatory}
        onChange={e => {
          formik.setFieldValue(`parameters[${field.id}]`, {
            fieldId: field.id,
            fieldKey: field.key,
            value: e.target.value,
            caption: field.caption,
            display: e.target.value
          })
        }}
        error={Boolean(formik.errors?.parameters?.[field.id])}
        onClear={() => formik.setFieldValue(`parameters[${field.id}]`, '')}
      />
    </Grid>
  )
}

const ReportParameterBrowser = ({ reportName, setParamsArray, paramsArray, disabled, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const [parameters, setParameters] = useState([])
  const [items, setItems] = useState([])

  const getParameterDefinition = reportName => {
    const parameters = `_reportName=${reportName}`

    getRequest({
      extension: SystemRepository.ParameterDefinition,
      parameters: parameters
    })
      .then(res => {
        setParameters(res.list)
      })
      .catch(e => {})
  }

  const fetchData = async field => {
    const mapping = apiMappings[field.classId]
    if (!mapping) {
      console.warn(`No API mapping found for classId ${field.classId}`)

      return null
    }

    return {
      ...mapping
    }
  }

  const ssss = items.reduce((schema, item) => {
    if (item?.mandatory) {
      schema[item.id] = yup.string().required('Field is required')
    }

    return schema
  }, {})

  // Create dynamic Yup schema based on items
  const validationSchema = yup.object().shape({
    parameters: yup.array().of(
      yup.object().shape(
        items.reduce((schema, item) => {
          if (item?.mandatory) schema[item.id] = yup.string().required('Field is required')

          return schema
        }, {})
      )
    )
  })

  const { formik } = useForm({
    initialValues: {
      parameters: []
    },
    validate: values => {
      const errors = { parameters: [] }
      items.forEach(item => {
        if (item?.mandatory && item?.id) {
          if (!values?.parameters?.[item?.id]) {
            errors.parameters[item?.id] = 'This field is required'
          }
        }
      })

      return errors.parameters.length > 0 ? errors : {}
    },
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,

    // validationSchema: yup.object().shape({}),
    onSubmit: values => {
      const processedArray = values?.parameters
        ?.filter((item, index) => item?.fieldId)
        ?.reduce((acc, item) => {
          if (item?.fieldId) {
            acc[item.fieldId] = {
              ...item,
              value: item.fieldKey === 'date' ? formatDateTo(item.value) : item.value
            }
          }

          return acc
        }, [])

      setParamsArray(processedArray)
      window.close()
    }
  })

  console.log('formik', formik)

  const mergeFieldWithApiDetails = async () => {
    const fieldComponentArray = []

    await Promise.all(
      parameters.map(async field => {
        const detailedApiDetails = (await fetchData(field)) || ''
        if (field.controlType) {
          fieldComponentArray.push({ ...field, apiDetails: detailedApiDetails })
        }
      })
    )
    setItems(fieldComponentArray.filter(field => field !== null))
  }

  const initialDefault = async () => {
    const fieldComponentArray = []

    parameters.map(async field => {
      if (field?.controlType && field.value) {
        fieldComponentArray[field.id] = {
          fieldId: field.id,
          fieldKey: field.key,
          value: field?.key === 'date' ? new Date(field.value.toString()).getTime() : field?.value,
          caption: field.caption,
          display: field?.key === 'date' ? new Date(field.value.toString()).getTime() : field?.value
        }
      }
    })

    formik.setFieldValue('parameters', fieldComponentArray)
  }
  useEffect(() => {
    if (parameters.length > 0) {
      initialDefault()
      mergeFieldWithApiDetails()
    }
  }, [parameters])

  useEffect(() => {
    const mappedData = paramsArray.reduce((acc, item) => {
      acc[item?.fieldId] = {
        ...item,
        value: item.fieldKey === 'date' ? formatDateFrom(item.value) : item.value
      }

      return acc
    }, [])

    formik.setFieldValue('parameters', mappedData)
  }, [])

  useEffect(() => {
    getParameterDefinition(reportName)
  }, [reportName])

  return (
    <FormShell form={formik} infoVisible={false}>
      <Grid container spacing={2} sx={{ px: 4, pt: 2 }}>
        {items?.map(item => {
          if (item.controlType === 5 && item.apiDetails?.type === LOOKUP) {
            return <GetLookup key={item.fieldId} formik={formik} field={item} />
          } else if (item.controlType === 5 && item.apiDetails?.type === COMBOBOX) {
            return <GetComboBox key={item.fieldId} formik={formik} field={item} />
          } else if (item.controlType === 4) {
            return <GetDate key={item.fieldId} formik={formik} field={item} />
          } else if (item.controlType === 1) {
            return <GetTextField key={item.fieldId} formik={formik} field={item} apiDetails={item.apiDetails} />
          }
        })}
      </Grid>
    </FormShell>
  )
}

export default ReportParameterBrowser
