import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'

const AIForm = ({ labels, maxAccess, storeRecordId }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  async function getAIProvider() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.AI_PROVIDER,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  const { formik } = useForm({
    initialValues: {
      AI_provider_Id: null,
      AI_provider_Id_key: null,
      AI_API_KEY: null,
      AI_Model_Version: null
    },
    validationSchema: yup.object({
      AI_provider_Id: yup.string().required(),
      AI_API_KEY: yup.string().required(),
      AI_Model_Version: yup.string().required()
    }),
    onSubmit: async obj => {
      const aiFields = ['AI_provider_Id', 'AI_API_KEY', 'AI_Model_Version']
      await Promise.all(
        aiFields.map(field =>
          postRequest({
            extension: SystemRepository.UserDefaults.set,
            record: JSON.stringify({
              key: field,
              value: obj[field] != null ? String(obj[field]) : null,
              userId: storeRecordId
            })
          })
        )
      )

      toast.success(platformLabels.Updated)
    }
  })

  useEffect(() => {
    ;(async function () {
      if (storeRecordId) {
        const res = await getRequest({
          extension: SystemRepository.UserDefaults.qry,
          parameters: `_userId=${storeRecordId}`
        })

        const userDocObject = {
          AI_provider_Id: null,
          AI_provider_Id_key: null,
          AI_API_KEY: null,
          AI_Model_Version: null
        }

        res.list.forEach(x => {
          if (x.key in userDocObject) {
            userDocObject[x.key] = x.value || null
          }
        })

        const aiProvider = await getAIProvider()
        const provider = aiProvider?.find(
          x => x.value === userDocObject.AI_provider_Id
        )

        userDocObject.AI_provider_Id_key = provider?.key || null

        formik.setValues(userDocObject)
      }
    })()
  }, [storeRecordId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={!!storeRecordId}>
      <VertLayout>
        <Grow>
           <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                name='AI_provider_Id'
                label={labels.AIProvider}
                datasetId={DataSets.AI_PROVIDER}
                values={formik.values}
                valueField='value'
                displayField='value'
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('AI_provider_Id_key', newValue?.key || null)
                  formik.setFieldValue('AI_Model_Version', null)
                  
                  formik.setFieldValue('AI_provider_Id', newValue?.value || '')
                }}
                error={formik.touched.AI_provider_Id && Boolean(formik.errors.AI_provider_Id)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='AI_API_KEY'
                label={labels.apiKey}
                value={formik.values.AI_API_KEY}
                required
                maxAccess={maxAccess}
                maxLength='128'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('AI_API_KEY', '')}
                error={formik.touched.AI_API_KEY && Boolean(formik.errors.AI_API_KEY)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik?.values?.AI_provider_Id_key && AccessControlRepository.Provider.get}
                parameters={formik?.values?.AI_provider_Id_key && `_providerId=${formik.values.AI_provider_Id_key}`}
                name='AI_Model_Version'
                label={labels.modelVersion}
                valueField='value'
                displayField='value'
                values={formik.values}
                required
                readOnly={!formik.values.AI_provider_Id}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('AI_Model_Version', newValue?.value || '')}
                error={formik.touched.AI_Model_Version && Boolean(formik.errors.AI_Model_Version)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default AIForm
