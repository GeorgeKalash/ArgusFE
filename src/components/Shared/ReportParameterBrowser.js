// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Checkbox, FormControlLabel, Grid } from '@mui/material'

// ** Third Party Imports
import * as yup from 'yup'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ResourceLookup } from './ResourceLookup'
import WindowToolbar from './WindowToolbar'
import { useForm } from 'src/hooks/form'
import FormShell from './FormShell'

const ReportParameterBrowser = ({ reportName, paramsArray, setParamsArray, disabled }) => {
  const { getRequest } = useContext(RequestsContext)

  const [parameters, setParameters] = useState(null)
  const [fields, setFields] = useState([])

  //snaphot stores
  const [itemSnapshotStore, setItemSnapshotStore] = useState([null])

  const initialParams = paramsArray

  const getParameterDefinition = () => {
    var parameters = '_reportName=' + reportName

    getRequest({
      extension: SystemRepository.ParameterDefinition,
      parameters: parameters
    }).then(res => {
      setParameters(res.list)
    })
  }

  // const getFieldKey = key => {
  //   switch (key) {
  //     case 'toFunctionId':
  //       return formik.values?.toFunctionId
  //     case 'fromFunctionId':
  //       return formik.values?.fromFunctionId

  //     default:
  //       break
  //   }
  // }

  const getFieldValue = key => {
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

  const getComboBoxByClassId = field => {
    switch (field.classId) {
      case 0:
        var parameters = `_database=${field.data}`
        getRequest({
          extension: SystemRepository.KeyValueStore,
          parameters: parameters
        }).then(res => {
          var _fieldValue = getFieldValue(field.key)
          formik.setValues(pre => {
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
                  formik?.values &&
                  formik?.values[field.key] &&
                  res.list.filter(item => item.key === formik?.values[field.key])[0]
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
                  formik.setFieldValue([field.key], newValue?.key)
                }}
                sx={{ pt: 2 }}
              />
            </Grid>
          )
        })
        break

      case 41101:
        var parameters = '_filter='
        getRequest({
          extension: InventoryRepository.Site.qry,
          parameters
        }).then(res => {
          var _fieldValue = getFieldValue(field.key)

          formik.setValues(pre => {
            return {
              ...pre,
              ..._fieldValue
            }
          })
          fields.push(getCombo({ field, valueField: 'recordId', displayField: 'reference', store: res.list }))
        })
        break
      case 41103:
        var parameters = '_filter=&_name=&_pageSize=1000&_startAt=0'
        getRequest({
          extension: InventoryRepository.Category.qry,
          parameters
        }).then(res => {
          var _fieldValue = getFieldValue(field.key)

          formik.setValues(pre => {
            return {
              ...pre,
              ..._fieldValue
            }
          })
          fields.push(getCombo({ field, valueField: 'recordId', displayField: 'name', store: res.list }))
        })
        break

      case 41201: //item filter
        // getCombo({
        //   field,
        //   valueField: 'recordId',
        //   displayField: 'reference',
        //   itemSnapshotStore,
        //   onChange: setItemSnapshotStore(itemSnapshot())
        // })
        fields
          .push

          // <ResourceLookup
          //   endpointId='IV.asmx/snapshotIT'
          //   valueField='sku'
          //   displayField='sku'
          //   name='sku'
          //   label={field.caption}
          //   form={formik}
          //   secondDisplayField={true}
          //   firstValue={formik?.values?.sku}
          //   secondValue={formik?.values?.description}
          //   onChange={(event, newValue) => {
          //     if (newValue) {
          //       formik.setFieldValue('itemId', newValue?.recordId)
          //       formik.setFieldValue('sku', newValue?.sku)
          //       formik.setFieldValue('description', newValue?.description)
          //     } else {
          //       formik.setFieldValue('itemId', '')
          //       formik.setFieldValue('sku', null)
          //       formik.setFieldValue('description', null)
          //     }
          //   }}
          //   errorCheck={'itemId'}
          // />
          ()
        break

      // case 41103:
      //   var parameters = '_filter='

      //   getRequest({
      //     extension: InventoryRepository.Category.qry,
      //     parameters
      //   })
      //     .then(res => {
      //       var _fieldValue = getFieldValue(field.key)

      //       formik.setValues(pre => {
      //         return {
      //           ...pre,
      //           ..._fieldValue
      //         }
      //       })

      //       fields.push(getCombo({ field, valueField: 'recordId', displayField: 'reference', store: res.list }))
      //     })
      //     .catch(error => {
      //       setErrorMessage(error)
      //     })
      //   break

      // case 41102:
      //   var parameters = '_filter='

      //   getRequest({
      //     extension: InventoryRepository.Measurement.qry,
      //     parameters
      //   })
      //     .then(res => {
      //       var _fieldValue = getFieldValue(field.key)

      //       formik.setValues(pre => {
      //         return {
      //           ...pre,
      //           ..._fieldValue
      //         }
      //       })

      //       fields.push(getCombo({ field, valueField: 'recordId', displayField: 'reference', store: res.list }))
      //     })
      //     .catch(error => {
      //       setErrorMessage(error)
      //     })
      //   break

      // case 51101:
      //   var parameters = '_filter='

      //   getRequest({
      //     extension: SaleRepository.PriceLevel.qry,
      //     parameters
      //   })
      //     .then(res => {
      //       var _fieldValue = getFieldValue(field.key)

      //       formik.setValues(pre => {
      //         return {
      //           ...pre,
      //           ..._fieldValue
      //         }
      //       })

      //       fields.push(getCombo({ field, valueField: 'siteId', displayField: 'reference', store: res.list }))
      //     })
      //     .catch(error => {
      //       setErrorMessage(error)
      //     })
      //   break

      default:
        break
    }
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
                    onClear={() => formik.setFieldValue(field.key, '')}
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

  const { formik } = useForm({
    initialValues: {},
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
    onSubmit: values => {
      console.log('handle submit')
      onClose()
    }
  })

  const clearValues = () => {
    setParamsArray([])
  }

  // const clearValues = () => {
  //   setParamsArray([])
  //   // formik.resetForm()

  //   console.log({ parameters })
  //   console.log({ fields })
  //   parameters.map(param => {
  //     console.log({ param })
  //     formik.setFieldValue(`${param.key}`, null)
  //   })
  //   // console.log({ fields })
  //   setFields([])
  //   // getFieldsByClassId()
  // }

  // useEffect(() => {
  //   console.log({ formik: formik.values })
  // }, [formik])

  // useEffect(() => {
  //   if (parameters && fields.length === 0) getFieldsByClassId()
  // }, [fields])

  useEffect(() => {
    if (!parameters && fields.length === 0 && !disabled) getParameterDefinition()
    if (parameters) {
      // Assuming getFieldsByClassId is an asynchronous function that returns a promise
      getFieldsByClassId().then(() => {
        if (paramsArray.length > 0) {
          const initialValues = {}
          paramsArray.forEach(item => {
            initialValues[item.fieldKey] = item.value
          })
          console.log(initialValues)
          formik.setValues(initialValues)
        }
      })
    }
  }, [parameters, disabled])

  return (
    <FormShell form={formik} infoVisible={false}>
      <Grid container spacing={2} sx={{ px: 4, pt: 2 }}>
        {fields && fields}
      </Grid>
    </FormShell>
  )
}

export default ReportParameterBrowser
