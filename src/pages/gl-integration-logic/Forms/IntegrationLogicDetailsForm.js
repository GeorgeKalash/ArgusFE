import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function IntegrationLogicDetailsForm({ ilId, recordId, labels, maxAccess, getGridData, window, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!store.recordId

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      ilId,
      sign: '',
      tagId: '',
      integrationLevel: '',
      masterSource: '',
      postTypeId: '',
      description: '',
      isCostElement: false
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      sign: yup.string().required(),
      tagId: yup.string().required(),
      integrationLevel: yup.string().required(),
      masterSource: yup.string().required(),
      postTypeId: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const res2 = await fetchData()

        const updatedList = obj?.seqNo
          ? res2?.list?.map(item => (item?.seqNo === obj?.seqNo ? obj : item))
          : [
              ...res2?.list,
              { ...obj, seqNo: res2?.list?.length > 0 ? res2.list[res2?.list?.length - 1]?.seqNo + 1 : 1 }
            ]

        const dataToSave = {
          ilId,
          details: updatedList
        }

        const response = await postRequest({
          extension: GeneralLedgerRepository.IntegrationLogicDetails.set2,
          record: JSON.stringify(dataToSave)
        })

        !recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)

        formik.setFieldValue('recordId', response.recordId)
        await getGridData(ilId)
        window.close()
      } catch (error) {}
    }
  })

  async function fetchData() {
    try {
      if (ilId) {
        const response = await getRequest({
          extension: GeneralLedgerRepository.IntegrationLogicDetails.qry,
          parameters: `_ilId=${ilId}`
        })

        return response
      }
    } catch (error) {}
  }

  const getIntegrationLogicById = async recordId => {
    try {
      const res = await getRequest({
        extension: GeneralLedgerRepository.IntegrationLogicDetails.get,
        parameters: `_seqNo=${recordId}&_ilId=${ilId}`
      })

      formik.setValues(res.record)
    } catch (error) {}
  }

  useEffect(() => {
    console.log(recordId, 'recordId')
    if (recordId) {
      console.log(recordId, 'recordId')
      getIntegrationLogicById(recordId)
    }
  }, [recordId])

  return (
    <FormShell
      resourceId={ResourceIds.IntegrationLogics}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
      isInfo={false}
    >
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
                  formik.setFieldValue('postTypeId', newValue?.recordId || '')
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
                  formik && formik.setFieldValue('sign', newValue ? newValue.key : '')
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
                  formik && formik.setFieldValue('masterSource', newValue ? newValue.key : '')
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
                  formik && formik.setFieldValue('tagId', newValue ? newValue.key : '')
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
                  formik && formik.setFieldValue('integrationLevel', newValue ? newValue.key : '')
                }}
                error={formik.touched.integrationLevel && Boolean(formik.errors.integrationLevel)}
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
            <Grid item xs={12}>
              <CustomCheckBox
                name='isCostElement'
                value={formik.values?.isCostElement}
                onChange={event => formik.setFieldValue('isCostElement', event.target.checked)}
                label={labels.isCostElement}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
