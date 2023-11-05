// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  Button,
  Grid
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** 3rd Party Imports
import Draggable from 'react-draggable'

// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import WindowToolbar from './WindowToolbar'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import Window from './Window'
import CustomTextField from '../Inputs/CustomTextField'
import CustomDatePicker from '../Inputs/CustomDatePicker'

function PaperComponent(props) {
  return (
    <Draggable handle='#draggable-dialog-title' cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  )
}

const ReportParameterBrowser = ({ open, onClose, height = 200, onSave, reportName, functionStore }) => {
  const { getRequest } = useContext(RequestsContext)

  const [parameters, setParameters] = useState(null)
  const [fields, setFields] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)

  const parametersValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,

    validationSchema: yup.object({
      fromFunctionId: yup.string().required('This field is required'),
      toFunctionId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log({ values })

      // onSave({ _startAt: 0, _pageSize: 30, params: '' })
      // onClose()
    }
  })

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

  const getFieldKey = (key) => {
    switch (key) {
      case 'toFunctionId':
        return parametersValidation.values?.toFunctionId
      case 'fromFunctionId':
        return parametersValidation.values?.fromFunctionId

      default:
        break;
    }
  }

  const getFieldValue = (key) => {
    switch (key) {
      case 'toFunctionId':
        return { toFunctionId: null }
      case 'fromFunctionId':
        return { fromFunctionId: null }

      default:
        break;
    }
  }

  const getDataByClassId = () => {

    parameters.map((field) => {

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
                  parametersValidation.setFieldValue(field.key, newValue?.key)
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
                numberField //add necessary props
                name={field.key}
                label={field.caption}
                value={parametersValidation.values[field.key]} //??
                required={field.mandatory}
                onChange={(event, newValue) => {
                  parametersValidation.setFieldValue(field.key, newValue?.key)
                }}
                onClear={() => parametersValidation.setFieldValue(field.key, '')}
              />
            </Grid>
          )
          break
        case 4:
          // formatDateFromApi
          fields.push(
            <Grid item xs={12}>
              <CustomDatePicker
                name={field.key}
                label={field.caption}
                value={parametersValidation.values[field.key]} //??
                required={field.mandatory}
                onChange={(event, newValue) => {
                  parametersValidation.setFieldValue(field.key, newValue?.key)
                }}
                onClear={() => parametersValidation.setFieldValue(field.key, '')}
              />
            </Grid>
          )
          break
        case 5:
          switch (field.classId) {
            case 0:
              var parameters = `_database=${field.data}` //add 'xml'.json and get _database values from there
              getRequest({
                extension: SystemRepository.KeyValueStore,
                parameters: parameters
              })
                .then(res => {

                  var _fieldKey = getFieldKey(field.key)
                  var _fieldValue = getFieldValue(field.key)

                  parametersValidation.setValues({
                    ...parametersValidation.values,
                    ..._fieldValue
                  })

                  fields.push(
                    <Grid item xs={12}>
                      <CustomComboBox
                        name={field.key}
                        label={field.caption}
                        valueField='key'
                        displayField='value'
                        store={res.list}
                        value={res.list.filter(item => item.value === _fieldKey)[0]}
                        required={field.mandatory}
                        onChange={(event, newValue) => {
                          parametersValidation.setFieldValue(field.key, newValue?.key)
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
          break
        case 6:
          //CustomCheckBox might be needed
          break
        default:
          break
      }
    })
  }

  useEffect(() => {
    if (!parameters)
      getParameterDefinition()
    if (parameters)
      getDataByClassId()
  }, [parameters])

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
