import GridToolbar from './GridToolbar'
import { Box } from '@mui/material'
import ResourceComboBox from './ResourceComboBox'

export default function GridToolbarWithCombo(props) {
  const {
    children,
    labels,
    inputSearch,
    onSearchClear,
    onSearch,
    invalidate,
    comboEndpoint,
    comboLabel,
    comboFormik,
    value,
    onChange,
    ...remaining
  } = props

  return (
    <>
      <div style={{ display: 'flex' }}>
        {/* GridToolbar */}
        <GridToolbar
          onSearch={onSearch}
          onSearchClear={onSearchClear}
          labels={labels}
          inputSearch={inputSearch}
          {...remaining}
        >
          {children}
        </GridToolbar>

        {/* Box containing added combo*/}
        <Box sx={{ display: 'flex', width: '350px', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
          <ResourceComboBox
            endpointId={comboEndpoint}
            labels={comboLabel}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            name='corId'
            values={{
              corId: value
            }}
            valueField='recordId'
            displayField={['reference', 'name']}
            onChange={(event, newValue) => {
              onChange(newValue?.recordId)
            }}
          />
        </Box>
      </div>
    </>
  )
}
