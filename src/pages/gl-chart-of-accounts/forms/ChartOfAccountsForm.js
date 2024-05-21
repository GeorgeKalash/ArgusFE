import { Grid, FormControlLabel, Checkbox, Box, TextField } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import SegmentedInput from 'src/components/Shared/SegmentInput'

export default function ChartOfAccountsForm({ labels, maxAccess, recordId }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const [segments, setSegments] = useState([])

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.ChartOfAccounts.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      accountRef: '',
      name: '',
      description: '',
      groupId: '',
      isCostElement: false,
      sign: '',
      activeStatus: ''
    },
    maxAccess: maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      activeStatus: yup.string().required(' '),
      description: yup.string().required(' '),
      accountRef: yup
        .string()
        .required(' ')
        .matches(/^(?=.*\d)[\d_-]+$/)
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true)

      const payload = {
        ...values,
        segments: values.accountRef.split('-')
      }
      try {
        const response = await postRequest({
          extension: GeneralLedgerRepository.ChartOfAccounts.set,
          record: JSON.stringify(payload)
        })
        toast.success(`Record ${values.recordId ? 'Edited' : 'Added'} Successfully`)

        setEditMode(true)
        invalidate()
      } catch (error) {
      } finally {
        setSubmitting(false)
      }
    }
  })

  useEffect(() => {
    if (recordId) {
      getRequest({
        extension: GeneralLedgerRepository.ChartOfAccounts.get,
        parameters: `_recordId=${recordId}`
      })
        .then(res => {
          formik.setValues(res.record)
          setSegments(
            res.record.accountRef.split('-').map((seg, index) => ({
              key: `GLACSeg${index}`,
              value: seg.length
            }))
          )
        })
        .catch(error => {})
    } else {
      getSegmentsValues()
    }
  }, [recordId])

  const getSegmentsValues = () => {
    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: '_filter='
    })
      .then(res => {
        const defaultSegments = res.list
          .filter(obj => ['GLACSeg0', 'GLACSeg1', 'GLACSeg2', 'GLACSeg3', 'GLACSeg4'].includes(obj.key))
          .map(obj => ({
            key: obj.key,
            value: parseInt(obj.value)
          }))
          .filter(obj => obj.value)

        setSegments(defaultSegments)
      })
      .catch(error => {})
  }

  return (
    <FormShell resourceId={ResourceIds.ChartOfAccounts} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={GeneralLedgerRepository.GLAccountGroups.qry}
            name='groupId'
            label={labels.group}
            columnsInDropDown={[{ key: 'name', value: 'Name' }]}
            values={formik.values}
            valueField='recordId'
            displayField={['name']}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik && formik.setFieldValue('groupId', newValue?.recordId)
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <SegmentedInput
            segments={segments}
            readOnly={editMode}
            name='accountRef'
            setFieldValue={formik.setFieldValue}
            values={formik.values.accountRef}
            label={labels.accountRef}
            required
            error={formik.touched.accountRef && Boolean(formik.errors.accountRef)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            readOnly={editMode}
            required
            rows={2}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='description'
            label={labels.description}
            value={formik.values.description}
            required
            rows={2}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('description', '')}
            error={formik.touched.description && Boolean(formik.errors.description)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            name='activeStatus'
            label={labels.status}
            required
            datasetId={DataSets.ACTIVE_STATUS}
            values={formik.values}
            valueField='key'
            displayField='value'
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('activeStatus', newValue?.key)
              } else {
                formik.setFieldValue('activeStatus', newValue?.key)
              }
            }}
            error={formik.touched.activeStatus && Boolean(formik.errors.activeStatus)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            name='sign'
            label={labels.creditDebit}
            datasetId={DataSets.Sign}
            values={formik.values}
            valueField='key'
            displayField='value'
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('sign', newValue?.key)
              } else {
                formik.setFieldValue('sign', newValue?.key)
              }
            }}
            error={formik.touched.sign && Boolean(formik.errors.sign)}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name='isCostElement'
                maxAccess={maxAccess}
                checked={formik.values?.isCostElement}
                onChange={formik.handleChange}
              />
            }
            label={labels.isCostElement}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
