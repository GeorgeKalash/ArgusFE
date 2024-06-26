import { useEffect, useState, useContext } from 'react'
import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import * as yup from 'yup'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useForm } from 'src/hooks/form'
import FormShell from './FormShell'
import { apiMappings, COMBOBOX, LOOKUP } from './apiMappings'
import ResourceComboBox from './ResourceComboBox'
import { ResourceLookup } from './ResourceLookup'
import { formatDateDefault } from 'src/lib/date-helper'

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

const ReportParameterBrowser = ({ reportName, setParamsArray, paramsArray, disabled, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const [parameters, setParameters] = useState([])
  const [fields, setFields] = useState([])

  const getParameterDefinition = (reportName, setParameters) => {
    const parameters = `_reportName=${reportName}`

    getRequest({
      extension: SystemRepository.ParameterDefinition,
      parameters: parameters
    }).then(res => {
      setParameters(res.list)
    })
  }

  const getFieldValue = key => {
    return { key: formik?.values?.key ? formik.values.key : null }
    switch (key) {
      case 'toFunctionId':
        return {
          toFunctionId: formik?.values?.toFunctionId ? formik.values.toFunctionId : null
        }
      case 'fromFunctionId':
        return {
          fromFunctionId: formik?.values?.fromFunctionId ? formik.values.fromFunctionId : null
        }
      case 'categoryId':
        return {
          categoryId: formik?.values?.categoryId ? formik.values.categoryId : null
        }
      case 'fiscalYear':
        return {
          fiscalYear: formik?.values?.fiscalYear ? formik.values.fiscalYear : null
        }
      case 'currencyId':
        return {
          currencyId: formik?.values?.currencyId ? formik.values.currencyId : null
        }
      case 'cashAccountId':
        return {
          cashAccountId: formik?.values?.cashAccountId ? formik.values.cashAccountId : null
        }

      default:
        break
    }
  }

  const getCombo = ({ field, valueField, displayField, store, onChange }) => {
    return (
      <Grid item xs={12}>
        <CustomComboBox
          name={field.key}
          label={field.caption}
          valueField={valueField}
          displayField={displayField}
          store={store}
          value={
            formik?.values &&
            formik?.values[field.key] &&
            store.filter(item => item.key === formik?.values[field.key])[0]
          }
          required={field.mandatory}
          onChange={(event, newValue) => {
            onChange && onChange(newValue)
            handleFieldChange({
              fieldId: field.id,
              fieldKey: field.key,
              value: newValue[valueField],
              caption: field.caption,
              display: newValue[displayField]
            })
            formik.setFieldValue([field.key], newValue?.key)
          }}
          sx={{ pt: 2 }}
        />
      </Grid>
    )
  }

  const itemSnapshot = newValue => {
    var parameters = '_categoryId=0&_msId=0&_filter=&_startAt=0&_size=30'
    getRequest({
      extension: InventoryRepository.Item.snapshot,
      parameters
    }).then(res => {
      return res.list
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

  const getDateField = async (field, formik) => {
    if (field.defaultValue && !formik.values[field.key]) {
      formik.setFieldValue(field.key, field.defaultValue)
    }

    return (
      <Grid item xs={12} key={field.id}>
        {formik.values?.parameters?.[field.id]?.value}
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
              display: formatDateDefault(newValue),
              display2: name
            })
          }}
          onClear={() => formik.setFieldValue(field.key, '')}
        />
      </Grid>
    )
  }

  const getComboBoxByClassId = async (field, formik) => {
    const apiDetails = await fetchData(field)
    if (!apiDetails) return null

    const _fieldValue = getFieldValue(field.key)
    formik.setValues(pre => ({
      ...pre,
      ..._fieldValue
    }))

    return (
      <Grid item xs={12} key={field.id}>
        <ResourceComboBox
          endpointId={apiDetails.endpoint}
          name={field.key}
          label={field.caption}
          valueField={apiDetails.valueField}
          displayField={apiDetails.displayField}
          columnsInDropDown={apiDetails.columnsInDropDown}
          required={field.mandatory}
          value={formik.values?.parameters?.[field.id]?.value}
          onChange={(event, newValue) => {
            formik.setFieldValue(`parameters[${field.id}]`, {
              fieldId: field.id,
              fieldKey: field.key,
              value: newValue?.[apiDetails.valueField],
              caption: field.caption,
              display: newValue?.[apiDetails.displayField],
              display2: newValue?.[apiDetails.displayField]
            })
          }}
        />
      </Grid>
    )
  }

  const getLookupByClassId = async (field, formik) => {
    const apiDetails = await fetchData(field)
    if (!apiDetails) return null

    const _fieldValue = getFieldValue(field.key)
    formik.setValues(pre => ({
      ...pre,
      ..._fieldValue
    }))

    return (
      <Grid item xs={12} key={field.id}>
        <ResourceLookup
          endpointId={apiDetails.endpoint}
          parameters={apiDetails.parameters}
          firstFieldWidth={apiDetails.firstFieldWidth}
          valueField={apiDetails.valueField}
          displayField={apiDetails.displayField}
          name={field.key}
          displayFieldWidth={apiDetails.displayFieldWidth}
          required={field.mandatory}
          label={field.caption}
          form={formik}
          firstValue={formik.values.parameters?.[field.id]?.display}
          secondValue={formik.values.test}
          onChange={(event, newValue) => {
            formik.setFieldValue(`parameters[${field.id}]`, {
              fieldId: field.id,
              fieldKey: field.key,
              value: newValue?.[apiDetails.valueOnSelection],
              caption: field.caption,
              display: newValue?.[apiDetails.displayField],
              display2: newValue?.[apiDetails.valueField]
            })
          }}
        />
      </Grid>
    )
  }

  const generateFields = async (parameters, formik) => {
    const fieldComponents = await Promise.all(
      parameters.map(async field => {
        if (field.controlType === 5) {
          return await readDynamicFields(field, formik)
        } else if (field.controlType === 4) {
          return await getDateField(field, formik)
        }
      })
    )

    return fieldComponents.filter(field => field !== null)
  }

  const readDynamicFields = async (field, formik) => {
    const apiDetails = await fetchData(field)
    if (!apiDetails) return null

    const _fieldValue = getFieldValue(field.key)
    formik.setValues(pre => ({
      ...pre,
      ..._fieldValue
    }))

    if (apiDetails.type == COMBOBOX) return await getComboBoxByClassId(field, formik)
    else return await getLookupByClassId(field, formik)
  }

  const getFieldsByClassId = async () => {
    return new Promise((resolve, reject) => {
      try {
        parameters.forEach(async (field, index) => {
          switch (field.controlType) {
            case 1:
              fields.push(
                <Grid item xs={12}>
                  <CustomTextField
                    name={field.key}
                    label={field.caption}
                    value={formik.values[field.key]} //??
                    required={field.mandatory}
                    onChange={event => {
                      const newValue = event.target.value
                      handleFieldChange({
                        fieldId: field.id,
                        fieldKey: field.key,
                        value: newValue,
                        caption: field.caption,
                        display: newValue
                      })
                      formik.setFieldValue(field.key, newValue)
                    }}
                    onClear={() => formik.setFieldValue(field.key, '')}
                  />
                </Grid>
              )
              break
            case 2:
              fields.push(
                <Grid item xs={12}>
                  <CustomTextField
                    numberField
                    name={field.key}
                    label={field.caption}
                    value={formik.values[field.key]} //??
                    required={field.mandatory}
                    onChange={event => {
                      const newValue = event.target.value
                      handleFieldChange({
                        fieldId: field.id,
                        fieldKey: field.key,
                        value: newValue,
                        caption: field.caption,
                        display: newValue
                      })
                      formik.setFieldValue(field.key, newValue)
                    }}
                    onClear={() => formik.setFieldValue(field.key, '')}
                  />
                </Grid>
              )
              break
            case 4:
              fields.push(
                <Grid item xs={12}>
                  <CustomDatePicker
                    name={field.key}
                    label={field.caption}
                    value={formik.values[field.key]}
                    required={field.mandatory}
                    onChange={event => {
                      console.log(event)
                      formik.setFieldValue
                    }}
                    onClear={() => formik.setFieldValue(field.key, '')}
                  />
                  {/* <CustomDatePicker
                    name={field.key}
                    label={field.caption}
                    value={formik.values[field.key]}
                    required={field.mandatory}
                    onChange={event => {
                      const newValue = event?.target?.value
                      handleFieldChange({
                        fieldId: field.id,
                        fieldKey: field.key,
                        value: newValue,
                        caption: field.caption,
                        display: newValue
                      })
                      formik.setFieldValue(field.key, newValue)
                    }}
                    onClear={() => formik.setFieldValue(field.key, '')}
                  /> */}
                </Grid>
              )
              break
            case 5:
              getComboBoxByClassId(field)
              break
            case 6:
              fields.push(
                <Grid item xs={12}>
                  <FormControlLabel
                    label={field.caption}
                    control={
                      <Checkbox
                        id={cellId}
                        name={field.key}
                        checked={formik.values[field.key]}
                        value={[field.key]}
                        onChange={(event, newValue) => {
                          handleFieldChange({
                            fieldId: field.id,
                            fieldKey: field.key,
                            value: newValue,
                            caption: field.caption,
                            display: newValue
                          })
                          formik.setFieldValue(field.key, newValue)
                        }}
                      />
                    }
                  />
                </Grid>
              )
              break
            default:
              break
          }

          // Check if it's the last iteration
          if (index === parameters.length - 1) {
            resolve() // Resolve the promise after the loop completes
          }
        })
      } catch (error) {
        reject(error) // Reject the promise if any error occurs
      }
    })
  }

  // const handleFieldChange = object => {
  //   const existingIndex = paramsArray.findIndex(item => item.fieldId === object.fieldId)
  //   if (existingIndex !== -1) {
  //     paramsArray[existingIndex] = {
  //       fieldId: object.fieldId,
  //       fieldKey: object.fieldKey,
  //       value: object.value,
  //       caption: object.caption,
  //       display: object.display
  //     }
  //   } else {
  //     paramsArray.push({
  //       fieldId: object.fieldId,
  //       fieldKey: object.fieldKey,
  //       value: object.value,
  //       caption: object.caption,
  //       display: object.display
  //     })
  //   }

  //   //setParamsArray(paramsArray)
  //   //console.log(paramsArray)
  //   //setFields(fields)
  // }

  const { formik } = useForm({
    initialValues: {
      parameters: [],
      test: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
    onSubmit: values => {
      console.log('values', values)
      const processedArray = values?.parameters
        ?.filter((item, index) => item?.fieldId)
        .reduce((acc, item) => {
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
  console.log('formik'.formik?.values)

  useEffect(() => {
    getParameterDefinition(reportName, setParameters)
  }, [reportName])

  useEffect(() => {
    if (parameters.length > 0) {
      ;(async () => {
        const generatedFields = await generateFields(parameters, formik)
        setFields(generatedFields)
      })()
    }
  }, [parameters])

  console.log('formiksss', formik?.values, paramsArray)

  return (
    <FormShell form={formik} infoVisible={false}>
      <Grid container spacing={2} sx={{ px: 4, pt: 2 }}>
        {fields.length > 0 ? fields : <div>Loading...</div>}
      </Grid>
    </FormShell>
  )
}

export default ReportParameterBrowser
