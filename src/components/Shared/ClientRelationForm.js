import React, { useEffect, useContext } from 'react'
import FormShell from './FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { useFormik } from 'formik'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { formatDateFromApi, formatDateToApi, formatDateToApiFunction } from 'src/lib/date-helper'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import * as yup from 'yup'

import { ResourceLookup } from './ResourceLookup'
import ResourceComboBox from './ResourceComboBox'
import CustomDatePicker from '../Inputs/CustomDatePicker'
import { Checkbox, FormControlLabel } from '@mui/material'
import { useForm } from 'src/hooks/form'

export const ClientRelationForm = ({ recordId, seqNo }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.ClientRelation
  })

  function getGridData(parentId) {
    var parameters = `_seqNo=${seqNo}`

    getRequest({
      extension: RTCLRepository.ClientRelation.get,
      parameters: parameters
    })
      .then(res => {
        const result = res.record
        formik.setValues({ relations: result })
      })
      .catch(error => {})
  }

  useEffect(() => {
    ;(async function () {
      if (seqNo && recordId)
        try {
          var parameters = `_seqNo=${seqNo}&_clientId=${recordId}`

          const res = await getRequest({
            extension: RTCLRepository.ClientRelation.get,
            parameters: parameters
          })

          const result = res.record
          formik.setValues({ result })
        } catch (e) {}
    })()
  }, [])

  const { formik } = useForm({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      clientId: yup.string().required(),
      rtId: yup.string().required(),
      expiryDate: yup.string().required(),
      activationDate: yup.string().required()
    }),
    initialValues: {
      seqNo: 0,
      parentId: recordId,
      clientId: '',
      clientName: '',
      clientRef: '',
      rtId: '',
      expiryDate: '',
      activationDate: ''
    },
    onSubmit: values => {
      post(values)
    }
  })

  const post = obj => {
    const data = {
      rtId: obj.rtId,
      parentId: recordId,
      clientId: obj.clientId,
      activationDate: formatDateToApi(obj.activationDate),
      expiryDate: formatDateToApi(obj.expiryDate),
      otp: 0,
      otpVerified: false
    }

    postRequest({
      extension: RTCLRepository.ClientRelation.set3,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success('Record Successfully')
      })
      .catch(error => {})
  }

  const editMode = false

  return (
    <FormShell form={formik} infoVisible={false}>
      <Grid container spacing={4} sx={{ p: 5 }}>
        <Grid item xs={12}>
          <ResourceLookup
            endpointId={CTCLRepository.CtClientIndividual.snapshot}
            parameters={{ _category: 1, _size: 30 }}
            name='clientId'
            label={_labels.clientRef}
            valueField='reference'
            displayField='name'
            valueShow='clientRef'
            secondValueShow='clientName'
            form={formik}
            onChange={(event, newValue) => {
              formik.setFieldValue('clientId', newValue ? newValue.recordId : 0)
              formik.setFieldValue('clientRef', newValue ? newValue.reference : '')
              formik.setFieldValue('clientName', newValue ? newValue.name : '')
            }}
            maxAccess={access}
            readOnly={editMode}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={CurrencyTradingSettingsRepository.RelationType.qry}
            parameters={{ _dgId: 0 }}
            name='rtId'
            label={_labels.relation}
            valueField='recordId'
            displayField={['reference', 'name']}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            maxAccess={access}
            required
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('rtId', newValue ? newValue.recordId : '')
            }}
            error={formik.touched.rtId && Boolean(formik.errors.rtId)}
            readOnly={editMode}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomDatePicker
            name='expiryDate'
            label={_labels.expiryDate}
            value={formik.values?.expiryDate}
            onChange={formik.setFieldValue}
            disabledDate={'>='}
            onClear={() => formik.setFieldValue('expiryDate', '')}
            error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
            maxAccess={access}
            readOnly={editMode}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomDatePicker
            name='activationDate'
            label={_labels.activationDate}
            value={formik.values?.activationDate}
            onChange={formik.setFieldValue}
            disabledDate={'>='}
            onClear={() => formik.setFieldValue('activationDate', '')}
            error={formik.touched.activationDate && Boolean(formik.errors.activationDate)}
            maxAccess={access}
            readOnly={editMode}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox name='otp' checked={formik.values?.otp} onChange={formik.handleChange} maxAccess={access} />
            }
            label={_labels.otp}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
