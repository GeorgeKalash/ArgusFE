import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import * as yup from 'yup'
import { useForm } from 'src/hooks/form'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const UserTextForm = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [stagingDimCount, setStagingDimCount] = useState(null)

  const { formik } = useForm({
    initialValues: {
      DimCount: '',
      tpaDimension1: '',
      tpaDimension2: '',
      tpaDimension3: '',
      tpaDimension4: '',
      tpaDimension5: '',
      tpaDimension6: '',
      tpaDimension7: '',
      tpaDimension8: '',
      tpaDimension9: '',
      tpaDimension10: '',
      tpaDimension11: '',
      tpaDimension12: '',
      tpaDimension13: '',
      tpaDimension14: '',
      tpaDimension15: '',
      tpaDimension16: '',
      tpaDimension17: '',
      tpaDimension18: '',
      tpaDimension19: '',
      tpaDimension20: ''
    },
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

              return DimCount >= num ? !!value : true
            })
        ])
      )
    }),

    onSubmit: async values => {
      await postDimensionSettings(values)
    }
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const fetchedValues = {}
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: parameters
    })
      .then(res => {
        const filteredList = res.list.filter(obj => {
          return Object.keys(formik.values).includes(obj.key)
        })

        filteredList.forEach(obj => {
          if (obj.value && !isNaN(obj.value) && obj.value.trim() !== '') {
            fetchedValues[obj.key] = parseInt(obj.value)
          } else {
            fetchedValues[obj.key] = obj.value
          }
        })
        formik.setValues(fetchedValues)
      })
      .catch(error => {})
  }

  const { labels: _labels } = useResourceQuery({
    datasetId: ResourceIds.FI_dimensions
  })

  const postDimensionSettings = async obj => {
    var dataToPost = [{ key: 'DimCount', value: obj.DimCount }]
    for (let i = 1; i <= 20; i++) {
      const dimKey = `tpaDimension${i}`
      if (obj[dimKey] !== undefined) {
        dataToPost.push({ key: dimKey, value: obj[dimKey] })
      }
    }
    await postRequest({
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

  const handleDimCountChange = event => {
    setStagingDimCount(event.target.value)
  }

  function clearExcessFields(currentCount) {
    const dimCount = currentCount
    for (let i = 1; i <= 20; i++) {
      const dimKey = `tpaDimension${i}`
      if (i > dimCount) {
        formik.setFieldValue(dimKey, '')
      }
    }
  }

  const handleDimCountBlur = () => {
    if (stagingDimCount !== null) {
      formik.setFieldValue('DimCount', stagingDimCount)
      process.nextTick(() => {
        clearExcessFields(stagingDimCount)
      })
    }
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={3} width={'50%'} sx={{ marginLeft: '0.5rem' }}>
          <Grid item xs={12} sx={{ marginTop: '0.5rem' }}>
            <CustomTextField
              name='DimCount'
              label={_labels.DimCount}
              value={stagingDimCount === null ? formik.values.DimCount : stagingDimCount}
              onChange={handleDimCountChange}
              onBlur={handleDimCountBlur}
              numberField={true}
              clearable={true}
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

          <Grid item xs={12} md={6} sx={{ marginTop: '0.3rem' }}>
            <Grid container spacing={2}>
              {Array.from({ length: 10 }).map((_, index) => (
                <Grid item xs={12} key={index}>
                  <CustomTextField
                    key={index}
                    name={`tpaDimension${index + 1}`}
                    label={`${_labels.Dim} ${index + 1}`}
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

          <Grid item xs={12} md={6} sx={{ marginTop: '0.3rem' }}>
            <Grid container spacing={2}>
              {Array.from({ length: 10 }).map((_, index) => (
                <Grid item xs={12} key={1}>
                  <CustomTextField
                    key={index + 10}
                    name={`tpaDimension${index + 11}`}
                    label={`${_labels.Dim} ${index + 11}`}
                    value={formik.values[`tpaDimension${index + 11}`]}
                    onClear={() => formik.setFieldValue(`tpaDimension${index + 11}`, '')}
                    onChange={formik.handleChange}
                    error={formik.errors[`tpaDimension${index + 11}`]}
                    inputProps={{
                      readOnly: formik.values.DimCount <= index + 10 || formik.values.DimCount === 'null'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grow>
      <Fixed>
        <WindowToolbar onSave={handleSubmit} isSaved={true} />
      </Fixed>
    </VertLayout>
  )
}

export default UserTextForm
