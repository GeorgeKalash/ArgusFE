import React from 'react'
import styled from 'styled-components'

const TimelineContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow-x: auto;
  width: 100%;
  padding: 20px;
  border-radius: 15px;
  height: 150px;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`

const TimelineArrow = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #6673fd;
  z-index: 1;
  &::before {
    content: '';
    position: absolute;
    top: -4px;
    right: 0;
    width: 0;
    height: 0;
    border-left: 10px solid #6673fd;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
  }
`

const TimelineItem = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 40px; /* Increased spacing between items */
  text-align: center;
  z-index: 2;
`

const TimelineContent = styled.div`
  position: absolute;
  background: #555;
  color: #fff;
  padding: 10px;
  border-radius: 10px;
  font-size: 14px;
  white-space: nowrap;
`

const TimelineContent1 = styled(TimelineContent)`
  bottom: calc(100% + 10px); /* Position above the arrow */
`

const TimelineContent2 = styled(TimelineContent)`
  top: calc(100% + 10px); /* Position below the arrow */
`

const TimelineIcon = styled.div`
  width: 20px;
  height: 20px;
  background: #6673fd;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 12px;
`

const HorizontalTimeline = ({ data }) => (
  <TimelineContainer>
    <TimelineArrow />
    {data.map((item, index) => (
      <TimelineItem key={index}>
        {index % 2 === 0 ? (
          <TimelineContent1>{item.spRef}</TimelineContent1>
        ) : (
          <TimelineContent2>{item.spRef}</TimelineContent2>
        )}
        <TimelineIcon />
      </TimelineItem>
    ))}
  </TimelineContainer>
)

export default HorizontalTimeline
