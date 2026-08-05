import { useContext, useState } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Grid } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

const MergedComponentsForm = ({ labels, maxAccess, components = [] }) => {
  const { platformLabels } = useContext(ControlContext)
  const [search, setSearch] = useState('')
  const { stack } = useWindow()

  const columns = [
    {
      field: 'imageUrl',
      headerName: labels.image,
      type: 'image',
      flex: 1,
      clickable: true,
      titleField: 'componentSku'
    },
    {
      field: 'componentSku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'componentName',
      headerName: labels.itemName,
      flex: 2
    },
    {
      field: 'qty',
      headerName: labels.componentQty,
      flex: 1,
      type: 'number'
    }
  ]

  const filteredData = search
    ? components?.filter(
        item =>
          item.componentSku?.toLowerCase().includes(search.toLowerCase()) ||
          item.componentName?.toLowerCase().includes(search.toLowerCase())
      )
    : components

  const handleSearchChange = event => {
    setSearch(event?.target?.value ?? '')
  }

  return (
    <VertLayout>
      <Fixed>
        <Grid container xs={12} p={2}>
          <Grid item xs={4}>
            <CustomTextField
              name='search'
              value={search}
              label={platformLabels.Search}
              onClear={() => setSearch('')}
              onChange={handleSearchChange}
              onSearch={value => setSearch(value)}
              search
            />
          </Grid>
        </Grid>
      </Fixed>

      <Grow>
        <Table
          name='mergedComponents'
          columns={columns}
          gridData={{ list: filteredData }}
          rowId={['componentId']}
          pagination={false}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default MergedComponentsForm