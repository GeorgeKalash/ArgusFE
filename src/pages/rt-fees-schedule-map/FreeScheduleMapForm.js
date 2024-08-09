import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

import { SystemRepository } from 'src/repositories/SystemRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { DataSets } from 'src/resources/DataSets'

export default function FreeScheduleMapForm({ labels, maxAccess, recordId, record }) {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.FreeScheduleMap.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      corId: '',

      currencyId: '',
      countryId: '',
      dispersalMode: '',
      functionId: '',
      scheduleId: '',
      functionName: '',

      ...record
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      corId: yup.string().required(),
      currencyId: yup.string().required(),
      functionId: yup.string().required(),
      scheduleId: yup.string().required(),
      dispersalMode: yup.string().required(),
      countryId: yup.string().required()
    }),

    //   onSubmit: async obj => {
    //     const recordId = obj.recordId

    //     const response = await postRequest({
    //       extension: RemittanceOutwardsRepository.FreeScheduleMap.set,
    //       record: JSON.stringify(obj)
    //     })

    //     if (!recordId) {
    //       toast.success('Record Added Successfully')
    //       formik.setValues({
    //         ...obj,
    //         recordId: response.recordId
    //       })
    //     } else toast.success('Record Edited Successfully')
    //     setEditMode(true)

    //     invalidate()
    //   }
    // })

    onSubmit: async obj => {
      const currencyId = formik.values.currencyId
      const corId = formik.values.corId
      const dispersalMode = formik.values.dispersalMode
      const functionId = formik.values.functionId
      const countryId = formik.values.countryId

      await postRequest({
        extension: RemittanceOutwardsRepository.FreeScheduleMap.set,
        record: JSON.stringify(obj)
      })

      if (!currencyId && !corId && !dispersalMode && !functionId && !countryId) {
        toast.success('Record Added Successfully')
      } else toast.success('Record Edited Successfully')
      formik.setValues({
        ...obj,

        recordId:
          String(obj.currencyId * 1000) +
          String(obj.corId * 10000) +
          String(obj.dispersalMode * 10) +
          String(obj.functionId) +
          String(obj.countryId * 100)
      })

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId || !!recordId

  // useEffect(() => {
  //   ;(async function () {
  //     try {
  //       if (recordId) {
  //         const res = await getRequest({
  //           extension: RemittanceOutwardsRepository.FreeScheduleMap.get,
  //           parameters: `_recordId=${recordId}`
  //         })

  //         formik.setValues(res.record)
  //       }
  //     } catch (exception) {}
  //   })()
  // }, [])

  useEffect(() => {
    ;(async function () {
      try {
        if (record && record.currencyId && record.corId && record.functionId && record.scheduleId && record.countryId) {
          const res = await getRequest({
            extension: RemittanceOutwardsRepository.FreeScheduleMap.get,
            parameters: `_currencyId=${formik.values.currencyId}&_corId=${formik.values.corId}&_functionId=${formik.values.functionId}&_dispersalMode=${formik.values.dispersalMode}&_countryId=${formik.values.countryId}`
          })

          formik.setValues({
            ...res.record,

            recordId:
              String(res.record.currencyId * 1000) +
              String(res.record.corId * 10000) +
              String(res.record.dispersalMode * 10) +
              String(res.record.functionId) +
              String(res.record.countryId * 100)
          })
        }
      } catch (exception) {}
    })()
  }, [])

  console.log(formik.values.functionId)

  return (
    <FormShell resourceId={ResourceIds.FreeScheduleMap} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                valueField='reference'
                displayField='name'
                name='corId'
                label={labels.cor}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='corRef'
                secondValueShow='corName'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('corId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('corName', newValue ? newValue.name : '')
                  formik.setFieldValue('corRef', newValue ? newValue.reference : '')
                }}
                error={formik.touched.corId && Boolean(formik.errors.corId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                label={labels.country}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={false}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('countryId', newValue ? newValue.recordId : '')
                }}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                maxAccess={maxAccess}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                readOnly={false}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid item xs={12}>
                <ResourceComboBox
                  datasetId={DataSets.RT_Function}
                  name='functionId'
                  label={labels.function}
                  required
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  maxAccess={maxAccess}
                  onClear={() => formik.setFieldValue('functionId', '')}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('functionId', newValue?.key || '')
                    formik.setFieldValue('functionName', newValue?.value || '')
                  }}
                  error={formik.touched.functionId && Boolean(formik.errors.functionId)}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='dispersalMode'
                label={labels.dispersalMode}
                datasetId={DataSets.RT_Dispersal_Type}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('dispersalMode', newValue?.key)
                }}
                error={formik.touched.dispersalMode && Boolean(formik.errors.dispersalMode)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceOutwardsRepository.FreeSchedule.qry}
                parameters='_startAt=0&_pageSize=50&filter='
                name='scheduleId'
                label={labels.schedule}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                readOnly={false}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('scheduleId', newValue?.recordId || null)
                }}
                error={formik.touched.scheduleId && Boolean(formik.errors.scheduleId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
