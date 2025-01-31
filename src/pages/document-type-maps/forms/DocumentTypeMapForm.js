import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function DocumentTypeMapForm({ labels, maxAccess, recordId, record }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.DocumentTypeMap.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      fromFunctionId: '',
      fromDTId: '',
      toFunctionId: '',
      decimals: '',
      profileId: '',
      currencyType: '',
      currencyTypeName: '',
      sale: false,
      useSameReference: false,
      dtId: '',
      symbol: '',
      fromFunctionName: '',
      toFunctionName: '',
      fromDTName: '',
      ...record
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      fromFunctionId: yup.string().required(' '),
      fromDTId: yup.string().required(' '),
      toFunctionId: yup.string().required(' '),
      dtId: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const fromFunctionId = formik.values.fromFunctionId
      const fromDTId = formik.values.fromDTId
      const toFunctionId = formik.values.toFunctionId

      const response = await postRequest({
        extension: SystemRepository.DocumentTypeMap.set,
        record: JSON.stringify(obj)
      })

      if (!fromFunctionId && !fromDTId && !toFunctionId) {
        toast.success('Record Added Successfully')
        setEditMode(false)
      } else toast.success('Record Edited Successfully')
      setEditMode(true)
      formik.setValues({
        ...obj,
        recordId: String(obj.fromFunctionId) + String(obj.fromDTId) + String(obj.toFunctionId)
      })

      invalidate()
    }
  })
  useEffect(() => {
    ;(async function () {
      try {
        if (record && record.fromFunctionId && record.fromDTId && record.toFunctionId) {
          setEditMode(true)

          const res = await getRequest({
            extension: SystemRepository.DocumentTypeMap.get,
            parameters: `_fromFunctionId=${fromFunctionId}&_fromDTId=${fromDTId}&_toFunctionId=${toFunctionId}`
          })

          formik.setValues({
            ...res.record,
            recordId: String(res.record.fromFunctionId) + String(res.record.fromDTId) + String(res.record.toFunctionId)
          })
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.DocumentTypeMaps} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4} sx={{ px: 4, pt: 2 }}>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.SYSTEM_FUNCTION}
                name='fromFunctionId'
                label={labels.fromFunction}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik && formik.setFieldValue('fromFunctionId', newValue?.key)
                    formik && formik.setFieldValue('fromFunctionName', newValue?.value)
                  } else {
                    formik && formik.setFieldValue('fromFunctionId', '')
                    formik && formik.setFieldValue('fromFunctionName', '')
                  }
                  formik && formik.setFieldValue('fromDTId', '')
                }}
                error={formik.touched.fromFunctionId && Boolean(formik.errors.fromFunctionId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik.values.fromFunctionId && SystemRepository.DocumentType.qry}
                name='fromDTId'
                label={labels.fromDocument}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                parameters={
                  formik.values.fromFunctionId &&
                  (formik.values.fromFunctionId
                    ? `_dgId=${formik.values.fromFunctionId}&_startAt=${0}&_pageSize=${50}`
                    : `_dgId=0&_startAt=${0}&_pageSize=${50}`)
                }
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('fromDTId', newValue?.recordId)
                }}
                error={formik.touched.fromDTId && Boolean(formik.errors.fromDTId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.SYSTEM_FUNCTION}
                name='toFunctionId'
                label={labels.toFunction}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik && formik.setFieldValue('toFunctionId', newValue?.key)
                    formik && formik.setFieldValue('toFunctionName', newValue?.value)
                  } else {
                    formik && formik.setFieldValue('toFunctionId', '')
                    formik && formik.setFieldValue('toFunctionName', '')
                  }
                  formik && formik.setFieldValue('dtId', '')
                }}
                error={formik.touched.toFunctionId && Boolean(formik.errors.toFunctionId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik.values.toFunctionId && SystemRepository.DocumentType.qry}
                name='dtId'
                label={labels.toDocument}
                valueField='recordId'
                displayField='reference'
                maxAccess={maxAccess}
                values={formik.values}
                parameters={
                  formik.values.toFunctionId &&
                  (formik.values.toFunctionId
                    ? `_dgId=${formik.values.toFunctionId}&_startAt=${0}&_pageSize=${50}`
                    : `_dgId=0&_startAt=${0}&_pageSize=${50}`)
                }
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='useSameReference'
                value={formik.values?.useSameReference}
                onChange={event => formik.setFieldValue('useSameReference', event.target.checked)}
                label={labels.useSameRef}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
