import { IChildTaskType, ITask } from './Gantt'

type ILikeTask = {
  startTime: string | Date
  endTime: string | Date
  children?: Array<{
    startTime: string | Date
    endTime: string | Date
  }>
}

type ILikeTask2 = {
  startTime: string | Date
  endTime: string | Date
  children?: Array<{
    startTime: string | Date
    endTime: string | Date
    type: IChildTaskType
  }>
}

/**
 * 时间是否在任务内，包含子任务
 */
export const timeInTask = (
  t,
  task: ILikeTask,
  unit = null,
  includeStr = '[]'
) => {
  const min = task.children?.length
    ? task.children[0].startTime
    : task.startTime
  const max = task.children?.length
    ? task.children[task.children.length - 1].endTime
    : task.endTime
  return dayjs(t).isBetween(dayjs(min), dayjs(max), unit, includeStr)
}

/**
 * 时间是否在多个任务内，包含子任务
 */
export const timeInTasks = (t, tasks: Array<ILikeTask>) => {
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const min = task.children?.length
      ? task.children[0].startTime
      : task.startTime
    const max = task.children?.length
      ? task.children[task.children.length - 1].endTime
      : task.endTime
    return dayjs(t).isBetween(dayjs(min), dayjs(max))
  }
  return false
}

/**
 * 时间是否在工作任务内（不包含block区间），包含子任务
 */
export const timeInWorkTask = (
  t,
  task: ILikeTask2,
  unit = null,
  includeStr = '[]'
) => {
  if (task.children?.length) {
    const filter = task.children.filter((c) => c.type !== 'block')
    const findOne = filter.find((c) => timeInTask(t, c, unit, includeStr))
    return !!findOne
  } else {
    return timeInTask(t, task, unit, includeStr)
  }
}

/**
 * 时间是否在阻塞任务内（包含block区间），包含子任务
 */
export const timeInBlockTask = (
  t,
  task: ILikeTask2,
  unit = null,
  includeStr = '[]'
) => {
  if (task.children?.length) {
    const filter = task.children.filter((c) => c.type === 'block')
    const findOne = filter.find((c) => timeInTask(t, c, unit, includeStr))
    return !!findOne
  } else {
    return false
  }
}

/**
 * 时间是否在多个任务时间之外，包含子任务
 */
export const timeOutTasks = (
  t,
  tasks: Array<ILikeTask2>,
  unit = null,
  includeStr = '[)'
) => {
  let flag = true
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const min = task.children?.length
      ? task.children[0].startTime
      : task.startTime
    const max = task.children?.length
      ? task.children[task.children.length - 1].endTime
      : task.endTime
    if (dayjs(t).isBetween(dayjs(min), dayjs(max), null, includeStr)) {
      flag = false
      break
    }
  }
  return flag
}

export const splitAvaliableTimes = (
  availTimes: string[],
  startTime: string
) => {
  let start = 0
  const arr: Array<{
    type: IChildTaskType
    data: string[]
  }> = []
  console.log('availTimes:', availTimes)
  for (let i = 0; i < availTimes.length; i++) {
    const time = availTimes[i]
    const next = availTimes[i + 1]
    if (!next) {
      const latest = arr[arr.length - 1]
      if (!latest) {
        throw new Error('latest is null')
      }
      latest.data[1] = dayjs(availTimes[i]).add(1, 'day').format('YYYY-MM-DD')
      if (i === availTimes.length - 1) {
        latest.type = 'end' as const
      }
      break
    }
    const diffDays = dayjs(next).diff(dayjs(time), 'day')
    if (i === 0) {
      if (startTime === availTimes[0]) {
        arr.push({
          type: 'start',
          data: [
            availTimes[start],
            dayjs(availTimes[start]).add(1, 'day').format('YYYY-MM-DD')
          ]
        })
      } else if (dayjs(startTime).isBefore(dayjs(availTimes[0]))) {
        arr.push({
          type: 'block',
          data: [startTime, dayjs(availTimes[0]).format('YYYY-MM-DD')]
        })
        arr.push({
          type: 'start',
          data: [
            availTimes[0],
            dayjs(availTimes[0]).add(1, 'day').format('YYYY-MM-DD')
          ]
        })
      } else {
        console.log('startTime:', startTime)
        console.log('availTimes[0]:', availTimes[0])
        throw new Error('startTime > availTimes[0]')
      }
    }
    if (diffDays > 1) {
      arr.push({
        type: 'block',
        data: [
          dayjs(availTimes[i]).add(1, 'day').format('YYYY-MM-DD'),
          dayjs(availTimes[i]).add(diffDays, 'day').format('YYYY-MM-DD')
        ]
      })
      arr.push({
        type: 'area',
        data: [
          dayjs(availTimes[i]).add(diffDays, 'day').format('YYYY-MM-DD'),
          dayjs(availTimes[i])
            .add(diffDays + 1, 'day')
            .format('YYYY-MM-DD')
        ]
      })
    } else {
      const latest = arr[arr.length - 1]
      if (!latest) {
        throw new Error('latest is null')
      }
      latest.data[1] = dayjs(availTimes[i]).add(1, 'day').format('YYYY-MM-DD')
      if (i === availTimes.length - 1) {
        latest.type = 'end' as const
      }
    }
    start = i + 1
  }
  return arr
}

export const AIncludeB = (a: ILikeTask, b: ILikeTask) => {
  const minA = a.children?.length ? a.children[0].startTime : a.startTime
  const maxA = a.children?.length
    ? a.children[a.children.length - 1].endTime
    : a.endTime
  const minB = b.children?.length ? b.children[0].startTime : b.startTime
  const maxB = b.children?.length
    ? b.children[b.children.length - 1].endTime
    : b.endTime
  return (
    dayjs(minA).isSameOrBefore(dayjs(minB)) &&
    dayjs(maxA).isSameOrAfter(dayjs(maxB))
  )
}

export const AIncludeBS = (a: ILikeTask, bs: ILikeTask[]) => {
  let flag = true
  const minA = a.children?.length ? a.children[0].startTime : a.startTime
  const maxA = a.children?.length
    ? a.children[a.children.length - 1].endTime
    : a.endTime
  for (let i = 0; i < bs.length; i++) {
    const b = bs[i]
    const minB = b.children?.length ? b.children[0].startTime : b.startTime
    const maxB = b.children?.length
      ? b.children[b.children.length - 1].endTime
      : b.endTime
    if (
      !(
        dayjs(minA).isSameOrBefore(dayjs(minB)) &&
        dayjs(maxA).isSameOrAfter(dayjs(maxB))
      )
    ) {
      flag = false
      break
    }
  }
  return flag
}

export const simpleCopy = (obj: object) => {
  if (typeof obj !== 'object') {
    throw new Error('simpleCopy: obj must be an object')
  }
  if (obj) {
    return JSON.parse(JSON.stringify(obj))
  } else {
    return {}
  }
}
