import { ILikeTask, timeInTask } from './util'
import { describe, expect, it } from 'vitest'
// import dayjs from 'dayjs'

describe('timeInTask', () => {
  it('should return true if the given time is within the task time range', () => {
    const task: ILikeTask = {
      startTime: '2021-01-01',
      endTime: '2021-01-03',
      children: [
        {
          startTime: '2021-01-01',
          endTime: '2021-01-02'
        },
        {
          startTime: '2021-01-02',
          endTime: '2021-01-05'
        },
        {
          startTime: '2021-01-05',
          endTime: '2021-01-06'
        }
      ]
    }

    const t1 = '2020-12-20'
    const result = timeInTask(t1, task)
    expect(result).toBe(false)
    const t2 = '2021-01-01'
    const result2 = timeInTask(t2, task)
    expect(result2).toBe(true)
    const t3 = '2021-01-06'
    const result3 = timeInTask(t3, task)
    expect(result3).toBe(false)
  })

  // it('should return false if the given time is before the task start time', () => {
  //   const task: ILikeTask = {
  //     startTime: '2021-01-01T08:00:00Z',
  //     endTime: '2021-01-01T10:00:00Z'
  //   }

  //   const t = '2021-01-01T07:30:00Z'
  //   const result = timeInTask(dayjs(t), task)
  //   expect(result).toBe(false)
  // })

  // it('should return false if the given time is after the task end time', () => {
  //   const task: ILikeTask = {
  //     startTime: '2021-01-01T08:00:00Z',
  //     endTime: '2021-01-01T10:00:00Z'
  //   }

  //   const t = '2021-01-01T10:30:00Z'
  //   const result = timeInTask(dayjs(t), task)
  //   expect(result).toBe(false)
  // })

  // it('should handle null unit and includeStr parameters', () => {
  //   const task: ILikeTask = {
  //     startTime: '2021-01-01T08:00:00Z',
  //     endTime: '2021-01-01T10:00:00Z'
  //   }

  //   const t = '2021-01-01T09:00:00Z'
  //   const result = timeInTask(dayjs(t), task, null, '[]')
  //   expect(result).toBe(true)
  // })
})
