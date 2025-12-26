import React, { useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const ApproverForm = ({ labels, editMode, maxAccess, recordId, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { recordId: grId } = store

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.GroupCode.qry
  })

  const { formik } = useForm({
    initialValues: {
      codeId: '',
      groupId: grId
    },
    validationSchema: yup.object({
      codeId: yup.string().required()
    }),
    onSubmit: async values => {
      await postGroups(values)
    },
    validateOnChange: true,
    maxAccess
  })

  useEffect(() => {
    if (recordId) {
      getGroupId(recordId)
    }
  }, [recordId])

  const getGroupId = async () => {
    const res = await getRequest({
      extension: DocumentReleaseRepository.GroupCode.get,
      parameters: `_groupId=${recordId}`
    })
    formik.setValues({
      ...formik.values,
      codeId: res.record.codeId,
      groupId: res.record.groupId
    })
  }

  const postGroups = async obj => {
    const res = await postRequest({
      extension: DocumentReleaseRepository.GroupCode.set,
      record: JSON.stringify(obj)
    })
    toast.success('Record Successfully Updated')
    invalidate()
  }

  return (
    <FormShell form={formik} isInfo={false} resourceId={ResourceIds.DRGroups} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={DocumentReleaseRepository.ReleaseCode.qry}
                parameters={`_startAt=${0}&_pageSize=${100}`}
                name='codeId'
                label={labels.code}
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
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ApproverForm
