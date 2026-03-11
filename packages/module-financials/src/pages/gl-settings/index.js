import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import * as yup from 'yup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const GLSettings = () => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, updateSystemDefaults } = useContext(DefaultsContext)

  useEffect(() => {
    getDataResult()
  }, [systemDefaults])

  const getDataResult = () => {
    const myObject = {}

    const filteredList = systemDefaults?.list?.filter(obj => {
      return (
        obj.key === 'GLACSegments' ||
        obj.key === 'GLACSeg0' ||
        obj.key === 'GLACSeg1' ||
        obj.key === 'GLACSeg2' ||
        obj.key === 'GLACSeg3' ||
        obj.key === 'GLACSeg4' ||
        obj.key === 'GLACSegName0' ||
        obj.key === 'GLACSegName1' ||
        obj.key === 'GLACSegName2' ||
        obj.key === 'GLACSegName3' ||
        obj.key === 'GLACSegName4'
      )
    })
    const numericKeys = ['GLACSegments', 'GLACSeg0', 'GLACSeg1', 'GLACSeg2', 'GLACSeg3', 'GLACSeg4']

    filteredList?.forEach(obj => {
      myObject[obj.key] = numericKeys.includes(obj.key) ? Number(obj?.value) || null : obj.value
    })

    formik.setValues(myObject)
  }

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.GLSettings
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      GLACSegments: null,
      GLACSeg0: null,
      GLACSeg1: null,
      GLACSeg2: null,
      GLACSeg3: null,
      GLACSeg4: null,
      GLACSegName0: '',
      GLACSegName1: '',
      GLACSegName2: '',
      GLACSegName3: '',
      GLACSegName4: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      GLACSegments: yup.number().nullable().required().min(2).max(5),
      GLACSeg0: yup.number().nullable().required().min(1).max(8),
      GLACSegName0: yup.string().nullable().required(),
      GLACSeg1: yup.number().nullable().required().min(1).max(8),
      GLACSegName1: yup.string().nullable().required(),
      GLACSeg2: yup
        .number()
        .nullable()
        .min(1)
        .max(8)
        .test(function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 3 ? value != null && value >= 1 && value <= 8 : true
        }),
      GLACSegName2: yup
        .string()
        .nullable()
        .test(function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 3 ? value != null && value.trim() !== '' : true
        }),
      GLACSeg3: yup
        .number()
        .nullable()
        .min(1)
        .max(8)
        .test(function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 4 ? value != null && value >= 1 && value <= 8 : true
        }),
      GLACSegName3: yup
        .string()
        .nullable()
        .test(function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 4 ? value != null && value.trim() !== '' : true
        }),
      GLACSeg4: yup
        .number()
        .nullable()
        .min(1)
        .max(8)
        .test(function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 5 ? value != null && value >= 1 && value <= 8 : true
        }),
      GLACSegName4: yup
        .string()
        .nullable()
        .test(function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 5 ? value != null && value.trim() !== '' : true
        })
    }),

    onSubmit: async values => {
      await postGLSettings(values)
    }
  })

  const postGLSettings = async obj => {
    var dataToPost = []

    dataToPost.push({ key: 'GLACSegments', value: obj.GLACSegments })
    for (let i = 0; i < 5; i++) {
      const segKey = `GLACSeg${i}`
      const nameKey = `GLACSegName${i}`

      if (obj[segKey] !== undefined) {
        dataToPost.push({ key: segKey, value: obj[segKey] })
      }
      if (obj[nameKey] !== undefined) {
        dataToPost.push({ key: nameKey, value: obj[nameKey] })
      }
    }
    await postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ sysDefaults: dataToPost })
    }).then(res => {
      toast.success(platformLabels.Edited)
      updateSystemDefaults(dataToPost)
    })
  }

  const segNumb = ['GLACSeg0', 'GLACSeg1', 'GLACSeg2', 'GLACSeg3', 'GLACSeg4']

  const segName = ['GLACSegName0', 'GLACSegName1', 'GLACSegName2', 'GLACSegName3', 'GLACSegName4']

  const onChangeGLACSegments = value => {
    if (value >= 2) {
      formik.setValues(prev => {
        const next = { ...prev, GLACSegments: value }

        segNumb.forEach((key, idx) => {
          next[key] = idx < value && !(prev[key] === '' || prev[key] == null) ? Number(prev[key]) : null
        })

        segName.forEach((key, idx) => {
          next[key] = idx < value ? prev[key] ?? '' : ''
        })

        return next
      })
    } else {
      formik.setFieldValue('GLACSegments', value)
    }
  }

  const rows = [0, 1, 2, 3, 4]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomNumberField
                name='GLACSegments'
                label={labels.segments}
                value={formik.values.GLACSegments}
                onChange={(_, value) => onChangeGLACSegments(value)}
                onClear={() => formik.setFieldValue('GLACSegments', null)}
                min={2}
                max={5}
                arrow
                error={Boolean(formik.errors.GLACSegments)}
                maxAccess={access}
              />
            </Grid>

            {rows.map(idx => {
              const segKey = `GLACSeg${idx}`
              const nameKey = `GLACSegName${idx}`
              const isActive = (formik.values.GLACSegments ?? 0) > idx

              return (
                <Grid key={idx} container item xs={12} columnSpacing={2} rowSpacing={1} alignItems='flex-start'>
                  <Grid item xs={12} lg={6}>
                    <CustomNumberField
                      name={segKey}
                      label={labels['segment' + idx]}
                      value={formik.values[segKey]}
                      onClear={() => formik.setFieldValue(segKey, null)}
                      numberField
                      onChange={(_, value) => formik.setFieldValue(segKey, value)}
                      error={isActive && Boolean(formik.errors[segKey])}
                      readOnly={!isActive}
                      min={1}
                      max={8}
                      arrow
                      maxAccess={access}
                    />
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <CustomTextField
                      name={nameKey}
                      label={labels['segName' + idx]}
                      value={formik.values?.[nameKey] || ''}
                      onClear={() => formik.setFieldValue(nameKey, '')}
                      onChange={formik.handleChange}
                      error={isActive && Boolean(formik.errors[nameKey])}
                      readOnly={!isActive}
                      maxLength={20}
                      maxAccess={access}
                    />
                  </Grid>
                </Grid>
              )
            })}
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default GLSettings
