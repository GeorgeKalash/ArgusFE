import Table from 'src/components/Shared/Table'
import { Grid } from '@mui/material'
import { useForm } from 'src/hooks/form'
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
import toast from 'react-hot-toast'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { PointofSaleRepository } from 'src/repositories/PointofSaleRepository'

const RowAccessTab = ({ maxAccess, labels, storeRecordId }) => {
  const [data, setData] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [search, setSearch] = useState('')

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

      toast.success(platformLabels.Updated)
    }
  })

  const fetchGridData = classId => {
    setData({ list: [] })
    classId = classId || ResourceIds.Plants

    const plantRequestPromise = getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: '_filter='
    })

    const cashAccountRequestPromise =
      classId == ResourceIds.CashAccounts &&
      getRequest({
        extension: CashBankRepository.CashAccount.qry,
        parameters: '_filter=&_type=0'
      })

    const salesPersonRequestPromise =
      classId == ResourceIds.SalesPerson &&
      getRequest({
        extension: SaleRepository.SalesPerson.qry,
        parameters: '_filter='
      })

    const posRequestPromise =
      classId == ResourceIds.PointOfSale &&
      getRequest({
        extension: PointofSaleRepository.PointOfSales.qry,
        parameters: '_filter='
      })

    const rowAccessUserPromise = getRequest({
      extension: AccessControlRepository.RowAccessUserView.qry,
      parameters: `_resourceId=${classId}&_userId=${storeRecordId}`
    })

    let rar

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
        if (classId && rar) {
          for (let i = 0; i < rar.length; i++) {
            rowAccessUser.list.forEach(storedItem => {
              if (storedItem.recordId.toString() == rar[i].recordId) {
                rar[i].hasAccess = true
                rar[i].checked = true
              }
            })
          }

          setData({ list: rar })
        }
      }
    )
  }

  const handleSearchChange = event => {
    setSearch(event?.target?.value ?? '')
  }

  useEffect(() => {
    if (storeRecordId) {
      formik.setFieldValue('classId', ResourceIds.Plants)
      fetchGridData()
    }
  }, [storeRecordId])

  const filteredData = search
    ? {
        list: data?.list?.filter(item => item?.name && item?.name?.toLowerCase().includes(search.toLowerCase()))
      }
    : data

  return (
    <FormShell
      resourceId={ResourceIds.Users}
      form={formik}
      maxAccess={maxAccess}
      editMode={!!storeRecordId}
      isSavedClear={false}
      isCleared={false}
      infoVisible={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
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
            <Grid item xs={6}>
              <CustomTextField
                name='search'
                value={search}
                label={platformLabels.Search}
                onClear={() => {
                  setSearch('')
                }}
                onChange={handleSearchChange}
                onSearch={e => setSearch(e)}
                search={true}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={rowColumns}
            gridData={filteredData}
            rowId={['recordId']}
            isLoading={false}
            maxAccess={maxAccess}
            pagination={false}
            checkTitle={labels.active}
            showCheckboxColumn={true}
            viewCheckButtons={true}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default RowAccessTab
