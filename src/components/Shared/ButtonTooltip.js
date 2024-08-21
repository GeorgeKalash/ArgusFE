import React from 'react'

const ButtonTooltip = ({ tooltip }) => {
  return (
    <>
      <style>
        {`
          .button-container {
            position: relative;
            display: inline-block;
          }
          .toast {
            position: absolute;
            top: -30px;
            background-color: #333333ad;
            color: white;
            padding: 3px 7px;
            border-radius: 7px;
            opacity: 0;
            transition: opacity 0.3s, top 0.3s;
            z-index: 1 !important;
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            display: none;
            }
          .button-container:hover .toast {
            opacity: 1;
            top: -40px;
            display: inline;
          }
          }
        `}
      </style>
      <div className='toast'>{tooltip}</div>
    </>
  )
}

export default ButtonTooltip
