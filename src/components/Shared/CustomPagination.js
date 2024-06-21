import React, { useState } from 'react'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import LastPageIcon from '@mui/icons-material/LastPage'
import { IconButton, Box, TextField, Button } from '@mui/material'
import { styled } from '@mui/material/styles'

const PaginationContainer = styled(Box)({
  width: '100%',
  backgroundColor: '#fff',
  borderTop: '1px solid #ccc',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px 0'
})

const CustomPagination = ({ currentPage, totalPages, goToPage }) => {
  const [pageNumber, setPageNumber] = useState(currentPage)

  const handleInputChange = event => {
    setPageNumber(event.target.value)
  }

  const handlePageNavigation = () => {
    const page = Number(pageNumber)
    if (page >= 1 && page <= totalPages) {
      goToPage(page)
    }
  }

  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      handlePageNavigation()
    }
  }

  return (
    <PaginationContainer>
      <IconButton aria-label='First Page' onClick={() => goToPage(1)}>
        <FirstPageIcon />
      </IconButton>
      <IconButton aria-label='Previous Page' onClick={() => goToPage(currentPage - 1)}>
        <NavigateBeforeIcon />
      </IconButton>
      <TextField
        type='number'
        value={pageNumber}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        inputProps={{
          min: 1,
          max: totalPages,
          style: { width: '50px', textAlign: 'center' }
        }}
        style={{ margin: '0 10px' }}
      />
      <Button onClick={handlePageNavigation}>Go</Button>
      <span>of {totalPages}</span>
      <IconButton aria-label='Next Page' onClick={() => goToPage(currentPage + 1)}>
        <NavigateNextIcon />
      </IconButton>
      <IconButton aria-label='Last Page' onClick={() => goToPage(totalPages)}>
        <LastPageIcon />
      </IconButton>
    </PaginationContainer>
  )
}

export default CustomPagination
