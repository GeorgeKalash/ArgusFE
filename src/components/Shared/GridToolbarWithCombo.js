import GridToolbar from './GridToolbar'
import { Box } from '@mui/material'
import ResourceComboBox from './ResourceComboBox'
import { useFormik } from 'formik'
import * as yup from 'yup'

export default function GridToolbarWithCombo(props) {
  const {
    children,
    labels,
    inputSearch,
    onSearchClear,
    onSearch,
    comboEndpoint,
    comboLabel,
    fetchGridData,
    comboFormik,
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
            values={comboFormik.values}
            valueField='recordId'
            displayField={['reference', 'name']}
            required
            onChange={(event, newValue) => {
              if (newValue) {
                comboFormik.setFieldValue('corId', newValue?.recordId)
              } else {
                comboFormik.setFieldValue('corId', 0)
              }
              console.log('fomrik test 1 ', newValue)
              fetchGridData({ corId: comboFormik.values.corId })
            }}
          />
        </Box>
      </div>
    </>
  )
}
