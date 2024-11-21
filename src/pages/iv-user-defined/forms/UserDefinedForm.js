import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import * as yup from 'yup'
import { useForm } from 'src/hooks/form'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

const UserDefinedForm = ({ labels }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)
  const [errored, setErrored] = useState(false)

  const counter = 20

  const { formik } = useForm({
    initialValues: {
      ivtDimCount: '',
      ...Object.fromEntries(Array.from({ length: counter }, (_, i) => [`ivtDimension${i + 1}`, '']))
    },
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      ivtDimCount: yup.number().nullable().required().min(1).max(counter),
      ...Object.fromEntries(
        Array.from({ length: counter }, (_, i) => i + 1).map(num => [
          `ivtDimension${num}`,
          yup
            .string()
            .nullable()
            .test(function (value) {
              const { ivtDimCount } = this.parent

              return parseInt(ivtDimCount) >= num ? !!value : true
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

    const filteredList = defaultsData?.list?.filter(obj => {
      return Object.keys(formik.values).includes(obj.key)
    })

    filteredList?.forEach(obj => {
      if (obj.value && !isNaN(obj.value) && obj.value.trim() !== '') {
        fetchedValues[obj.key] = parseInt(obj.value)
      } else {
        fetchedValues[obj.key] = obj.value
      }
    })
    formik.setValues(fetchedValues)
  }

  const postDimensionSettings = async obj => {
    var dataToPost = [{ key: 'ivtDimCount', value: obj.ivtDimCount }]
    for (let i = 1; i <= counter; i++) {
      const dimKey = `ivtDimension${i}`
      if (obj[dimKey] !== undefined) {
        dataToPost.push({ key: dimKey, value: obj[dimKey] })
      }
    }
    await postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ sysDefaults: dataToPost })
    }).then(res => {
      toast.success(platformLabels.Updated)
      updateDefaults(dataToPost)
    })
  }

  const handleSubmit = () => {
    if (errored) {
      return
    }
    formik.handleSubmit()
  }

  function clearExcessFields(currentCount) {
    for (let i = 1; i <= counter; i++) {
      const dimKey = `ivtDimension${i}`
      if (i > currentCount) {
        formik.setFieldValue(dimKey, '', false)
      }
    }
  }

  const handleDimCountBlur = e => {
    let value = parseInt(e.target.value, 10)
    if (value > counter || !value || value < 1) {
      setErrored(true)

      return
    }
    setErrored(false)

    formik.setFieldValue('ivtDimCount', value)

    clearExcessFields(value)
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={3} width={'50%'} sx={{ marginLeft: '0.5rem', marginTop: '0.5rem' }}>
          <Grid item xs={12}>
            <CustomNumberField
              name='ivtDimCount'
              label={labels.propertiesCount}
              value={formik.values.ivtDimCount}
              maxLength={2}
              decimalScale={0}
              onBlur={handleDimCountBlur}
              unClearable={true}
              min={1}
              max={counter}
              allowNegative={false}
              arrow={true}
              error={errored || (formik.touched.ivtDimCount && Boolean(formik.errors.ivtDimCount))}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {Array.from({ length: 10 }).map((_, index) => (
                <Grid item xs={12} key={index}>
                  <CustomTextField
                    key={index}
                    name={`ivtDimension${index + 1}`}
                    label={`${labels.property} ${index + 1}`}
                    value={formik.values[`ivtDimension${index + 1}`]}
                    onClear={() => formik.setFieldValue(`ivtDimension${index + 1}`, '')}
                    onChange={formik.handleChange}
                    error={
                      !errored &&
                      formik.values.ivtDimCount > index &&
                      Boolean(formik.errors[`ivtDimension${index + 1}`])
                    }
                    inputProps={{
                      readOnly: errored || formik.values.ivtDimCount <= index || formik.values.ivtDimCount === 'null'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {Array.from({ length: 10 }).map((_, index) => (
                <Grid item xs={12} key={1}>
                  <CustomTextField
                    key={index + 10}
                    name={`ivtDimension${index + 11}`}
                    label={`${labels.property} ${index + 11}`}
                    value={formik.values[`ivtDimension${index + 11}`]}
                    onClear={() => formik.setFieldValue(`ivtDimension${index + 11}`, '')}
                    onChange={formik.handleChange}
                    error={!errored && formik.errors[`ivtDimension${index + 11}`]}
                    inputProps={{
                      readOnly:
                        errored || formik.values.ivtDimCount <= index + 10 || formik.values.ivtDimCount === 'null'
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

export default UserDefinedForm
