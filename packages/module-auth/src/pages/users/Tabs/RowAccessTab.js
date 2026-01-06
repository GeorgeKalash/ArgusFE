import Table from '@argus/shared-ui/src/components/Shared/Table'
import { Grid } from '@mui/material'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useContext, useEffect, useState } from 'react'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import toast from 'react-hot-toast'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { PointofSaleRepository } from '@argus/repositories/src/repositories/PointofSaleRepository'
import { GeneralLedgerRepository } from '@argus/repositories/src/repositories/GeneralLedgerRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const RowAccessTab = ({ maxAccess, labels, storeRecordId }) => {
  const [data, setData] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [search, setSearch] = useState('')

  const rowColumns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    }
  ]

  const { formik } = useForm({
    maxAccess,
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

    const plantRequestPromise =
      classId == ResourceIds.Plants &&
      getRequest({
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

    const costCenterRequestPromise =
      classId == ResourceIds.CostCenter &&
      getRequest({
        extension: GeneralLedgerRepository.CostCenter.qry,
        parameters: '_params=&_startAt=0&_pageSize=1000'
      })

    const costCenterGroupRequestPromise =
      classId == ResourceIds.CostCenterGroup &&
      getRequest({
        extension: GeneralLedgerRepository.CostCenterGroup.qry,
        parameters: '_params=&_startAt=0&_pageSize=1000'
      })

    const rowAccessUserPromise = getRequest({
      extension: AccessControlRepository.RowAccessUserView.qry,
      parameters: `_resourceId=${classId}&_userId=${storeRecordId}`
    })

    let rar

    Promise.all([
      cashAccountRequestPromise,
      plantRequestPromise,
      posRequestPromise,
      salesPersonRequestPromise,
      rowAccessUserPromise,
      costCenterRequestPromise,
      costCenterGroupRequestPromise
    ]).then(
      ([
        cashAccountRequest,
        plantRequest,
        posRequest,
        salesPersonRequest,
        rowAccessUser,
        costCenterRequest,
        costCenterGroupRequest
      ]) => {
        if (classId == ResourceIds.Plants || classId === 'undefined') {
          rar = plantRequest.list?.map(item => {
            return {
              recordId: item.recordId,
              name: item.name,
              reference: item.reference,
              hasAccess: false
            }
          })
        } else if (classId == ResourceIds.CashAccounts) {
          rar = cashAccountRequest.list?.map(item => {
            return {
              recordId: item.recordId,
              name: item.name,
              reference: item.reference,
              hasAccess: false
            }
          })
        } else if (classId == ResourceIds.SalesPerson) {
          rar = salesPersonRequest.list?.map(item => {
            return {
              recordId: item.recordId,
              name: item.name,
              reference: item.spRef,
              hasAccess: false
            }
          })
        } else if (classId == ResourceIds.PointOfSale) {
          rar = posRequest.list?.map(item => {
            return {
              recordId: item.recordId,
              name: item.name,
              reference: item.reference,
              hasAccess: false
            }
          })
        } else if (classId == ResourceIds.CostCenter) {
          rar = costCenterRequest.list?.map(item => {
            return {
              recordId: item.recordId,
              name: item.name,
              reference: item.reference,
              hasAccess: false
            }
          })
        } else if (classId == ResourceIds.CostCenterGroup) {
          rar = costCenterGroupRequest.list?.map(item => {
            return {
              recordId: item.recordId,
              name: item.name,
              reference: item.reference,
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
        list: data?.list?.filter(
          item =>
            (item?.name && item?.name?.toLowerCase().includes(search.toLowerCase())) ||
            (item?.reference && item?.reference?.toLowerCase().includes(search.toLowerCase()))
        )
      }
    : data

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={!!storeRecordId} isParentWindow={false}>
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
            name='rowAccess'
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
    </Form>
  )
}

export default RowAccessTab
