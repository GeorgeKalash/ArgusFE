import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Grid } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import ResourceComboBox from './ResourceComboBox'
import { DataGrid } from './DataGrid'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { LogisticsRepository } from '@argus/repositories/src/repositories/LogisticsRepository'
import * as yup from 'yup'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { getFormattedNumber } from '@argus/shared-domain/src/lib/numberField-helper'
import toast from 'react-hot-toast'
import FieldSet from './FieldSet'
import { useError } from '@argus/shared-providers/src/providers/error'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from './Form'

export const LOShipmentForm = ({ recordId, functionId, editMode, totalBaseAmount, window }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.Transportation, window })

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
          packageReferences: [
            { id: 1, typeId: '', packageSeqNo: '', recordId: '', functionId: '', seqNo: 1, reference: '' }
          ]
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      carrierId: yup.string().required(),
      packages: yup
        .array()
        .of(
          yup.object().shape({
            packageTypeName: yup.string().required(),
            qty: yup.string().required(),
            amount: yup.string().required()
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
          packageReferences:
            packageDetail.packageReferences
              .map(packageRefDetail => ({
                seqNo: index + 1,
                recordId: recordId,
                functionId: functionId,
                reference: packageRefDetail.reference
              }))
              ?.filter(item => !!item?.reference) || []
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
  const index = formik.values.packages.findIndex(item => item.id === selectedRowId)

  const { labels, maxAccess } = useResourceQuery({
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

  function loadSerialsGrid(row) {
    setSelectedRowId(row.id)
  }

  const handleSerialsGridChange = newRows => {
    if (formik.values.packages[index]?.packageReferences?.length < newRows.length) {
      newRows[formik.values.packages[index]?.packageReferences?.length].seqNo =
        formik.values.packages[index]?.packageReferences?.length + 1
    }

    formik.setFieldValue(`packages[${index}].packageReferences`, newRows)
  }

  const handleReferenceChange = (e, id) => {
    const newReference = e.target.value
    const allPackages = formik.values.packages

    const isDuplicate = allPackages.some(pkg =>
      pkg.packageReferences.some((ref, idx) => ref.reference === newReference && idx !== id - 1)
    )

    if (isDuplicate) {
      stackError({ message: labels.referenceDuplicateMessage })

      let newRows = [...formik.values.packages[index].packageReferences]

      const idx = id - 1

      newRows[idx] = {
        id: idx,
        ...newRows[idx],
        reference: ''
      }
      formik.setFieldValue(`packages[${index}].packageReferences`, newRows)
    }
  }

  const handlePackageGridChange = newRows => {
    const updatedRows = newRows?.map(row => {
      const qty = parseInt(row?.qty, 10)
      let packageReferences = row?.packageReferences

      if (packageReferences?.length === 0) {
        packageReferences = [{ seqNo: 1, id: 1, reference: '' }]
      }

      if (qty < packageReferences?.length) {
        packageReferences = packageReferences.slice(0, qty)
      }

      row.packageReferences = packageReferences

      return row
    })

    formik.setFieldValue('packages', updatedRows)
  }

  useEffect(() => {
    ;(async function () {
      if (recordId && functionId) {
        const res = await getRequest({
          extension: LogisticsRepository.Shipment.get2,
          parameters: `_recordId=${recordId}&_functionId=${functionId}`
        })

        const packages = res.record.packages.map((item, index) => ({
          ...item,
          id: index + 1,
          packageReferences: item?.packageReferences?.map((item, i) => ({
            ...item,
            id: i + 1,
            seqNo: i + 1
          }))
        }))
        setSelectedRowId(res.record?.packages?.length > 0 && 1)

        res?.record?.header &&
          formik.setValues({
            ...res.record.header,
            packages: packages
          })
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} editMode={true}>
      <VertLayout>
        <Fixed>
          <Grid container wrap='nowrap' spacing={2}>
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
                error={formik.touched.policyNo && Boolean(formik.errors.policyNo)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={8} sx={{ display: 'flex', flex: 1 }}>
              <FieldSet sx={{ flex: 1 }}>
                <Grid container wrap='nowrap' sx={{ flexDirection: 'column', flex: 1 }}>
                  <Grow>
                    <DataGrid
                      onChange={value => handlePackageGridChange(value)}
                      value={formik.values.packages}
                      error={formik.errors.packages}
                      maxAccess={maxAccess}
                      rowSelectionModel={selectedRowId}
                      allowAddNewLine={!editMode}
                      initialValues={formik?.initialValues?.packages?.[0]}
                      allowDelete={!editMode}
                      onSelectionChange={row => {
                        row && loadSerialsGrid(row)
                      }}
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
                          props: {
                            readOnly: editMode
                          }
                        },
                        {
                          component: 'numberfield',
                          label: labels.amount,
                          name: 'amount',
                          props: { readOnly: editMode }
                        }
                      ]}
                    />
                  </Grow>
                  <Fixed>
                    <Grid container direction='row' wrap='nowrap' sx={{ pt: 5, justifyContent: 'flex-end' }}>
                      <Grid item xs={3}>
                        <CustomTextField
                          name='totalBaseAmount'
                          maxAccess={maxAccess}
                          value={getFormattedNumber(totalBaseAmount)}
                          label={labels.totalBaseAmount}
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={3} sx={{ pl: 3 }}>
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
            </Grid>
            <Grid item xs={4} sx={{ display: 'flex', flex: 1 }}>
              <FieldSet xs={4} sx={{ flex: 1 }}>
                <Grow>
                  {selectedRowId && formik.values.packages[index] && (
                    <DataGrid
                      key={selectedRowId}
                      onChange={value => handleSerialsGridChange(value)}
                      value={
                        formik.values.packages.find(item => item.id === selectedRowId).packageReferences || [
                          { seqNo: '1', id: 1, reference: '' }
                        ]
                      }
                      maxAccess={maxAccess}
                      allowAddNewLine={
                        !editMode &&
                        formik?.values?.packages[index]?.packageReferences?.length <
                          parseInt(formik?.values?.packages[index]?.qty, 10)
                      }
                      allowDelete={false}
                      columns={[
                        {
                          component: 'numberfield',
                          name: 'seqNo',
                          label: labels.seqNo,
                          props: { readOnly: true }
                        },
                        {
                          component: 'textfield',
                          label: labels.cellNumber,
                          name: 'reference',
                          props: {
                            maxLength: 20,
                            mandatory: true,
                            readOnly: editMode
                          },
                          onBlur: (e, id) => handleReferenceChange(e, id),
                          onKeyDown: (e, id) => handleReferenceChange(e, id)
                        }
                      ]}
                    />
                  )}
                </Grow>
              </FieldSet>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

LOShipmentForm.width = 1200
LOShipmentForm.height = 670
