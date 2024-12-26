import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { useWindow } from 'src/windows'
import SelectAgent from '../Tabs/SelectAgent'

const ProductsWindow = ({ labels, maxAccess, onProductSubmit, products, editMode, window }) => {
  const [gridData, setGridData] = useState([])
  const { stack } = useWindow()

  const setData = (agentName, productId) => {
    const updatedData = gridData?.list.map(row =>
      row.productId === productId ? { ...row, agentName: agentName, originAmount: 800000, baseAmount: 600000 } : row
    )

    setGridData({ list: updatedData })
  }

  const columns = [
    {
      field: 'productName',
      headerName: labels.ProductName,
      flex: 1
    },
    {
      field: 'corName',
      headerName: labels.Correspondant,
      flex: 1
    },
    {
      field: 'agentName',
      headerName: labels.Agent,
      flex: 1
    },
    {
      field: '',
      headerName: '',
      flex: 1,
      cellRenderer: params => {
        return (
          <Button
            variant='contained'
            size='small'
            style={{ height: 25 }}
            onClick={() =>
              stack({
                Component: SelectAgent,
                props: {
                  setData,
                  productId: params.data?.productId,
                  labels,
                  maxAccess
                },
                width: 400,
                height: 200,
                title: labels.Agent
              })
            }
          >
            select
          </Button>
        )
      }
    },
    {
      field: 'fees',
      headerName: labels.Fees,
      flex: 1
    },
    {
      field: 'originAmount',
      headerName: labels.originAmount,
      flex: 1
    },
    {
      field: 'baseAmount',
      headerName: labels.BaseAmount,
      flex: 1
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        setGridData({ list: products })
      } catch (error) {}
    })()
  }, [])

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['productId']}
          rowSelection='single'
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          showCheckboxColumn={true}
          ChangeCheckedRow={setGridData}
        />
      </Grow>
      <Fixed>
        <WindowToolbar
          onSave={() => {
            onProductSubmit(gridData)
            window.close()
          }}
          isSaved={true}
          smallBox={true}
          disabledSubmit={editMode}
        />
      </Fixed>
    </VertLayout>
  )
}

export default ProductsWindow
