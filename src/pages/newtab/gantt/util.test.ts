import { ILikeTask, timeInTask } from './util'
import { describe, expect, it } from 'vitest'
// import dayjs from 'dayjs'

describe('timeInTask', () => {
  it('should return false if the given time is less then the task time range', () => {
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
  })

  it('should return true if the given time is equal the task start time', () => {
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

    const t1 = '2021-01-01'
    const result = timeInTask(t1, task)
    expect(result).toBe(true)
  })

  it('should return true if the given time is between the task time', () => {
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

    const t1 = '2021-01-03'
    const result = timeInTask(t1, task)
    expect(result).toBe(true)
  })

  it('should return false if the given time is equal the task end time', () => {
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

    const t1 = '2021-01-06'
    const result = timeInTask(t1, task)
    expect(result).toBe(false)
  })

  it('should return false if the given time is greater then the task end time', () => {
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

    const t1 = '2021-01-08'
    const result = timeInTask(t1, task)
    expect(result).toBe(false)
  })

  it('The time of the subtasks of the task as a reference', () => {
    const task: ILikeTask = {
      startTime: '2021-01-01',
      endTime: '2021-01-03',
      children: [
        {
          startTime: '2021-01-05',
          endTime: '2021-01-06'
        },
        {
          startTime: '2021-01-06',
          endTime: '2021-01-09'
        },
        {
          startTime: '2021-01-09',
          endTime: '2021-01-10'
        }
      ]
    }

    const t1 = '2021-01-02'
    const result = timeInTask(t1, task)
    expect(result).toBe(false)

    const t2 = '2021-01-05'
    const result2 = timeInTask(t2, task)
    expect(result2).toBe(true)

    const t3 = '2021-01-08'
    const result3 = timeInTask(t3, task)
    expect(result3).toBe(true)

    const t4 = '2021-01-10'
    const result4 = timeInTask(t4, task)
    expect(result4).toBe(false)
  })
})
