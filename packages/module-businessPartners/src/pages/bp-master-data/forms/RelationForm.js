import { Grid } from '@mui/material'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { BusinessPartnerRepository } from '@argus/repositories/src/repositories/BusinessPartnerRepository'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const RelationForm = ({ bpId, recordId, labels, maxAccess, getRelationGridData, window, editMode }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      toBPId: null,
      relationId: null,
      relationName: null,
      startDate: null,
      endDate: null,
      toBPName: null,
      toBPRef: null,
      fromBPId: bpId
    },
    validateOnChange: true,
    validationSchema: yup.object({
      toBPId: yup.string().required(),
      relationId: yup.string().required()
    }),
    onSubmit: async values => {
      await postRelation(values)
    }
  })

  const postRelation = async obj => {
    obj.startDate = obj.startDate ? formatDateToApi(obj.startDate) : ''
    obj.endDate = obj.endDate ? formatDateToApi(obj.endDate) : ''

    await postRequest({
      extension: BusinessPartnerRepository.Relation.set,
      record: JSON.stringify(obj)
    })
    if (!recordId) {
      toast.success(platformLabels.Added)
    } else {
      toast.success(platformLabels.Edited)
    }

    await getRelationGridData(bpId)
    window.close()
  }

  const getRelationById = async recordId => {
    const res = await getRequest({
      extension: BusinessPartnerRepository.Relation.get,
      parameters: `_recordId=${recordId}`
    })

    res.record.startDate = formatDateFromApi(res.record.startDate)
    res.record.endDate = formatDateFromApi(res.record.endDate)
    formik.setValues(res.record)
  }

  useEffect(() => {
    recordId && getRelationById(recordId)
  }, [recordId])

  return (
    <FormShell
      resourceId={ResourceIds.BPMasterData}
      form={formik}
      maxAccess={maxAccess}
      isInfo={false}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container gap={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={BusinessPartnerRepository.MasterData.snapshot}
                name='toBPId'
                label={labels.businessPartner}
                form={formik}
                required
                displayFieldWidth={2}
                valueField='recordId'
                displayField='reference'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                firstValue={formik.values.toBPRef}
                secondValue={formik.values.toBPName}
                onChange={(event, newValue) => {
                  formik.setFieldValue('toBPId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('toBPRef', newValue ? newValue.reference : '')
                  formik.setFieldValue('toBPName', newValue ? newValue.name : '')
                }}
                maxAccess={maxAccess}
                error={formik.touched.toBPId && Boolean(formik.errors.toBPId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={BusinessPartnerRepository.RelationTypes.qry}
                name='relationId'
                label={labels.relation}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                required
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('relationId', newValue?.recordId || '')
                }}
                error={formik.touched.relationId && Boolean(formik.errors.relationId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={labels.from}
                value={formik.values.startDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('startDate', '')}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={labels.to}
                value={formik.values.endDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('endDate', '')}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default RelationForm
