import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import styles from 'styles/phoneVerification.module.css'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import React, { createRef } from 'react'

const SegmentedInput = ({ segments, name, setFieldValue, values }) => {
  const inputRefs = segments.map(() => createRef())

  const handleChange = (index, event) => {
    const newValues = [...values]
    newValues[index] = event.target.value.slice(0, segments[index].value)
    setFieldValue('segments', newValues)

    const finalInput = newValues.join('-')
    setFieldValue(name, finalInput)

    if (event.target.value.length >= segments[index].value && index < segments.length - 1) {
      inputRefs[index + 1].current.focus()
    }
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      if (!values[index] || values[index].length === 0) {
        event.preventDefault()
        if (index > 0) {
          const previousIndex = index - 1
          const previousValue = values[previousIndex]

          if (previousValue && previousValue.length > 0) {
            const input = inputRefs[previousIndex].current
            input.focus()
            const len = input.value.length
            input.setSelectionRange(len, len)
          }
        }
      }
    }
  }

  return (
    <div>
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          <input
            className={styles.inputText}
            ref={inputRefs[index]}
            value={values[index] || ''}
            onChange={e => handleChange(index, e)}
            onKeyDown={e => handleKeyDown(index, e)}
            maxLength={segment.value}
          />
          {index !== segments.length - 1 && '-'}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function ChartOfAccountsForm({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.ChartOfAccounts.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      accountRef: '',
      name: '',
      description: '',
      groupId: '',
      isCostElement: false,
      sign: '',
      groupName: '',
      activeStatus: '',
      activeStatusName: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      description: yup.string().required(' ')
    }),
    onSubmit: async values => {
      values.isCostElement = !!values.isCostElement

      const response = await postRequest({
        extension: GeneralLedgerRepository.ChartOfAccounts.set,
        record: JSON.stringify(values)
      })

      if (!values.recordId) {
        toast.success('Record Added Successfully')
        formik.setValues({
          ...values,
          recordId: response.recordId
        })
      } else {
        toast.success('Record Edited Successfully')
      }
      setEditMode(true)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        getDataResult()
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: GeneralLedgerRepository.ChartOfAccounts.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const [segments, setSegments] = useState([])

  const getDataResult = () => {
    const parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: parameters
    })
      .then(res => {
        const filteredList = res.list
          .filter(obj => {
            return (
              obj.key === 'GLACSeg0' ||
              obj.key === 'GLACSeg1' ||
              obj.key === 'GLACSeg2' ||
              obj.key === 'GLACSeg3' ||
              obj.key === 'GLACSeg4'
            )
          })
          .map(obj => {
            obj.value = parseInt(obj.value)

            return obj
          })
          .filter(obj => obj.value)

        setSegments(filteredList)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  return (
    <FormShell resourceId={ResourceIds.ChartOfAccounts} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
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
                  formik.setFieldValue('groupId', newValue?.recordId)
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <SegmentedInput
                segments={segments}
                name='accountRef'
                setFieldValue={formik.setFieldValue}
                values={formik.values.accountRef.split('-')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
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
                datasetId={DataSets.ACTIVE_STATUS}
                values={formik.values}
                valueField='key'
                displayField='value'
                onChange={(event, newValue) => {
                  formik.setFieldValue('activeStatus', newValue?.key)
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
                  formik.setFieldValue('sign', newValue?.key)
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
                    checked={formik.values.isCostElement}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.isCostElement}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
