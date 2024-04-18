import { useState, useContext } from 'react'
import { useFormik } from 'formik'
import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'

import { useEffect } from 'react'

import * as yup from 'yup'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

import toast from 'react-hot-toast'

const CodeForm = ({ labels, editMode, maxAccess, setEditMode, recordId, store, setRefresh, strategiesFormik }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  const { recordId: grId } = store

  const [initialValues, setInitialData] = useState({
    codeId: '',
    groupId: strategiesFormik.values.groupId,
    strategyId: grId
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,

    initialValues,
    validationSchema: yup.object({
      codeId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postGroups(values)
    }
  })

  const postGroups = async obj => {
    const isNewRecord = !obj?.codeId

    try {
      const res = await postRequest({
        extension: DocumentReleaseRepository.StrategyCode.set,
        record: JSON.stringify(obj)
      })

      if (isNewRecord) {
        toast.success('Record Added Successfully')
        setInitialData(prevData => ({
          ...prevData,
          ...obj
        }))
        setEditMode(true)
      } else {
        toast.success('Record Edited Successfully')

        setInitialData(prevData => ({
          ...prevData,

          ...obj
        }))
      }
      setRefresh(prev => !prev)
    } catch (error) {
      toast.error('An error occurred')
    }
  }
  useEffect(() => {
    recordId && getGroupId(recordId)
  }, [recordId])

  const getGroupId = codeId => {
    const defaultParams = `_codeId=${codeId}&_groupId=${strategiesFormik.values.groupId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.GroupCode.qry,
      parameters: `_groupId=${strategiesFormik.values.groupId}`
    })
      .then(res => {
        setInitialData(res.record)
        setEditMode(true)
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
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={DocumentReleaseRepository.GroupCode.qry}
            parameters={`_groupId=${strategiesFormik.values.groupId}`}
            name='codeId'
            label={labels.code}
            valueField='codeId'
            displayField='codeRef'
            columnsInDropDown={[
              { key: 'codeRef', value: 'Reference' },
              { key: 'codeName', value: 'Name' }
            ]}
            values={formik.values}
            required
            readOnly={editMode}
            maxAccess={maxAccess}
            onClear={() => formik.setFieldValue('codeId', '')}
            onChange={(event, newValue) => {
              formik.setFieldValue('codeId', newValue?.codeId)
            }}
            error={formik.touched.codeId && Boolean(formik.errors.codeId)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default CodeForm
