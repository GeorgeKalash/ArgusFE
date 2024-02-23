import { useWindow } from 'src/windows'
import GridToolbar from './GridToolbar'
import { Box } from '@mui/material'
import ResourceComboBox from './ResourceComboBox'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

export default function GridToolbarWithCombo(props) {
  const { children, labels, inputSearch, onSearchClear, onSearch, ...remaining } = props
  console.log('children ', children)

  return (
    <GridToolbar {...remaining}>
      {children}
      <Box sx={{ display: 'flex', width: '300px', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
        <ResourceComboBox
          endpointId={RemittanceSettingsRepository.Correspondent.qry}
          labels={labels[5]}
          columnsInDropDown={[
            { key: 'reference', value: 'Reference' },
            { key: 'name', value: 'Name' }
          ]}
          values={''}
          valueField='recordId'
          displayField={'reference'}
          required
          onChange={async (event, newValue) => {}}
        />
      </Box>
    </GridToolbar>
  )
}
