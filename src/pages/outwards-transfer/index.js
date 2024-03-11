// ** React Importsport
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button, Checkbox, FormControlLabel } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

// ** Windows
import OutwardsWindow from './Windows/OutwardsWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { getNewOutwards, populateOutwards } from 'src/Models/RemittanceActivities/Outwards'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import ProductsWindow from './Windows/ProductsWindow'
import { CurrencyTradingClientRepository } from 'src/repositories/CurrencyTradingClientRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

const OutwardsTransfer = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState(null)
  const [productsStore, setProductsStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [productsWindowOpen, setProductsWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.Currency.qry,
    datasetId: ResourceIds.Currencies
  })

  const invalidate = useInvalidate({
    endpointId: SystemRepository.SMSTemplate.page
  })

  const columns = [
    {
      field: 'countryRef',
      headerName: 'countryRef',
      flex: 1
    },
    {
      field: 'dispersalName',
      headerName: 'dispersalName',
      flex: 1
    },
    ,
    {
      field: 'currencyRef',
      headerName: 'currencyRef',
      flex: 1
    },
    {
      field: 'agent',
      headerName: 'agent',
      flex: 1
    }
  ]

  const delOutwards = obj => {}

  const addOutwards = () => {}

  const editOutwards = obj => {
    setSelectedRecordId(obj.recordId)
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={addOutwards} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          onEdit={editOutwards}
          onDelete={delOutwards}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <OutwardsWindow
          onClose={() => setWindowOpen(false)}
          labels={_labels}
          setProductsWindowOpen={setProductsWindowOpen}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
        />
      )}

      {productsWindowOpen && (
        <ProductsWindow
          onClose={() => setProductsWindowOpen(false)}
          width={700}
          height={200}
          onSave={handleProductSelection}
          gridData={productsStore}
          setSelectedRow={setSelectedRow}
          selectedRow={selectedRow}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default OutwardsTransfer
