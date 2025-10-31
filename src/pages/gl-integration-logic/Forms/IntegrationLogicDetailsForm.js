import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import Form from 'src/components/Shared/Form'

export default function IntegrationLogicDetailsForm({ ilId, recordId, labels, maxAccess, getGridData, window, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!store.recordId

  const { formik } = useForm({
    initialValues: {
      recordId,
      ilId,
      sign: '',
      tagId: null,
      integrationLevel: '',
      masterSource: '',
      postTypeId: null,
      description: '',
      costCenterSource: null
    },
    validateOnChange: true,
    validationSchema: yup.object({
      sign: yup.string().required(),
      tagId: yup.string().required(),
      integrationLevel: yup.string().required(),
      masterSource: yup.string().required(),
      postTypeId: yup.string().required()
    }),
    onSubmit: async obj => {
      const res2 = await fetchData()

      const updatedList = obj?.seqNo
        ? res2?.list?.map(item => (item?.seqNo === obj?.seqNo ? obj : item))
        : [...res2?.list, { ...obj, seqNo: res2?.list?.length > 0 ? res2.list[res2?.list?.length - 1]?.seqNo + 1 : 1 }]

      const dataToSave = {
        ilId,
        details: updatedList
      }

      const response = await postRequest({
        extension: GeneralLedgerRepository.IntegrationLogicDetails.set2,
        record: JSON.stringify(dataToSave)
      })

      !recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)

      await getGridData(response.recordId)
      window.close()
    }
  })

  async function fetchData() {
    if (!ilId) return

    return await getRequest({
      extension: GeneralLedgerRepository.IntegrationLogicDetails.qry,
      parameters: `_ilId=${ilId}`
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId && ilId) {
        const res = await getRequest({
          extension: GeneralLedgerRepository.IntegrationLogicDetails.get,
          parameters: `_seqNo=${recordId}&_ilId=${ilId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [recordId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={GeneralLedgerRepository.IntegrationPostTypes.snapshot}
                parameters={{
                  _type: 0
                }}
                required
                name='postTypeId'
                label={labels.postTypes}
                valueField='reference'
                displayField='name'
                valueShow='ptRef'
                secondValueShow='ptName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('postTypeId', newValue?.recordId || null)
                  formik.setFieldValue('ptRef', newValue?.reference || '')
                  formik.setFieldValue('ptName', newValue?.name || '')
                }}
                error={formik.touched.postTypeId && Boolean(formik.errors.postTypeId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.Sign}
                name='sign'
                label={labels.sign}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('sign', newValue?.key || null)
                }}
                error={formik.touched.sign && Boolean(formik.errors.sign)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.GLI_MASTER_SOURCE}
                name='masterSource'
                label={labels.masterSource}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('masterSource', newValue?.key || null)
                }}
                error={formik.touched.masterSource && Boolean(formik.errors.masterSource)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.GLI_TAG}
                name='tagId'
                label={labels.tag}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('tagId', newValue?.key || null)
                }}
                error={formik.touched.tagId && Boolean(formik.errors.tagId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.GLI_INTEGRATION_LEVEL}
                name='integrationLevel'
                label={labels.integrationLevel}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('integrationLevel', newValue?.key || null)
                }}
                error={formik.touched.integrationLevel && Boolean(formik.errors.integrationLevel)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.COST_CENTER}
                name='costCenterSource'
                label={labels.costCenterSource}
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                onChange={(event, newValue) => formik.setFieldValue('costCenterSource', newValue?.key || null)}
                error={formik.touched.costCenterSource && Boolean(formik.errors.costCenterSource)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='description'
                label={labels.description}
                value={formik.values.description}
                maxLength='100'
                rows={4}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('description', '')}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
