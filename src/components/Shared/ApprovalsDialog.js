import ConfirmationDialog from '../ConfirmationDialog'

const ApprovalsDialog = ({ window, responseValue, onConfirm, fullScreen }) => {
  console.log('ApprovalsDialog responseValue:', responseValue)

  return (
    <ConfirmationDialog
      DialogText={`Are you sure you want to ${responseValue === 2 ? 'approve' : 'reject'} this document`}
      okButtonAction={() => {
        onConfirm()
        window.close()
      }}
      fullScreen={fullScreen}
      cancelButtonAction={() => {
        window.close()
      }}
    />
  )
}

export default ApprovalsDialog
