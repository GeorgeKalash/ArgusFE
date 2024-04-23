import React, { useContext, useEffect } from 'react'
import { useFormik } from 'formik'
import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'

const ApproverForm = ({ labels, editMode, maxAccess, setEditMode, recordId, store, setRefresh }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { recordId: grId } = store

  const { formik } = useForm({
    initialValues: {
      codeId: '',
      groupId: grId
    },
    validationSchema: yup.object({
      codeId: yup.string().required()
    }),
    onSubmit: values => {
      postGroups(values)
    },
    validateOnChange: true,
    enableReinitialize: true,
    maxAccess
  })

  useEffect(() => {
    if (recordId) {
      getGroupId(recordId)
    }
  }, [recordId])

  const getGroupId = async codeId => {
    const defaultParams = `_codeId=${codeId}&_groupId=${grId}`
    try {
      const res = await getRequest({
        extension: DocumentReleaseRepository.GroupCode.get,
        parameters: `_groupId=${recordId}`
      })
      formik.setValues({
        ...formik.values,
        codeId: res.record.codeId,
        groupId: res.record.groupId
      })
      setEditMode(true)
    } catch {}
  }

  const postGroups = async obj => {
    try {
      const res = await postRequest({
        extension: DocumentReleaseRepository.GroupCode.set,
        record: JSON.stringify(obj)
      })
      toast.success('Record Successfully Updated')
      setRefresh(prev => !prev)
    } catch {}
  }

  return (
    <FormShell
      form={formik}
      infoVisible={false}
      resourceId={ResourceIds.DRGroups}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={DocumentReleaseRepository.ReleaseCode.qry}
            parameters={`_startAt=${0}&_pageSize=${100}`}
            name='codeId'
            label={'codeId'}
            valueField='recordId'
            displayField='name'
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            required
            readOnly={editMode}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('codeId', newValue?.recordId)
            }}
            error={formik.touched.codeId && Boolean(formik.errors.codeId)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default ApproverForm
