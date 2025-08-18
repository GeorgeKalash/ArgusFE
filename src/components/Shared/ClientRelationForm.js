import React, { useEffect, useContext } from 'react'
import FormShell from './FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { ResourceLookup } from './ResourceLookup'
import ResourceComboBox from './ResourceComboBox'
import CustomDatePicker from '../Inputs/CustomDatePicker'
import { useForm } from 'src/hooks/form'
import OTPPhoneVerification from './OTPPhoneVerification'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useWindow } from 'src/windows'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'
import CustomCheckBox from '../Inputs/CustomCheckBox'
import useSetWindow from 'src/hooks/useSetWindow'
import { ControlContext } from 'src/providers/ControlContext'

export const ClientRelationForm = ({ seqNo, clientId, formValidation, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.addClientRelation, window })

  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.ClientRelation,
    editMode: !!clientId
  })

  useEffect(() => {
    ;(async function () {
      if (seqNo && clientId) {
        var parameters = `_seqNo=${seqNo}&_clientId=${clientId}`

        const res = await getRequest({
          extension: RTCLRepository.ClientRelation.get,
          parameters: parameters
        })

        const result = res.record
        formik.setValues({
          ...result,
          activationDate: formatDateFromApi(result.activationDate),
          expiryDate: formatDateFromApi(result.expiryDate)
        })
      }
    })()
  }, [])

  const { formik } = useForm({
    maxAccess: access,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      parentId: yup.string().required(),
      rtId: yup.string().required(),
      expiryDate: yup.string().required(),
      activationDate: yup.string().required()
    }),
    initialValues: {
      seqNo: 0,
      parentId: '',
      clientId: clientId,
      parentName: '',
      parentRef: '',
      rtId: '',
      expiryDate: null,
      activationDate: new Date(),
      otp: 0,
      otpVerified: false
    },
    onSubmit: async values => {
      const data = {
        ...values,
        activationDate: formatDateToApi(values.activationDate),
        expiryDate: formatDateToApi(values.expiryDate)
      }

      await postRequest({
        extension: RTCLRepository.ClientRelation.set3,
        record: JSON.stringify(data)
      }).then(res => {
        stack({
          Component: OTPPhoneVerification,
          props: {
            clientId: formValidation.values.recordId,
            recordId: formValidation.values.recordId,
            values: formValidation.values,
            functionId: SystemFunction.ClientRelation,
            onSuccess: verified
          }
        })
        toast.success('Record Successfully')
      })
    }
  })

  const verified = () => {
    formik.setFieldValue('otpVerified', true)
  }

  const editMode = !!formik.values.seqNo

  return (
    <FormShell form={formik} infoVisible={false} isSaved={!editMode} isCleared={!editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2} xs={12}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CTCLRepository.CtClientIndividual.snapshot}
                parameters={{ _category: 1, _size: 30 }}
                name='parentId'
                label={_labels.clientRef}
                valueField='reference'
                displayField='name'
                displayFieldWidth={2}
                valueShow='parentRef'
                secondValueShow='parentName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('parentId', newValue ? newValue.recordId : 0)
                  formik.setFieldValue('parentRef', newValue ? newValue.reference : '')
                  formik.setFieldValue('parentName', newValue ? newValue.name : '')
                }}
                maxAccess={access}
                readOnly={editMode}
                required
                errorCheck='parentId'
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={CurrencyTradingSettingsRepository.RelationType.qry}
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
              {Boolean(formik.errors.expiryDate)}
              <CustomDatePicker
                name='expiryDate'
                label={_labels.expiryDate}
                value={formik.values?.expiryDate}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('expiryDate', '')}
                error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                maxAccess={access}
                readOnly={editMode}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='activationDate'
                label={_labels.activationDate}
                value={formik.values?.activationDate}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('activationDate', '')}
                error={formik.touched.activationDate && Boolean(formik.errors.activationDate)}
                maxAccess={access}
                readOnly={editMode}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='otp'
                value={formik.values?.otp}
                onChange={event => formik.setFieldValue('otp', event.target.checked)}
                label={_labels.otp}
                maxAccess={access}
                disabled={true}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

ClientRelationForm.width = 500
ClientRelationForm.height = 450
