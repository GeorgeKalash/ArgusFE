import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import * as yup from 'yup'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const UserTextForm = ({ labels, maxAccess }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, updateSystemDefaults } = useContext(DefaultsContext)
  const [errored, setErrored] = useState(false)

  const counter = 20

  const { formik } = useForm({
    initialValues: {
      ivtUDTCount: '',
      ...Object.fromEntries(Array.from({ length: counter }, (_, i) => [`ivtUDT${i + 1}`, '']))
    },
    validateOnChange: true,
    validationSchema: yup.object({
      ivtUDTCount: yup.number().nullable().required().min(1).max(20),
      ...Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => i + 1).map(num => [
          `ivtUDT${num}`,
          yup
            .string()
            .nullable()
            .test(function (value) {
              const { ivtUDTCount } = this.parent

              return ivtUDTCount >= num ? !!value : true
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

    const filteredList = systemDefaults?.list?.filter(obj => {
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
    var dataToPost = [{ key: 'ivtUDTCount', value: obj.ivtUDTCount }]
    for (let i = 1; i <= 20; i++) {
      const dimKey = `ivtUDT${i}`
      if (obj[dimKey] !== undefined) {
        dataToPost.push({ key: dimKey, value: obj[dimKey] })
      }
    }
    await postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ sysDefaults: dataToPost })
    }).then(res => {
      toast.success(platformLabels.Updated)
      updateSystemDefaults(dataToPost)
    })
  }

  function clearExcessFields(currentCount) {
    for (let i = 1; i <= counter; i++) {
      const dimKey = `ivtUDT${i}`
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

    formik.setFieldValue('ivtUDTCount', value)

    clearExcessFields(value)
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2} xs={6}>
            <Grid item xs={12}>
              <CustomNumberField
                name='ivtUDTCount'
                label={labels.propertiesCount}
                value={formik.values.ivtUDTCount}
                onBlur={handleDimCountBlur}
                unClearable={true}
                maxLength={2}
                decimalScale={0}
                allowNegative={false}
                error={errored || (formik.touched.ivtUDTCount && Boolean(formik.errors.ivtUDTCount))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {Array.from({ length: 10 }).map((_, index) => (
                  <Grid item xs={12} key={index}>
                    <CustomTextField
                      key={index}
                      name={`ivtUDT${index + 1}`}
                      label={`${labels.property} ${index + 1}`}
                      value={formik.values[`ivtUDT${index + 1}`]}
                      onClear={() => formik.setFieldValue(`ivtUDT${index + 1}`, '')}
                      onChange={formik.handleChange}
                      error={
                        !errored && formik.values.ivtUDTCount > index && Boolean(formik.errors[`ivtUDT${index + 1}`])
                      }
                      inputProps={{
                        readOnly: errored || formik.values.ivtUDTCount <= index || formik.values.ivtUDTCount === 'null'
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
                      name={`ivtUDT${index + 11}`}
                      label={`${labels.property} ${index + 11}`}
                      value={formik.values[`ivtUDT${index + 11}`]}
                      onClear={() => formik.setFieldValue(`ivtUDT${index + 11}`, '')}
                      onChange={formik.handleChange}
                      error={!errored && formik.errors[`ivtUDT${index + 11}`]}
                      inputProps={{
                        readOnly:
                          errored || formik.values.ivtUDTCount <= index + 10 || formik.values.ivtUDTCount === 'null'
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default UserTextForm
