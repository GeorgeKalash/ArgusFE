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
  const year = value.slice(0, 4)
  const month = value.slice(4, 6) - 1
  const day = value.slice(6, 8)
  const parsedDate = new Date(year, month, day)
  const timestamp = parsedDate.getTime()

  return timestamp
}

const GetLookup = ({ field, formik, apiDetails }) => {
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

const GetComboBox = ({ field, formik, apiDetails }) => {
  return (
    <Grid item xs={12} key={field.id}>
      <ResourceComboBox
        endpointId={apiDetails.endpoint}
        parameters={apiDetails?.parameters}
        name={field.key}
        label={field.caption}
        valueField={apiDetails.valueField}
        displayField={apiDetails.displayField}
        columnsInDropDown={apiDetails.columnsInDropDown}
        required={field.mandatory}
        value={formik.values?.parameters?.[field.id]?.value}
        onChange={(event, newValue) => {
          formik.setFieldValue(
            `parameters[${field.id}]`,
            newValue
              ? {
                  fieldId: field.id,
                  fieldKey: field.key,
                  value: newValue?.[apiDetails.valueField],
                  caption: field.caption,
                  display: newValue?.[apiDetails.displayField]
                }
              : ''
          )
        }}
      />
    </Grid>
  )
}

const GetDate = ({ field, formik }) => {
  return (
    <Grid item xs={12} key={field.id}>
      <CustomDatePicker
        name={field.key}
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
        onClear={() => formik.setFieldValue(`parameters[${field.id}]`, '')}
      />
    </Grid>
  )
}

const GetTextField = ({ field, formik }) => {
  return (
    <Grid item xs={12}>
      <CustomTextField
        name={field.key}
        label={field.caption}
        value={formik.values?.parameters?.[field.id]?.value}
        required={field.mandatory}
        onChange={e => {
          formik.setFieldValue(
            `parameters[${field.id}]`,
            e.target.value
              ? {
                  fieldId: field.id,
                  fieldKey: field.key,
                  value: e.target.value,
                  caption: field.caption,
                  display: e.target.value
                }
              : ''
          )
        }}
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
    }).then(res => {
      setParameters(res.list)
    })
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

  const { formik } = useForm({
    initialValues: {
      parameters: [],
      test: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
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

  const mergeFieldWithApiDetails = async () => {
    const fieldComponentArray = []

    await Promise.all(
      parameters.map(async field => {
        const detailedApiDetails = await fetchData(field)
        if (field.controlType) {
          fieldComponentArray.push({ ...field, apiDetails: detailedApiDetails })
        }
      })
    )
    setItems(fieldComponentArray.filter(field => field !== null))
  }

  useEffect(() => {
    parameters.length > 0 && mergeFieldWithApiDetails()
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
            return <GetLookup key={item.fieldId} formik={formik} field={item} apiDetails={item.apiDetails} />
          } else if (item.controlType === 5 && item.apiDetails.type === COMBOBOX) {
            return <GetComboBox key={item.fieldId} formik={formik} field={item} apiDetails={item.apiDetails} />
          } else if (item.controlType === 4) {
            return <GetDate key={item.fieldId} formik={formik} field={item} />
          } else if (item.controlType === 1) {
            return <GetTextField key={item.fieldId} formik={formik} field={item} />
          }
        })}
      </Grid>
    </FormShell>
  )
}

export default ReportParameterBrowser
