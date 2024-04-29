// ** MUI Imports
import { Grid, FormControlLabel, Checkbox, Box, TextField } from '@mui/material'
import { InputAdornment } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import InputMask from 'react-input-mask'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'

import { SystemRepository } from 'src/repositories/SystemRepository'

export default function ChartOfAccountsForm({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    accountRef: '',
    name: '',
    description: '',
    groupId: '',
    isCostElement: false,
    sign: '',
    groupName: '',
    activeStatus: '',
    activeStatusName: ''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  //const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.ChartOfAccounts.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      description: yup.string().required(' '),
      accountRef: yup.string().required()
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true)

      values.isCostElement = !!values.isCostElement

      const segments = values.accountRef.split('-')

      try {
        const payload = {
          ...values,
          segments: segments
        }

        const response = await postRequest({
          extension: GeneralLedgerRepository.ChartOfAccounts.set,
          record: JSON.stringify(payload)
        })

        if (!values.recordId) {
          toast.success('Record Added Successfully')
          setInitialData({
            ...values,
            recordId: response.recordId
          })
        } else {
          toast.success('Record Edited Successfully')
        }
        setEditMode(true)
        invalidate()
      } catch (error) {
      } finally {
        setSubmitting(false)
      }
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

          setInitialData(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
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
    <FormShell
      resourceId={ResourceIds.ChartOfAccounts}
      form={formik}
      height={300}
      maxAccess={maxAccess}
      editMode={editMode}
    >
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
            name='accountRef'
            setFieldValue={formik.setFieldValue}
            values={formik.values.accountRef}
            label='Account Reference'
            required
            error={formik.touched.accountRef && Boolean(formik.errors.accountRef)}
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

import React, { createRef } from 'react'

import { FormControl, InputLabel, OutlinedInput, FormHelperText, styled } from '@mui/material'

const SegmentedInput = ({ segments, name, setFieldValue, values, label, error, helperText, required }) => {
  const handleInputChange = event => {
    const { value } = event.target
    setFieldValue(name, value)
  }

  const createMask = () => {
    let mask = ''
    segments.forEach(segment => {
      mask += '*'.repeat(segment.value) + '-'
    })

    return mask.slice(0, -1)
  }

  const mask = createMask()

  return (
    <FormControl variant='outlined' fullWidth error={error} size='small' required={required}>
      <InputLabel htmlFor={name} size='small'>
        {label}
      </InputLabel>
      <OutlinedInput
        id={name}
        value={values}
        onChange={handleInputChange}
        label={label}
        notched={false}
        inputComponent={InputMask}
        inputProps={{
          mask: mask,
          alwaysShowMask: true,
          guide: false
        }}
        required={required}
      />
      {error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
