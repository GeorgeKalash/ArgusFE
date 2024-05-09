// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, TextField } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import toast from 'react-hot-toast'

// ** Custom Imports
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

import CustomTextField from 'src/components/Inputs/CustomTextField'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import { useForm } from 'src/hooks/form'

const FiDimensions = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [tempDimCount, setTempDimCount] = useState(null)

  const [initialValues, setInitialData] = useState({
    DimCount: null,
    tpaDimension1: null,
    tpaDimension2: null,
    tpaDimension3: null,
    tpaDimension4: null,
    tpaDimension5: null,
    tpaDimension6: null,
    tpaDimension7: null,
    tpaDimension8: null,
    tpaDimension9: null,
    tpaDimension10: null,
    tpaDimension11: null,
    tpaDimension12: null,
    tpaDimension13: null,
    tpaDimension14: null,
    tpaDimension15: null,
    tpaDimension16: null,
    tpaDimension17: null,
    tpaDimension18: null,
    tpaDimension19: null,
    tpaDimension20: null
  })

  const { formik } = useForm({
    initialValues: initialValues,
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      DimCount: yup.number().nullable().required('Dim Count is required').min(1).max(20),
      ...Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => i + 1).map(num => [
          `tpaDimension${num}`,
          yup
            .string()
            .nullable()
            .test(`is-tpaDimension${num}-required`, `Dimension ${num} is required`, function (value) {
              const { DimCount } = this.parent

              return DimCount >= num ? value != null : true
            })
        ])
      )
    }),

    onSubmit: values => {
      postDimensionSettings(values)
    }
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: parameters
    })
      .then(res => {
        const filteredList = res.list.filter(obj => {
          return Object.keys(initialValues).includes(obj.key)
        })

        filteredList.forEach(obj => {
          if (obj.value && !isNaN(obj.value) && obj.value.trim() !== '') {
            myObject[obj.key] = parseInt(obj.value)
          } else {
            myObject[obj.key] = obj.value
          }
        })

        formik.setValues(myObject)
        console.log('obj', myObject)
      })
      .catch(error => {})
  }

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.FI_dimensions
  })

  const postDimensionSettings = obj => {
    var dataToPost = [{ key: 'DimCount', value: obj.DimCount }]
    for (let i = 1; i <= 20; i++) {
      const dimKey = `tpaDimension${i}`
      if (obj[dimKey] !== undefined) {
        dataToPost.push({ key: dimKey, value: obj[dimKey] })
      }
    }
    console.log(dataToPost)
    postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ sysDefaults: dataToPost })
    })
      .then(res => {
        toast.success('Record Successfully Updated')
      })
      .catch(error => {})
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  useEffect(() => {
    const dimCount = formik.values.DimCount
    for (let i = 1; i <= 20; i++) {
      const dimKey = `tpaDimension${i}`
      if (i > dimCount) {
        formik.setFieldValue(dimKey, null)
      }
    }
  }, [formik.values.DimCount])

  const handleDimCountChange = event => {
    setTempDimCount(event.target.value)
  }

  const handleDimCountBlur = () => {
    if (tempDimCount !== null) {
      formik.setFieldValue('DimCount', tempDimCount)
    }
  }

  return (
    <>
      <FormShell
        resourceId={ResourceIds.FI_dimensions}
        maxAccess={access}
        form={formik}
        isSaved={false}
        isInfo={false}
        isCleared={false}
      >
        <Grid container spacing={3} width={700}>
          <Grid item xs={12}>
            <CustomTextField
              name='DimCount'
              label='Dimension Count'
              value={tempDimCount === null ? formik.values.DimCount : tempDimCount}
              onChange={handleDimCountChange}
              onBlur={handleDimCountBlur}
              numberField={true}
              removeClear={true}
              type='number'
              error={formik.touched.DimCount && Boolean(formik.errors.DimCount)}
              inputProps={{
                min: 1,
                max: 20,
                maxLength: 2,
                inputMode: 'numeric',
                pattern: '[1-20]*'
              }}
              helperText={formik.touched.DimCount && formik.errors.DimCount}
            />
          </Grid>

          <Grid item xs={12} md={6} sx={{ marginTop: '0.2rem' }}>
            <Grid container spacing={2}>
              {Array.from({ length: 10 }).map((_, index) => (
                <Grid item xs={12} key={1}>
                  <CustomTextField
                    key={index}
                    name={`tpaDimension${index + 1}`}
                    label={`Dimension ${index + 1}`}
                    value={formik.values[`tpaDimension${index + 1}`]}
                    onClear={() => formik.setFieldValue(`tpaDimension${index + 1}`, '')}
                    onChange={formik.handleChange}
                    error={formik.values.DimCount > index && Boolean(formik.errors[`tpaDimension${index + 1}`])}
                    inputProps={{
                      readOnly: formik.values.DimCount <= index || formik.values.DimCount === 'null'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={6} sx={{ marginTop: '0.2rem' }}>
            <Grid container spacing={2}>
              {Array.from({ length: 10 }).map((_, index) => (
                <Grid item xs={12} key={1}>
                  <CustomTextField
                    key={index + 10}
                    name={`tpaDimension${index + 11}`}
                    label={`Dimension ${index + 11}`}
                    value={formik.values[`tpaDimension${index + 11}`]}
                    onClear={() => formik.setFieldValue(`tpaDimension${index + 11}`, '')}
                    onChange={formik.handleChange}
                    error={formik.values.DimCount > index + 10 && Boolean(formik.errors[`tpaDimension${index + 11}`])}
                    inputProps={{
                      readOnly: formik.values.DimCount <= index + 10 || formik.values.DimCount === 'null'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Grid
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: 3,
            textAlign: 'center'
          }}
        >
          <WindowToolbar onSave={handleSubmit} isSaved={true} />
        </Grid>
      </FormShell>
    </>
  )
}

export default FiDimensions
