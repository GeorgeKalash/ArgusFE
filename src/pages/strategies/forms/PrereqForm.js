import { useState, useContext } from 'react'
import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'

import { useEffect } from 'react'

import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const PreReqsForm = ({ labels, editMode, maxAccess, recordId, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  const [selectedCodeId, setSelectedCodeId] = useState('')

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.StrategyPrereq.qry
  })

  const { recordId: stgId } = store

  const validationSchema = yup.object({
    codeId: yup.number().required(' '),
    prerequisiteId: yup.number().required(' ')
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: { codeId: '', prerequisiteId: '', StrategyId: stgId },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema,
    onSubmit: values => {
      postPreReq(values)
    }
  })

  const postPreReq = async obj => {
    const isNewRecord = !obj?.codeId

    try {
      const res = await postRequest({
        extension: DocumentReleaseRepository.StrategyPrereq.set,
        record: JSON.stringify(obj)
      })

      if (isNewRecord) {
        toast.success('Record Added Successfully')
      } else {
        toast.success('Record Edited Successfully')
      }
      invalidate()
    } catch (error) {
      toast.error('An error occurred')
    }
  }
  useEffect(() => {
    recordId && getCodeId(recordId)
  }, [recordId])

  const excludeSelectedCode = item => item.codeId !== selectedCodeId

  const getCodeId = codeId => {
    const defaultParams = `_codeId=${codeId}&_groupId=${stgId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.StrategyCode.get,
      parameters: `_groupId=${recordId}`
    })
      .then(res => {
        formik.setValues(res.record)
      })
      .catch(error => {})
  }

  return (
    <FormShell
      form={formik}
      infoVisible={false}
      resourceId={ResourceIds.Strategies}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={DocumentReleaseRepository.StrategyCode.qry}
                parameters={`_startAt=${0}&_pageSize=${100}&_strategyId=${stgId}`}
                name='codeId'
                label={labels.code}
                valueField='codeId'
                displayField='code'
                values={formik.values}
                required
                readOnly={editMode}
                onClear={() => {
                  formik.setFieldValue('codeId', '')
                  formik.setFieldTouched('codeId', false)
                }}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  const newCodeId = newValue ? newValue.codeId : ''
                  formik.setFieldValue('codeId', newCodeId)
                  setSelectedCodeId(newCodeId)
                }}
                error={formik.touched.codeId && Boolean(formik.errors.codeId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik.values.codeId && DocumentReleaseRepository.StrategyCode.qry}
                parameters={formik.values.codeId && `_strategyId=${stgId}`}
                name='prerequisiteId'
                label={labels.prere}
                valueField='codeId'
                displayField='code'
                values={formik.values}
                readOnly={editMode}
                maxAccess={maxAccess}
                filter={excludeSelectedCode}
                onClear={() => {
                  formik.setFieldValue('prerequisiteId', '')
                  formik.setFieldTouched('prerequisiteId', false)
                }}
                onChange={(event, newValue) => {
                  const newPrerequisiteId = newValue ? newValue.codeId : ''
                  formik.setFieldValue('prerequisiteId', newPrerequisiteId)
                }}
                error={formik.touched.prerequisiteId && Boolean(formik.errors.prerequisiteId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default PreReqsForm
