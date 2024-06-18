export const getRpbList = platformLabels => [
  {
    key: 'Cash Transaction',
    label: platformLabels.CashTransaction,
    color: '#231F20',
    image: 'popup-window.png',
    main: false
  },
  {
    key: 'Clear',
    label: platformLabels.Clear,
    condition: 'isCleared',
    onClick: 'onClear',
    color: '#f44336',
    image: 'clear.png',
    main: true
  },
  {
    key: 'Submit',
    label: platformLabels.Submit,
    condition: 'isSaved',
    onClick: 'onSave',
    color: '#4eb558',
    disabled: 'disabledSubmit || isPosted || isClosed',
    image: 'save.png',
    main: true
  }
]
