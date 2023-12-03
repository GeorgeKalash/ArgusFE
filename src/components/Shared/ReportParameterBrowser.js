// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Checkbox, FormControlLabel, Grid } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import CustomTextField from '../Inputs/CustomTextField'
import CustomDatePicker from '../Inputs/CustomDatePicker'
import Window from './Window'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

const ReportParameterBrowser = ({ open, onClose, height = 200, reportName, paramsArray, setParamsArray }) => {
  const { getRequest } = useContext(RequestsContext)

  const [parameters, setParameters] = useState(null)
  const [fields, setFields] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)

  const initialParams = paramsArray

  const getParameterDefinition = () => {
    var parameters = '_reportName=' + reportName

    getRequest({
      extension: SystemRepository.ParameterDefinition,
      parameters: parameters
    })
      .then(res => {
        setParameters(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  // const getFieldKey = key => {
  //   switch (key) {
  //     case 'toFunctionId':
  //       return parametersValidation.values?.toFunctionId
  //     case 'fromFunctionId':
  //       return parametersValidation.values?.fromFunctionId

  //     default:
  //       break
  //   }
  // }

  const getFieldValue = key => {
    switch (key) {
      case 'toFunctionId':
        return {
          toFunctionId: parametersValidation?.values?.toFunctionId ? parametersValidation.values.toFunctionId : null
        }
      case 'fromFunctionId':
        return {
          fromFunctionId: parametersValidation?.values?.fromFunctionId
            ? parametersValidation.values.fromFunctionId
            : null
        }

      default:
        break
    }
  }

  const getComboBoxByClassId = field => {
    switch (field.classId) {
      case 0:
        var parameters = `_database=${field.data}`
        getRequest({
          extension: SystemRepository.KeyValueStore,
          parameters: parameters
        })
          .then(res => {
            var _fieldValue = getFieldValue(field.key)
            parametersValidation.setValues(pre => {
              return {
                ...pre,
                ..._fieldValue
              }
            })

            fields.push(
              <Grid item xs={12} key={field.classId}>
                <CustomComboBox
                  name={field.key}
                  label={field.caption}
                  valueField='key'
                  displayField='value'
                  store={res.list}
                  value={
                    parametersValidation?.values &&
                    parametersValidation?.values[field.key] &&
                    res.list.filter(item => item.key === parametersValidation?.values[field.key])[0]
                  }
                  required={field.mandatory}
                  onChange={(event, newValue) => {
                    handleFieldChange({
                      fieldId: field.id,
                      fieldKey: field.key,
                      value: newValue?.key,
                      caption: field.caption,
                      display: newValue?.value
                    })
                    parametersValidation.setFieldValue([field.key], newValue?.key)
                  }}
                  sx={{ pt: 2 }}
                />
              </Grid>
            )
          })
          .catch(error => {
            setErrorMessage(error)
          })
        break

      case 41101:
        var parameters = '_filter='

        getRequest({
          extension: InventoryRepository.Site.qry,
          parameters
        })
          .then(res => {
            var _fieldValue = getFieldValue(field.key)

            parametersValidation.setValues(pre => {
              return {
                ...pre,
                ..._fieldValue
              }
            })

            fields.push(
              <Grid item xs={12}>
                <CustomComboBox
                  name={field.key}
                  label={field.caption}
                  valueField='siteId'
                  displayField='reference'
                  store={res.list}
                  value={
                    parametersValidation?.values &&
                    parametersValidation?.values[field.key] &&
                    res.list.filter(item => item.key === parametersValidation?.values[field.key])[0]
                  }
                  required={field.mandatory}
                  onChange={(event, newValue) => {
                    handleFieldChange({
                      fieldId: field.id,
                      fieldKey: field.key,
                      value: newValue?.key,
                      caption: field.caption,
                      display: newValue?.value
                    })
                    parametersValidation.setFieldValue([field.key], newValue?.key)
                  }}
                  sx={{ pt: 2 }}
                />
              </Grid>
            )
          })
          .catch(error => {
            setErrorMessage(error)
          })
        break

      default:
        break
    }
  }

  const getFieldsByClassId = () => {
    parameters.map(field => {
      switch (field.controlType) {
        case 1:
          fields.push(
            <Grid item xs={12}>
              <CustomTextField
                name={field.key}
                label={field.caption}
                value={parametersValidation.values[field.key]} //??
                required={field.mandatory}
                onChange={(event, newValue) => {
                  handleFieldChange({
                    fieldId: field.id,
                    fieldKey: field.key,
                    value: newValue,
                    caption: field.caption,
                    display: newValue
                  })
                  parametersValidation.setFieldValue(field.key, newValue)
                }}
                onClear={() => parametersValidation.setFieldValue(field.key, '')}
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
                value={parametersValidation.values[field.key]} //??
                required={field.mandatory}
                onChange={(event, newValue) => {
                  handleFieldChange({
                    fieldId: field.id,
                    fieldKey: field.key,
                    value: newValue,
                    caption: field.caption,
                    display: newValue
                  })
                  parametersValidation.setFieldValue(field.key, newValue)
                }}
                onClear={() => parametersValidation.setFieldValue(field.key, '')}
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
                value={parametersValidation.values[field.key]}
                required={field.mandatory}
                onChange={(event, newValue) => {
                  handleFieldChange({
                    fieldId: field.id,
                    fieldKey: field.key,
                    value: newValue,
                    caption: field.caption,
                    display: newValue
                  })
                  parametersValidation.setFieldValue(field.key, newValue)
                }}
                onClear={() => parametersValidation.setFieldValue(field.key, '')}
              />
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
                    checked={parametersValidation.values[field.key]}
                    value={[field.key]}
                    onChange={(event, newValue) => {
                      handleFieldChange({
                        fieldId: field.id,
                        fieldKey: field.key,
                        value: newValue,
                        caption: field.caption,
                        display: newValue
                      })
                      parametersValidation.setFieldValue(field.key, newValue)
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
    })
  }

  const handleFieldChange = object => {
    const existingIndex = paramsArray.findIndex(item => item.fieldId === object.fieldId)

    if (existingIndex !== -1) {
      paramsArray[existingIndex] = {
        fieldId: object.fieldId,
        fieldKey: object.fieldKey,
        value: object.value,
        caption: object.caption,
        display: object.display
      }
    } else {
      paramsArray.push({
        fieldId: object.fieldId,
        fieldKey: object.fieldKey,
        value: object.value,
        caption: object.caption,
        display: object.display
      })
    }

    setFields(fields)
  }

  const parametersValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      // fromFunctionId: yup.string().required('This field is required'),
      // toFunctionId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      onClose()
    }
  })

  const clearValues = () => {
    setParamsArray([])
  }

  useEffect(() => {
    if (!parameters && fields.length === 0) getParameterDefinition()
  }, [parameters])

  useEffect(() => {
    if (!open) setFields([])
    if (parameters && open) getFieldsByClassId()
  }, [open])

  return (
    <>
      {open && (
        <Window
          id='DocumentTypeWindow'
          Title='Document Type Map'
          onClose={onClose}
          width={600}
          height={height}
          onSave={parametersValidation.handleSubmit}
          onClear={clearValues}
        >
          <Grid container spacing={2} sx={{ px: 4, pt: 2 }}>
            {fields && fields}
          </Grid>
        </Window>
      )}

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default ReportParameterBrowser
