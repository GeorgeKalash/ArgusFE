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
  const [rowPackage, setPackage] = useState(null)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [enableSerials, setEnableSerials] = useState(true)

  const [store, setStore] = useState([
    { typeId: '', packageSeqNo: '', function: '', recordId: '', seqNo: 1, id: 1, reference: '' }
  ])

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
          packageReferences:
            packageDetail.packageReferences?.map(packageRefDetail => ({
              ...packageRefDetail,
              recordId: recordId,
              functionId: functionId
            })) || []
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
    setEnableSerials(false)
    setPackage(row)

    if (row.seqNo) {
      let newList = []
      for (let i = 0; i < store.length; i++) {
        if (store[i].typeId === row.packageType) {
          newList.push({
            ...store[i],
            packageSeqNo: store[i].seqNo
          })
        }
      }
      setSeqCounter(newList[newList.length - 1].seqNo + 1)
      formik.setValues(prevValues => ({
        ...prevValues,
        packages: prevValues.packages.map(packageItem => {
          if (packageItem.packageType === newList[0].typeId) {
            return {
              ...packageItem,
              packageReferences: newList
            }
          } else {
            return packageItem
          }
        })
      }))
    } else {
      formik.setValues(prevValues => ({
        ...prevValues,
        packages: prevValues.packages.map(packageItem => {
          if (packageItem.id === row.id) {
            return {
              ...packageItem,
              packageReferences: [{ id: 1, seqNo: 1, reference: '', packageSeqNo: packageItem.seqNo }]
            }
          } else {
            return packageItem
          }
        })
      }))
    }
  }

  const handleSerialsGridChange = newRows => {
    const updatedRows = newRows.map(row => {
      if (!row.seqNo && row.seqNo !== 0) {
        row.seqNo = seqCounter
        setSeqCounter(seqCounter + 1)
      }

      return row
    })

    const item = { ...rowPackage }
    item.packageReferences = updatedRows[0]
    const index = rowPackage.id - 1
    formik.setFieldValue(`packages[${index}]`, item)

    /*formik.setValues(prevValues => ({
      ...prevValues,
      packages: prevValues.packages.map(packageItem => {
        if (packageItem.id === newRows[0].id) {
          return {
            ...packageItem,
            packageReferences: updatedRows
          }
        } else {
          return packageItem
        }
      })
    }))*/
  }
  console.log(
    'check formik ',
    formik.values.packages.filter(item => item.id == selectedRowId)
  )

  const handlePackageGridChange = newRows => {
    newRows.map(row => {
      if (!!row.seqNo) {
        formik.setFieldValue('packages[1].packageReferences', [{ id: 1, seqNo: 1 }])
      }
    })
    formik.setFieldValue('packages', newRows)
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
          id: index + 1
        }))

        let packageReferencesList = []
        for (let i = 0; i < res.record.packages.length; i++) {
          const modifiedPackageReferences = res.record.packages[i]?.packageReferences.map((data, index) => {
            return {
              ...data,
              typeId: res.record.packages[i].packageType,
              packageSeqNo: res.record.packages[i].seqNo,
              id: index + 1
            }
          })
          if (modifiedPackageReferences) {
            packageReferencesList.push(...modifiedPackageReferences)
          }
        }
        setStore(packageReferencesList || [{ id: 1, seqNo: 1 }])

        if (packageReferencesList?.length > 0) {
          const lastSeqNo = packageReferencesList[packageReferencesList.length - 1].seqNo
          setSeqCounter(lastSeqNo ? lastSeqNo + 1 : 1)
        }

        formik.setValues({
          ...res.record.header,
          packages: packages.map(pkg => ({
            ...pkg,
            packageReferences: [{ id: 1, seqNo: 1 }]
          }))
        })
      }
    })()
  }, [])

  //console.log('formik check ', formik.values)

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
          <Grid container direction='row' wrap='nowrap' sx={{ flex: 1, flexDirection: 'row' }}>
            <FieldSet sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Grid container direction='row' wrap='nowrap' sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Grow>
                  <DataGrid
                    onChange={value => handlePackageGridChange(value)}
                    value={formik.values.packages}
                    error={formik.errors.packages}
                    maxAccess={maxAccess}
                    allowAddNewLine={!editMode}
                    allowDelete={!editMode}
                    onSelectionChange={row => row && loadSerialsGrid(row)}
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
                    onChange={value => handleSerialsGridChange(value)}
                    value={
                      formik.values.packages.filter(item => item.id == selectedRowId)[0]?.packageReferences || [
                        { seqNo: 1, id: 1, reference: '' }
                      ]
                    }
                    maxAccess={maxAccess}
                    allowAddNewLine={!editMode}
                    allowDelete={false}
                    disabled={enableSerials}
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
