import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { useForm } from 'src/hooks/form'
import FormShell from './FormShell'
import { apiMappings, COMBOBOX, LOOKUP } from './apiMappings'
import ResourceComboBox from './ResourceComboBox'
import { ResourceLookup } from './ResourceLookup'
import { formatDateDefault } from 'src/lib/date-helper'
import CustomTextField from '../Inputs/CustomTextField'
import { useError } from 'src/error'

const formatDateTo = value => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

const formatDateFrom = value => {
  let timestamp

  if (value.indexOf('-') > -1 || value.indexOf('/') > -1) {
    timestamp = new Date(value.toString()).getTime()
  } else {
    const year = value.slice(0, 4)
    const month = value.slice(4, 6)
    const day = value.slice(6, 8)
    const parsedDate = new Date(year, month - 1, day)
    timestamp = parsedDate.getTime()
  }

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
        valueField={apiDetails.firstField}
        displayField={apiDetails.secondField}
        secondDisplayField={apiDetails.secondDisplayField}
        columnsInDropDown={apiDetails.columnsInDropDown}
        name={field.key}
        displayFieldWidth={apiDetails.displayFieldWidth}
        required={field.mandatory}
        label={field.caption}
        form={formik}
        firstValue={formik.values.parameters?.[field.id]?.display}
        secondValue={formik.values.parameters?.[field.id]?.display2}
        onChange={(event, newValue) => {
          const display = Array.isArray(apiDetails?.firstField)
            ? apiDetails?.firstField
                ?.map(header => newValue?.[header] && newValue?.[header]?.toString())
                ?.filter(item => item)
                ?.join(' ')
            : newValue?.[apiDetails.firstField]

          formik.setFieldValue(
            `parameters[${field.id}]`,
            newValue?.[apiDetails.valueOnSelection]
              ? {
                  fieldId: field.id,
                  fieldKey: field.key,
                  value: newValue?.[apiDetails.valueOnSelection] || '',
                  caption: field.caption,
                  display: display ? display : newValue?.[apiDetails.firstField],
                  display2: newValue?.[apiDetails.secondField]
                }
              : ''
          )
        }}
        error={Boolean(formik.errors?.parameters?.[field?.id])}
      />
    </Grid>
  )
}

const GetComboBox = ({ field, formik, rpbParams }) => {
  const apiDetails = field?.apiDetails
  let newParams = apiDetails?.parameters

  useEffect(() => {
    if (!formik.values?.parameters?.[field.id]?.value && field.value && rpbParams?.length < 1) {
      formik.setFieldValue(`parameters[${field.id}]`, {
        fieldId: field.id,
        fieldKey: field.key,
        value: Number(field.value),
        caption: field.caption,
        display: field.value
      })
    }
  }, [])

  if (apiDetails?.endpoint === SystemRepository.DocumentType.qry) {
    newParams += `&_dgId=${field?.data}`
  } else if (apiDetails?.endpoint === InventoryRepository.Dimension.qry) {
    newParams = `_dimension=${field?.data}`
  } else if (apiDetails?.endpoint === FinancialRepository.FIDimension.qry) {
    newParams = `_dimension=${field?.data}`
  }

  return (
    <Grid item xs={12} key={field.id}>
      {field?.classId ? (
        <ResourceComboBox
          endpointId={apiDetails.endpoint}
          parameters={newParams}
          name={`parameters[${field.id}]`}
          label={field.caption}
          valueField={apiDetails.valueField}
          displayField={apiDetails.displayField}
          columnsInDropDown={apiDetails?.columnsInDropDown}
          required={field.mandatory}
          values={formik.values?.parameters?.[field.id]?.value}
          onChange={(event, newValue) => {
            const textValue = Array.isArray(apiDetails?.displayField)
              ? apiDetails?.displayField?.map(header => newValue?.[header]?.toString())?.join(' ')
              : newValue?.[apiDetails?.displayField]

            formik.setFieldValue(
              `parameters[${field.id}]`,
              newValue?.[apiDetails?.valueField]
                ? {
                    fieldId: field.id,
                    fieldKey: field.key,
                    value: Number(newValue?.[apiDetails?.valueField]),
                    caption: field.caption,
                    display: textValue
                  }
                : ''
            )
          }}
          error={formik.touched?.parameters?.[field?.id] && Boolean(formik.errors?.parameters?.[field?.id])}
        />
      ) : (
        <>
          <ResourceComboBox
            datasetId={field?.data}
            name={`parameters[${field.id}]`}
            label={field.caption}
            valueField={'key'}
            displayField={'value'}
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
            error={formik.touched?.parameters?.[field?.id] && Boolean(formik.errors?.parameters?.[field?.id])}
          />
        </>
      )}
    </Grid>
  )
}

const GetDate = ({ field, formik, rpbParams }) => {
  useEffect(() => {
    if (!formik.values?.parameters?.[field.id]?.value && field.value && rpbParams?.length < 1) {
      formik.setFieldValue(`parameters[${field.id}]`, {
        fieldId: field.id,
        fieldKey: field.key,
        value: new Date(field.value.toString())?.getTime() || '',
        caption: field.caption,
        display: formatDateDefault(new Date(field?.value?.toString()))
      })
    }
  }, [])

  return (
    <Grid item xs={12} key={field.id}>
      <CustomDatePicker
        name={`parameters[${field.id}]`}
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
        error={formik.errors?.parameters?.[field?.id] && Boolean(formik.errors?.parameters?.[field?.id])}
        onClear={() => formik.setFieldValue(`parameters[${field.id}]`, undefined)}
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
          e.target.value != ''
            ? formik.setFieldValue(`parameters[${field.id}]`, {
                fieldId: field.id,
                fieldKey: field.key,
                value: e.target.value,
                caption: field.caption,
                display: e.target.value
              })
            : formik.setFieldValue(`parameters[${field.id}]`, '')
        }}
        error={Boolean(formik.errors?.parameters?.[field.id])}
        onClear={() => formik.setFieldValue(`parameters[${field.id}]`, '')}
      />
    </Grid>
  )
}

const ReportParameterBrowser = ({ reportName, setRpbParams, rpbParams, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const [items, setItems] = useState([])
  const [parameters, setParameters] = useState([])
  const { stack: stackError } = useError()

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
    onSubmit: values => {
      setRpbParams([])

      const processedArray = values?.parameters
        ?.filter((item, index) => item?.fieldId && item?.value != null)
        ?.reduce((acc, item) => {
          if (item?.fieldId) {
            acc[item.fieldId] = {
              ...item,
              value:
                item.fieldKey === 'date' || item.fieldKey?.indexOf('Date') > -1 ? formatDateTo(item.value) : item.value
            }
          }

          return acc
        }, [])

      setRpbParams(processedArray)
      window.close()
    }
  })

  const mergeFieldWithApiDetails = async () => {
    const fieldComponentArray = []
    let list = ''
    await Promise.all(
      parameters.map(async field => {
        const detailedApiDetails = (await fetchData(field)) || ''
        if (!detailedApiDetails) {
          list += list ? ', ' + field.caption : field.caption
        }
        if (field.controlType) {
          fieldComponentArray.push({ ...field, apiDetails: detailedApiDetails })
        }
      })
    )
    if (list) {
      stackError({ message: `${list} - has not in apiMappings` })
    }
    setItems(fieldComponentArray.filter(field => field !== null))
  }

  useEffect(() => {
    if (parameters.length > 0) {
      mergeFieldWithApiDetails()
    }
  }, [parameters])

  useEffect(() => {
    const mappedData = rpbParams.reduce((acc, item) => {
      acc[item?.fieldId] = {
        ...item,
        value: item.fieldKey === 'date' || item.fieldKey?.indexOf('Date') > -1 ? formatDateFrom(item.value) : item.value
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
            return <GetComboBox key={item.fieldId} formik={formik} field={item} rpbParams={rpbParams} />
          } else if (item.controlType === 4) {
            return <GetDate key={item.fieldId} formik={formik} field={item} rpbParams={rpbParams} />
          } else if (item.controlType === 1) {
            return <GetTextField key={item.fieldId} formik={formik} field={item} apiDetails={item.apiDetails} />
          }
        })}
      </Grid>
    </FormShell>
  )
}

export default ReportParameterBrowser
