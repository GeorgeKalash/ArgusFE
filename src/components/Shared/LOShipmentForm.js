import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import FormShell from './FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Box, Grid } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import ResourceComboBox from './ResourceComboBox'
import { DataGrid } from './DataGrid'
import { useForm } from 'src/hooks/form'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import * as yup from 'yup'
import { useResourceQuery } from 'src/hooks/resource'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DataSets } from 'src/resources/DataSets'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import toast from 'react-hot-toast'
import FieldSet from './FieldSet'

export const LOShipmentForm = ({ recordId, functionId, editMode }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      functionId: functionId,
      policyNo: '',
      carrierId: '',
      typeGrid: [{ id: 1, recordId: '', functionId: '', seqNo: '', packageType: '', qty: '', amount: '' }],
      serialGrid: [{ id: 1, recordId: '', functionId: '', seqNo: '', reference: '' }]
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      policyNo: yup.string().required(),
      carrierId: yup.string().required(),
      typeGrid: yup
        .array()
        .of(
          yup.object().shape({
            packageTypeName: yup.string().required(),
            qty: yup.string().nullable().required(),
            amount: yup.string().nullable().required()
          })
        )
        .required(),
      serialGrid: yup
        .array()
        .of(
          yup.object().shape({
            seqNo: yup.string().required(),
            reference: yup.string().nullable().required()
          })
        )
        .required()
    }),
    onSubmit: async values => {
      const packageRows = formik.values.typeGrid.map((packageDetail, index) => {
        return {
          ...packageDetail,
          seqNo: index + 1,
          recordId: recordId,
          functionId: functionId
        }
      })

      const packageRefRows = formik.values.serialGrid.map(packageRefDetail => {
        return {
          ...packageRefDetail,
          recordId: recordId,
          functionId: functionId
        }
      })

      const resultObject = {
        header: {
          recordId: recordId,
          functionId: functionId,
          carrierId: values.carrierId,
          policyNo: values.policyNo
        },
        packages: packageRows,
        packageReferences: packageRefRows
      }

      await postRequest({
        extension: LogisticsRepository.Shipment.set2,
        record: JSON.stringify(resultObject)
      })

      toast.success('Record Updated Successfully')
    }
  })
  console.log('formik check ', formik.touched.carrierId)

  const { labels: labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.LOShipments
  })

  const totalQty = formik.values?.typeGrid?.reduce((qty, row) => {
    const qtyValue = parseFloat(row.qty?.toString().replace(/,/g, '')) || 0

    return qty + qtyValue
  }, 0)

  const totalAmount = formik.values?.typeGrid?.reduce((amount, row) => {
    const amountValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

    return amount + amountValue
  }, 0)
  useEffect(() => {
    ;(async function () {
      if (recordId && functionId) {
        const res = await getRequest({
          extension: LogisticsRepository.Shipment.get2,
          parameters: `_recordId=${recordId}&_functionId=${functionId}`
        })

        const packages = res.record.packages.map((item, index) => ({
          ...item,
          id: index + 1
        }))

        const packageReferences = res.record.packageReferences.map((item, index) => ({
          ...item,
          id: index + 1
        }))

        formik.setValues({
          ...res.record.header,
          typeGrid: packages,
          serialGrid: packageReferences
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.LOShipments} form={formik} editMode={true} isCleared={false} isInfo={false}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={LogisticsRepository.LoCarrier.qry}
                name='carrierId'
                label={labels.carrier}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('carrierId', newValue ? newValue.recordId : '')
                }}
                error={formik.touched.carrierId && Boolean(formik.errors.carrierId)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='policyNo'
                label={labels.policyNo}
                value={formik.values.policyNo}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('policyNo', '')}
                maxAccess={maxAccess}
                maxLength='30'
                readOnly={editMode}
                required
                error={formik.touched.policyNo && Boolean(formik.errors.policyNo)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Grid container sx={{ flex: 1, flexDirection: 'row' }}>
            <FieldSet sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Grid container sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Grow>
                  <DataGrid
                    onChange={value => formik.setFieldValue('typeGrid', value)}
                    value={formik.values.typeGrid}
                    error={formik.errors.typeGrid}
                    maxAccess={maxAccess}
                    allowAddNewLine={!editMode}
                    allowDelete={!editMode}
                    columns={[
                      {
                        component: 'resourcecombobox',
                        label: labels.type,
                        name: 'packageTypeName',
                        props: {
                          datasetId: DataSets.PACKAGE_TYPE,
                          displayField: 'value',
                          valueField: 'key',
                          mapping: [
                            { from: 'key', to: 'packageType' },
                            { from: 'value', to: 'packageTypeName' }
                          ],
                          readOnly: editMode
                        }
                      },
                      {
                        component: 'numberfield',
                        name: 'qty',
                        label: labels.qty,
                        defaultValue: '',
                        props: {
                          readOnly: editMode
                        }
                      },
                      {
                        component: 'numberfield',
                        label: labels.amount,
                        name: 'amount',
                        defaultValue: '',
                        props: { readOnly: editMode }
                      }
                    ]}
                  />
                </Grow>
                <Fixed>
                  <Grid container sx={{ pt: 5, justifyContent: 'flex-end' }}>
                    <Grid item xs={3}>
                      <CustomTextField
                        name='totalQty'
                        maxAccess={maxAccess}
                        value={getFormattedNumber(totalQty)}
                        label={labels.totalQty}
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={3} sx={{ pl: 3 }}>
                      <CustomTextField
                        name='totalAmount'
                        maxAccess={maxAccess}
                        value={getFormattedNumber(totalAmount.toFixed(2))}
                        label={labels.totalAmount}
                        readOnly={true}
                      />
                    </Grid>
                  </Grid>
                </Fixed>
              </Grid>
            </FieldSet>
            <Grid item xs={4} sx={{ display: 'flex', flex: 1, pl: 10 }}>
              <FieldSet sx={{ flex: 1 }}>
                <Grow>
                  <DataGrid
                    onChange={value => formik.setFieldValue('serialGrid', value)}
                    value={formik.values.serialGrid}
                    error={formik.errors.serialGrid}
                    maxAccess={maxAccess}
                    allowAddNewLine={!editMode}
                    allowDelete={!editMode}
                    columns={[
                      {
                        component: 'numberfield',
                        name: 'seqNo',
                        label: labels.seqNo,
                        defaultValue: '',
                        props: { readOnly: editMode }
                      },
                      {
                        component: 'textfield',
                        label: labels.reference,
                        name: 'reference',
                        props: {
                          maxLength: 20,
                          readOnly: editMode
                        }
                      }
                    ]}
                  />
                </Grow>
              </FieldSet>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
