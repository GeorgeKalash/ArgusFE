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
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DataSets } from 'src/resources/DataSets'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import toast from 'react-hot-toast'
import FieldSet from './FieldSet'

export const LOShipmentForm = ({ recordId, functionId, editMode }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const [seqCounter, setSeqCounter] = useState(1)

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      functionId: functionId,
      policyNo: '',
      carrierId: '',
      packages: [
        {
          id: 1,
          recordId: '',
          functionId: '',
          seqNo: '',
          packageType: '',
          qty: '',
          amount: '',
          packageReferences: [{ id: 1, recordId: '', functionId: '', seqNo: 1, reference: '' }]
        }
      ]
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      policyNo: yup.string().required(),
      carrierId: yup.string().required(),
      packages: yup
        .array()
        .of(
          yup.object().shape({
            packageTypeName: yup.string().required(),
            qty: yup.string().required(),
            amount: yup.string().required(),
            packageReferences: yup
              .array()
              .of(
                yup.object().shape({
                  seqNo: yup.string().required(),
                  reference: yup.string().required()
                })
              )
              .required()
          })
        )

        .required()
    }),
    onSubmit: async values => {
      const packageRows = formik.values.packages.map((packageDetail, index) => {
        return {
          ...packageDetail,
          seqNo: index + 1,
          recordId: recordId,
          functionId: functionId,
          packageReferences: packageDetail.packageReferences.map(packageRefDetail => ({
            ...packageRefDetail,
            recordId: recordId,
            functionId: functionId
          }))
        }
      })

      const resultObject = {
        header: {
          recordId: recordId,
          functionId: functionId,
          carrierId: values.carrierId,
          policyNo: values.policyNo
        },
        packages: packageRows
      }

      await postRequest({
        extension: LogisticsRepository.Shipment.set2,
        record: JSON.stringify(resultObject)
      })

      toast.success('Record Updated Successfully')
    }
  })

  const { labels: labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.LOShipments
  })

  const totalQty = formik.values?.packages?.reduce((qty, row) => {
    const qtyValue = parseFloat(row.qty?.toString().replace(/,/g, '')) || 0

    return qty + qtyValue
  }, 0)

  const totalAmount = formik.values?.packages?.reduce((amount, row) => {
    const amountValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

    return amount + amountValue
  }, 0)
  function loadSerialsGrid() {}
  useEffect(() => {
    ;(async function () {
      if (recordId && functionId) {
        const res = await getRequest({
          extension: LogisticsRepository.Shipment.get2,
          parameters: `_recordId=${recordId}&_functionId=${functionId}`
        })

        /*const packages = res.record.packages.map((item, index) => ({
          ...item,
          id: index + 1
        }))

        const packageReferences = res.record.packages.packageReferences.map((item, index) => ({
          ...item,
          id: index + 1
        }))
        if (packageReferences.length > 0) {
          const lastSeqNo = packageReferences[packageReferences.length - 1].seqNo
          setSeqCounter(lastSeqNo ? lastSeqNo + 1 : 1)
        }
        formik.setValues({
          ...res.record.header,
          packages: packages.map(pkg => ({
            ...pkg,
            packageReferences: packageReferences
          }))
        })*/
      }
    })()
  }, [])
  console.log('check formik ', formik.values)

  const handleDataGridChange = newRows => {
    const updatedRows = newRows.map(row => {
      console.log('check row ', row)
      if (!row.seqNo && row.seqNo !== 0) {
        row.seqNo = seqCounter
        setSeqCounter(seqCounter + 1)
      }

      return row
    })
    formik.setFieldValue('packageReferences', updatedRows)
  }

  return (
    <FormShell resourceId={ResourceIds.LOShipments} form={formik} editMode={true} isCleared={false} isInfo={false}>
      <VertLayout>
        <Fixed>
          <Grid container direction='row' wrap='nowrap' spacing={2}>
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
          <Grid container xs={12} direction='row' wrap='nowrap' sx={{ flex: 1, flexDirection: 'row' }}>
            <FieldSet sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Grid container direction='row' wrap='nowrap' sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Grow>
                  <DataGrid
                    onChange={value => formik.setFieldValue('packages', value)}
                    value={formik.values.packages}
                    error={formik.errors.packages}
                    maxAccess={maxAccess}
                    allowAddNewLine={!editMode}
                    allowDelete={!editMode}
                    onSelectionChange={row => row && loadSerialsGrid()}
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
                  <Grid container direction='row' wrap='nowrap' sx={{ pt: 5, justifyContent: 'flex-end' }}>
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
            <Grid item xs={4} sx={{ display: 'flex', flex: 1, pl: 7 }}>
              <FieldSet xs={4} sx={{ flex: 1 }}>
                <Grow>
                  <DataGrid
                    onChange={value => handleDataGridChange(value)}
                    value={formik.values.packages.packageReferences} //error={formik.errors.packages.packageReferences}
                    maxAccess={maxAccess}
                    allowAddNewLine={!editMode}
                    allowDelete={false}
                    columns={[
                      {
                        component: 'numberfield',
                        name: 'seqNo',
                        label: labels.seqNo,
                        defaultValue: '',
                        props: { readOnly: true }
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
