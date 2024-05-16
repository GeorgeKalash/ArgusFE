import Table from 'src/components/Shared/Table'
import { Grid, Box, Button } from '@mui/material'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useContext, useEffect, useState } from 'react'
import { DataSets } from 'src/resources/DataSets'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { POSRepository } from 'src/repositories/POSRepository'

const RowAccessTab = ({ maxAccess, labels, storeRecordId }) => {
  const [data, setData] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)

  const rowColumns = [
    {
      field: 'name',
      headerName: '',
      flex: 2
    }
  ]

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
    initialValues: {
      recordId: '',
      name: '',
      classId: ResourceIds.Plants,
      hasAccess: false,
      checked: false
    },
    onSubmit: async obj => {
      const updatedRows = data.list
        .filter(obj => obj.checked)
        .map(row => ({
          recordId: row.recordId,
          userId: storeRecordId,
          resourceId: parseInt(formik.values.classId)
        }))

      const resultObject = {
        userId: storeRecordId,
        resourceId: parseInt(formik.values.classId),
        items: updatedRows
      }

      await postRequest({
        extension: AccessControlRepository.RowAccessUserView.set2,
        record: JSON.stringify(resultObject)
      })

      toast.success('Record Updated Successfully')
    }
  })

  const fetchGridData = classId => {
    classId = classId || ResourceIds.Plants

    const plantRequestPromise = getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: '_filter='
    })

    const cashAccountRequestPromise = getRequest({
      extension: CashBankRepository.CashAccount.qry,
      parameters: '_filter=&_type=0'
    })

    const salesPersonRequestPromise = getRequest({
      extension: SaleRepository.SalesPerson.qry,
      parameters: '_filter='
    })

    const posRequestPromise = getRequest({
      extension: POSRepository.PointOfSale.qry,
      parameters: '_filter='
    })

    const rowAccessUserPromise = getRequest({
      extension: AccessControlRepository.RowAccessUserView.qry,
      parameters: `_resourceId=${classId}&_userId=${storeRecordId}`
    })

    let rar = {
      recordId: null,
      name: null,
      hasAccess: false,
      classId: null
    }

    Promise.all([cashAccountRequestPromise, plantRequestPromise, salesPersonRequestPromise, rowAccessUserPromise]).then(
      ([cashAccountRequest, plantRequest, salesPersonRequest, rowAccessUser]) => {
        if (classId == ResourceIds.Plants || classId === 'undefined') {
          rar = plantRequest.list?.map(item => {
            return {
              recordId: item.recordId,
              name: item.name,
              hasAccess: false
            }
          })
        } else if (classId == ResourceIds.CashAccounts) {
          rar = cashAccountRequest.list?.map(item => {
            return {
              recordId: item.recordId,
              name: item.name,
              hasAccess: false
            }
          })
        } else if (classId == ResourceIds.SalesPerson) {
          rar = salesPersonRequest.list?.map(item => {
            return {
              recordId: item.recordId,
              name: item.name,
              hasAccess: false
            }
          })
        } else if (classId == ResourceIds.PointOfSale) {
          rar = posRequestPromise.list?.map(item => {
            return {
              recordId: item.recordId,
              name: item.reference,
              hasAccess: false
            }
          })
        }
        if (classId !== 'undefined' && rar) {
          for (let i = 0; i < rar.length; i++) {
            rowAccessUser.list.forEach(storedItem => {
              if (storedItem.recordId.toString() == rar[i].recordId) {
                rar[i].hasAccess = true
                rar[i].checked = true
              }
            })
          }

          let resultObject = { list: rar }
          setData(resultObject)
        } else {
          setData({ list: [] })
        }
      }
    )
  }

  const checkAll = () => {
    data.list.forEach(item => {
      ;(item.checked = true), (item.hasAccess = true)
    })

    console.log('check data true', data.list)
  }

  const uncheckAll = () => {
    data.list.forEach(item => {
      ;(item.checked = false), (item.hasAccess = false)
    })
    console.log('check data false', data.list)
  }
  useEffect(() => {
    if (storeRecordId) {
      formik.setFieldValue('classId', ResourceIds.Plants)
      fetchGridData()
    }
  }, [storeRecordId])

  return (
    <FormShell resourceId={ResourceIds.Users} form={formik} maxAccess={maxAccess} editMode={!!storeRecordId}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems='center'>
                <Grid item xs={6}>
                  <ResourceComboBox
                    label={labels.rowAccess}
                    valueField='key'
                    displayField='value'
                    name='classId'
                    datasetId={DataSets.ROW_ACCESS}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('classId', newValue ? newValue.key : ResourceIds.Plants)
                      fetchGridData(newValue ? newValue.key : ResourceIds.Plants)
                    }}
                    error={formik.touched.classId && Boolean(formik.errors.classId)}
                  />
                </Grid>
                <Grid item xs={6} container spacing={1} alignItems='center' justifyContent='flex-start'>
                  <Button variant='contained' color='primary' onClick={checkAll}>
                    Check All
                  </Button>
                  <Button variant='contained' color='secondary' sx={{ marginLeft: 2 }} onClick={uncheckAll}>
                    Uncheck All
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sx={{ pt: 2 }}>
              <Box>
                <Table
                  columns={rowColumns}
                  gridData={data ? data : { list: [] }}
                  rowId={['recordId']}
                  isLoading={false}
                  maxAccess={maxAccess}
                  pagination={false}
                  height={300}
                  checkTitle={labels.active}
                  showCheckboxColumn={true}
                />
              </Box>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default RowAccessTab
