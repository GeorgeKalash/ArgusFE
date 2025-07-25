import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import * as yup from 'yup'
import { FixedAssetsRepository } from 'src/repositories/FixedAssetsRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useForm } from 'src/hooks/form'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useInvalidate } from 'src/hooks/resource'

export default function AssetsForm({ recordId, maxAccess: access, labels, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.AssetsDepreciation,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: FixedAssetsRepository.AssetsDescription.snapshot
  })

  const formatDate = date => {
    const d = date
    const month = d?.getMonth() + 1
    const day = d?.getDate()
    const year = d?.getFullYear()

    return `${month}-${day}-${year}`
  }

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: null,
      reference: '',
      date: new Date(),
      notes: '',
      status: 1,
      dtId: null,
      plantId: '',
      asset: []
    },
    validateOnChange: true,
    validationSchema: yup.object({}),
    onSubmit: async obj => {
      const { asset, ...rest } = obj

      const formattedObj = {
        ...rest,
        date: formatDateToApi(obj.date)
      }

      const response = await postRequest({
        extension: FixedAssetsRepository.AssetsDescription.set2,
        record: JSON.stringify({ header: formattedObj, items: formik.values.asset.list || [] })
      })

      if (!recordId) {
        toast.success(platformLabels.Added)

        getData(response.recordId)
      } else toast.success(platformLabels.Edited)
      invalidate()
    }
  })
  async function fetchData() {
    const response = await getRequest({
      extension: FixedAssetsRepository.AssetsDescription.preview,
      parameters: `_asOfDate=${formatDate(formik.values.date)}`
    })
    formik.setFieldValue('asset', response)
  }

  const editMode = !!formik.values.recordId

  const onPost = async () => {
    await postRequest({
      extension: FixedAssetsRepository.AssetsDescription.post,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Posted)
    window.close()
    invalidate()
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await getData(recordId)

        const res2 = await getRequest({
          extension: FixedAssetsRepository.AssetsTableData.qry,
          parameters: `_depId=${recordId}`
        })

        formik.setFieldValue('asset', res2)
      }
    })()
  }, [])

  const getData = async recordId => {
    try {
      if (recordId) {
        const res = await getRequest({
          extension: FixedAssetsRepository.AssetsDescription.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res.record.date)
        })
      }
    } catch (exception) {}
  }

  const columns = [
    {
      field: 'assetRef',
      headerName: labels.asset,
      flex: 1
    },
    {
      field: 'assetName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'ccName',
      headerName: labels.costCenter,
      flex: 1
    },
    {
      field: 'period',
      headerName: labels.days,
      flex: 1,
      type: 'number'
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1
    },
    {
      field: 'bookValue',
      headerName: labels.bookValue,
      flex: 1
    },
    {
      field: 'depreciationAmount',
      headerName: labels.depAmount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'newBookValue',
      headerName: labels.newBookValue,
      flex: 1
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    }
  ]
  const isPosted = formik.values.status === 3

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLDepreciation,
      disabled: !editMode
    },

    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      disabled: true
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
    {
      key: 'PR',
      condition: true,
      onClick: fetchData,
      disabled: editMode || formik.values.asset.count > 0
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.Depreciation}
      form={formik}
      actions={actions}
      editMode={editMode}
      maxAccess={maxAccess}
      functionId={SystemFunction.AssetsDepreciation}
      previewReport={true}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_dgId=${SystemFunction.AssetsDepreciation}&_startAt=${0}&_pageSize=${50}`}
                    name='dtId'
                    label={labels.dtName}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId || '')
                      changeDT(newValue)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    readOnly={!formik.values.dtId || editMode}
                    maxAccess={maxAccess}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik.values?.date}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('date', '')}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    error={!formik.values.date}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plantName}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'plant Ref' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      const plantId = newValue?.recordId || ''
                      formik.setFieldValue('plantId', plantId)
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik.values.notes}
                    maxLength='200'
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <Table
            name='assets'
            columns={columns}
            gridData={formik.values.asset}
            rowId={['recordId']}
            isLoading={false}
            maxAccess={access}
            pagination={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
