// ** MUI Imports
import { Grid } from '@mui/material'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import FormShell from './FormShell'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useState , useContext} from 'react'
import CustomComboBox from '../Inputs/CustomComboBox'
import { formatDateToApiFunction } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'

const Confirmation=({
    labels,
    formik,
    editMode,
    idTypeStore,
    maxAccess
}) =>{
  const [showAsPassword , setShowAsPassword]  = useState(true)
  const [showAsPasswordRepeat , setShowAsPasswordRepeat]  = useState(false)
  const { getMicroRequest} = useContext(RequestsContext)

  const handleCopy = (event) => {
    event.preventDefault();
  };


  const fetchFormik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      idtId: formik.values.idtId,
      birthDate: formik.values.birthDate,
      idNo: formik.values.idNo,
      idNoRepeat: '',
    },

    validationSchema:  yup.object({
      birthDate: yup.string().required("This field is required"),
      idtId: yup.string().required("This field is required"),
      idNo:  yup.string().required("This field is required"),
      idNoRepeat : yup.string().required('Repeat Password is required')
      .oneOf([yup.ref('idNo'), null], 'Number must match'),

    }),
    onSubmit: values => {
      console.log(values)
      postFetchDefault(values)

    }
  })

  const  postFetchDefault=(obj)=>{
    const defaultParams = `_number=${obj.idNo}&_dateTime=${formatDateToApiFunction(obj.birthDate)}&_type=${obj.idtId}`
    var parameters = defaultParams
    getMicroRequest({
      extension: 'getInformation',
      parameters: parameters,

    }).then(res => {

      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

return (

          <FormShell
            form={fetchFormik}
            height={320}
            maxAccess={maxAccess}
            editMode={editMode}
        >
          <Grid container spacing={4}>
           <Grid item xs={12}>
                  <CustomComboBox
                    name="idtId"
                    label={labels.type}
                    valueField="recordId"
                    displayField="name"
                    readOnly={ true}
                    store={idTypeStore}
                    value={ fetchFormik.values.idtId &&
                      idTypeStore.filter(
                        (item) =>
                          item.recordId ===
                          fetchFormik.values.idtId,
                      )[0]
                    }
                    required

                  />
                </Grid>
             <Grid item xs={12}>
              <CustomDatePicker
                name="birthDate"
                label={labels.birthDate}
                value={fetchFormik.values?.birthDate}
                required={true}
                onChange={fetchFormik.setFieldValue}
                onClear={() =>
                  fetchFormik.setFieldValue("birthDate", "")
                }
                disabledDate={'>='}
                readOnly={true}

                error={
                  fetchFormik.touched.birthDate &&
                  Boolean(fetchFormik.errors.birthDate)
                }
                helperText={
                  fetchFormik.touched.birthDate &&
                  fetchFormik.errors.birthDate
                }
              />
            </Grid>

            <Grid item xs={12} sx={{position: 'relative', width: '100%'}}>
                  <CustomTextField
                  sx={{color: 'white'}}
                    name="idNo"
                    label={labels.number}
                    type={showAsPassword && 'password'}
                    value={fetchFormik.values?.idNo }
                    required
                    onChange={ (e) =>{ fetchFormik.handleChange(e) }}
                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    readOnly={ true}
                    maxLength="15"
                    onBlur={(e) =>{ setShowAsPassword(true) }}
                    onFocus={(e) =>{ setShowAsPassword(false) }}

                    onClear={() =>{
                      fetchFormik.setFieldValue("idNo", "")

                    }
                    }
                    error={
                      fetchFormik.touched.idNo &&
                      Boolean(fetchFormik.errors.idNo)
                    }
                    helperText={
                      fetchFormik.touched.idNo &&
                      fetchFormik.errors.idNo
                    }
                  />


                </Grid>


                <Grid item xs={12}
                sx={{position: 'relative', width: '100%',}}>
                  <CustomTextField
                    name="idNoRepeat"
                    label={labels.confirmNb}
                    value={fetchFormik.values?.idNoRepeat}
                    required
                    type={ showAsPasswordRepeat && "password"}

                    onChange={ (e) =>{ fetchFormik.handleChange(e) }}

                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    readOnly={editMode && true}

                    onBlur={(e) =>{ setShowAsPasswordRepeat(true) , fetchFormik.handleBlur(e)}}

                    onFocus={(e) =>{ setShowAsPasswordRepeat(false) }}

                    maxLength="15"
                    onClear={() =>{
                      fetchFormik.setFieldValue("idNoRepeat", "")
                    } }
                    error={
                      fetchFormik.touched.idNoRepeat &&
                      Boolean(fetchFormik.errors.idNoRepeat)
                    }
                    helperText={
                      fetchFormik.touched.idNoRepeat &&
                      fetchFormik.errors.idNoRepeat
                    }
                  />

                </Grid>
                </Grid>
                </FormShell>

    )
}

export default Confirmation
