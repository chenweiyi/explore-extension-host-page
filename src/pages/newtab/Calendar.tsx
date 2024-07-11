import withSuspense from '@src/shared/hoc/withSuspense'
import * as d3 from 'd3'

type IStatus = Array<
  'doing' | 'parallel' | 'coming-soon' | 'expiring-soon' | 'delay' | 'done'
>
type IChildTaskType = 'start' | 'block' | 'area' | 'end'

type IChildTask = {
  name: string
  color: string
  startTime: Date
  endTime: Date
  level: number
  type: IChildTaskType
  pid: string
}

type ITask = {
  name: string
  color: string
  startTime: Date
  endTime: Date
  level: number
  status: IStatus
  children?: Array<IChildTask>
}

const colors = [
  '#5B8FF9',
  '#E8684A',
  '#9270CA',
  '#269A99',
  '#BEDED1',
  '#EFE0B5',
  '#B5D7E5',
  '#F4DBC6',
  '#F2CADA'
]
const activeColor = '#95d475'
const defaultBlockColor = '#f4f4f5'

const tasks: ITask[] = [
  {
    name: 'task1',
    color: colors[0],
    startTime: dayjs('2024-07-01').toDate(),
    endTime: dayjs('2024-07-04').toDate(),
    level: 0,
    status: ['done'],
    children: [
      {
        startTime: dayjs('2024-07-01').toDate(),
        endTime: dayjs('2024-07-03').toDate(),
        type: 'start',
        level: 0,
        name: 'task1-0',
        pid: 'task1',
        color: colors[0]
      },
      {
        startTime: dayjs('2024-07-03').toDate(),
        endTime: dayjs('2024-07-08').toDate(),
        type: 'block',
        level: 0,
        name: 'task1-1',
        pid: 'task1',
        color: defaultBlockColor
      },
      {
        startTime: dayjs('2024-07-08').toDate(),
        endTime: dayjs('2024-07-09').toDate(),
        type: 'end',
        level: 0,
        name: 'task1-2',
        pid: 'task1',
        color: colors[0]
      }
    ]
  },
  {
    name: 'task2',
    color: colors[1],
    startTime: dayjs('2024-07-03').toDate(),
    endTime: dayjs('2024-07-05').toDate(),
    level: 1,
    status: ['delay'],
    children: [
      {
        startTime: dayjs('2024-07-03').toDate(),
        endTime: dayjs('2024-07-04').toDate(),
        type: 'start',
        level: 1,
        name: 'task2-0',
        pid: 'task2',
        color: colors[1]
      },
      {
        startTime: dayjs('2024-07-04').toDate(),
        endTime: dayjs('2024-07-07').toDate(),
        type: 'block',
        level: 1,
        name: 'task2-1',
        pid: 'task2',
        color: defaultBlockColor
      },
      {
        startTime: dayjs('2024-07-07').toDate(),
        endTime: dayjs('2024-07-08').toDate(),
        type: 'end',
        level: 1,
        name: 'task2-2',
        pid: 'task2',
        color: colors[1]
      }
    ]
  },
  {
    name: 'task3',
    color: colors[2],
    startTime: dayjs('2024-07-04').toDate(),
    endTime: dayjs('2024-07-07').toDate(),
    level: 2,
    status: ['done']
  },
  {
    name: 'task4',
    color: colors[3],
    startTime: dayjs('2024-07-09').toDate(),
    endTime: dayjs('2024-07-10').toDate(),
    level: 0,
    status: ['doing']
  },
  {
    name: 'task5',
    color: colors[4],
    startTime: dayjs('2024-07-10').toDate(),
    endTime: dayjs('2024-07-12').toDate(),
    level: 0,
    status: ['coming-soon']
  }
]

const Calendar = () => {
  const [tabItems, setTabItems] = useState([])
  function renderChart() {
    const barHeight = 30
    const barPadding = 30
    const offsetDate = 2
    const textColor = 'black'
    const textFontSize = '10px'
    const hoverBarStrokeColor = 'red'
    const hoverLineStrokeColor = 'red'
    const hoverTickFillColor = 'red'
    const hoverTickFontSize = '12px'
    const todayColor = 'rgba(243, 150, 17, 0.2)'

    let taskLevels = [...new Set(tasks.map((t) => t.level + ''))]

    let hoverData: ITask | IChildTask | null = null
    let activeData: ITask | null = null
    let restoreData: ITask | null = null
    let zooming = false

    function getIntervalNum(transform) {
      if (transform.k >= 1) {
        return 1
      } else if (transform.k >= 0.8 && transform.k < 1) {
        return 2
      } else if (transform.k >= 0.6 && transform.k < 0.8) {
        return 3
      } else if (transform.k >= 0.5 && transform.k < 0.6) {
        return 4
      } else if (transform.k >= 0.4 && transform.k < 0.5) {
        return 5
      }
      return 6
    }

    const startTime = dayjs(d3.min(tasks, (t) => t.startTime))
      .subtract(offsetDate, 'day')
      .toDate()
    const endTime = dayjs(d3.max(tasks, (t) => t.endTime))
      .add(offsetDate, 'day')
      .toDate()

    const svg = d3.select('.calendar-container svg')
    const margin = { top: 20, right: 50, bottom: 30, left: 50 }
    const width = +svg.attr('width') - margin.left - margin.right
    const height = +svg.attr('height') - margin.top - margin.bottom

    const minTime = dayjs(d3.min(tasks, (t) => t.startTime))
      .subtract(offsetDate, 'day')
      .toDate()
    const maxTime = dayjs(d3.max(tasks, (t) => t.endTime))
      .add(offsetDate, 'day')
      .toDate()

    // 创建初始化x轴缩放比例
    const initialXScale = d3
      .scaleTime()
      .domain([startTime, endTime])
      .rangeRound([0, width])

    const initialTransform = genTransform(minTime, maxTime)
    let newTransform = initialTransform

    console.log('initialTransform:', initialTransform)

    function genTransform(st, et) {
      return d3.zoomIdentity
        .scale(width / (initialXScale(et) - initialXScale(st)))
        .translate(-initialXScale(st), 0)
    }

    /**
     * 高亮柱子
     */
    function highlightBar(d: ITask | IChildTask, x, y, transform) {
      if (d.name === activeData?.name) return
      let st, et
      if (Object.prototype.hasOwnProperty.call(d, 'pid')) {
        d3.selectAll('.bar-group').each(function (_d: ITask, i) {
          if (_d.name === (d as IChildTask).pid) {
            d3.select(this)
              .selectAll('.bar')
              .each(function (_d: ITask | IChildTask, i) {
                if (_d.name === d.name) {
                  d3.select(this)
                    .style('stroke', hoverBarStrokeColor)
                    .style('stroke-width', '1px')
                }
              })
          }
        })
        st = (d as IChildTask).startTime
        et = (d as IChildTask).endTime
      } else {
        d3.selectAll('.bar-group').each(function (_d: ITask, i) {
          if (_d.name === d.name) {
            d3.select(this)
              .style('stroke', hoverBarStrokeColor)
              .style('stroke-width', '1px')
          }
        })
        st = (d as ITask).children?.length
          ? (d as ITask).children[0].startTime
          : (d as ITask).startTime
        et = (d as ITask).children?.length
          ? (d as ITask).children[(d as ITask).children.length - 1].endTime
          : (d as ITask).endTime
      }

      // 添加左侧虚线
      g.append('line')
        .attr('class', 'dashed-line')
        .attr('x1', x(st))
        .attr('y1', y(d.level + '') + barHeight / 2)
        .attr('x2', x(st))
        .attr('y2', height)
        .style('stroke', hoverLineStrokeColor)
        .style('stroke-dasharray', '5,5')
        .datum(d)

      // 添加右侧虚线
      g.append('line')
        .attr('class', 'dashed-line')
        .attr('x1', x(et))
        .attr('y1', y(d.level + '') + barHeight / 2)
        .attr('x2', x(et))
        .attr('y2', height)
        .style('stroke', hoverLineStrokeColor)
        .style('stroke-dasharray', '5,5')
        .datum(d)

      d3.selectAll('.axis--x .tick text')
        .filter(
          (_d: { time: Date }) =>
            dayjs(_d.time).isSame(dayjs(st)) || dayjs(_d.time).isSame(dayjs(et))
        )
        .style('fill', hoverTickFillColor)
        .style('font-size', hoverTickFontSize)
    }

    /**
     * 清除柱子的高亮样式
     */
    function clearHighlightBar(d: ITask | IChildTask, x, y, transform) {
      if (!d) return
      let st, et
      if (Object.prototype.hasOwnProperty.call(d, 'pid')) {
        d3.selectAll('.bar-group').each(function (_d: ITask, i) {
          if (_d.name === (d as IChildTask).pid) {
            d3.select(this)
              .selectAll('.bar')
              .each(function (_d: ITask | IChildTask, i) {
                if (_d.name === d.name) {
                  d3.select(this).style('stroke', 'inherit')
                  d3.select(this).style('stroke-width', 'inherit')
                }
              })
          }
        })
        st = (d as IChildTask).startTime
        et = (d as IChildTask).endTime
      } else {
        d3.selectAll('.bar-group').each(function (_d: ITask, i) {
          if (_d.name === d.name) {
            d3.select(this).style('stroke', 'none')
          }
        })
        st = (d as ITask).children?.length
          ? (d as ITask).children[0].startTime
          : (d as ITask).startTime
        et = (d as ITask).children?.length
          ? (d as ITask).children[(d as ITask).children.length - 1].endTime
          : (d as ITask).endTime
      }

      g.selectAll('.dashed-line')
        .filter((_d: ITask) => _d.name === d.name)
        .remove()

      // 还原x轴标签样式
      d3.selectAll('.axis--x .tick text')
        .filter(
          (_d: { time: Date }) =>
            dayjs(_d.time).isSame(dayjs(st)) || dayjs(_d.time).isSame(dayjs(et))
        )
        .style('fill', textColor)
        .style('font-size', textFontSize)
    }

    function barClickHandler(e, d, x, y, transform) {
      if (zooming) return
      if (d.name !== activeData?.name) {
        // 清除之前激活的tab的样式
        clearHighlightBar(activeData, x, y, newTransform)
        // 高亮新的柱子
        highlightBar(d, x, y, transform)
      } else {
        // 如果是同一个柱子，则取消高亮
        clearHighlightBar(d, x, y, transform)
      }
    }

    function barMouseOverHandler(e, d, x, y, transform) {
      if (zooming) return
      hoverData = d
      highlightBar(d, x, y, transform)
    }

    function barMouseOutHandler(e, d, x, y, transform) {
      if (d.name !== activeData?.name) {
        clearHighlightBar(d, x, y, transform)
      }
      hoverData = null
    }

    function modifyBarAttr(barSelector, x, y, transform) {
      barSelector
        .attr('y', (d, i) => y(d.level + '') + barHeight / 2)
        .attr('x', (d) => x(d.startTime))
        .attr('height', barHeight)
        .attr('width', (d) => x(d.endTime) - x(d.startTime))
        .attr('fill', (d) =>
          d.type === 'block' ? d.color || defaultBlockColor : d.color
        )
        .on('mouseover', function (e, d) {
          barMouseOverHandler.call(this, e, d, x, y, transform)
        })
        .on('mouseout', function (e, d) {
          barMouseOutHandler.call(this, e, d, x, y, transform)
        })
        .on('click', function (e, d) {
          barClickHandler.call(this, e, d, x, y, transform)
          activeData = d
        })
    }

    function modifyBarGroupAttr(barGroupSelector, x, y, transform) {
      const bars = barGroupSelector
        .attr('y', (d, i) => y(d.level + '') + barHeight / 2)
        .attr('x', (d) => {
          if (d.children?.length) {
            return x(d.startTime)
          } else {
            return x(d.startTime)
          }
        })
        .attr('height', barHeight)
        .attr('width', (d) => {
          if (d.children?.length) {
            return (
              x(d.children[d.children.length - 1].endTime) -
              x(d.children[0].startTime)
            )
          } else {
            return x(d.endTime) - x(d.startTime)
          }
        })
        .selectAll('.bar')
        .data((d) => (d.children?.length ? [...d.children] : [d]))

      bars.exit().remove()

      modifyBarAttr(
        bars.enter().append('rect').attr('class', 'bar').merge(bars),
        x,
        y,
        transform
      )
    }

    function modifyTextAttr(textSelector, scaleX) {
      textSelector
        .attr(
          'x',
          (d) =>
            scaleX(d.startTime) + (scaleX(d.endTime) - scaleX(d.startTime)) / 2
        )
        .attr(
          'y',
          (d, i) =>
            height - (d.level + 1) * (barHeight + barPadding) + barHeight / 2
        )
        .attr('text-anchor', 'middle')
        .text((d) => d.name)
    }

    function genXAxis(x, transform, tickFormat?: () => void) {
      return d3
        .axisBottom(x)
        .ticks(d3.timeDay.every(getIntervalNum(transform)))
        .tickFormat(
          // @ts-ignore
          tickFormat ||
            function (val, index) {
              const labelText =
                index === 0
                  ? d3.timeFormat('%Y-%m-%d')(val as Date)
                  : d3.timeFormat('%m-%d')(val as Date)
              // 设置text文字样式
              d3.select(this)
                .style('fill', 'black')
                .style('font-size', '10px')
                .datum({ time: val })

              return labelText
            }
        )
    }

    function genYAxis(filterTasks: ITask[], taskLevels: string[]) {
      newYScale = d3
        .scaleBand()
        .rangeRound([
          height - barHeight / 2,
          height - taskLevels.length * (barHeight + barPadding) - barHeight / 2
        ])
        .domain(taskLevels.toSorted())
      return d3
        .axisLeft(newYScale)
        .tickValues(taskLevels)
        .tickFormat(function (val, index) {
          // console.log('val:', val)
          return filterTasks
            .filter((t) => t.level === +val)
            .map((t) => t.name)
            .join(',')
        })
    }

    /**
     * 绘制今天
     */
    function renderTodayRect() {
      const todayStart = dayjs().startOf('day').toDate()
      const todayEnd = dayjs().toDate()
      // 移除之前的今天样式
      g.selectAll('.today-area').remove()
      g.selectAll('.today-text').remove()
      // 绘制今天样式
      g.selectAll('.today-area')
        .data([{ todayStart, todayEnd }])
        .enter()
        .append('rect')
        .attr('class', 'today-area')
        .attr('x', newXScale(todayStart))
        .attr('y', 0)
        .attr('width', newXScale(todayEnd) - newXScale(todayStart))
        .attr('height', height)
        .attr('fill', todayColor)

      g.selectAll('.today-text')
        .data([{ todayStart, todayEnd }])
        .enter()
        .append('text')
        .attr('class', 'today-text')
        .attr(
          'x',
          newXScale(todayStart) +
            (newXScale(todayEnd) - newXScale(todayStart)) / 2
        )
        .attr('y', 30)
        .text('今天')
        .style('font-size', '10px')
        .attr('writing-mode', 'vertical-lr')
        .attr('letter-spacing', '4')
    }

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const x = d3.scaleTime().domain([startTime, endTime]).rangeRound([0, width])
    let newXScale = x
    const y = d3
      .scaleBand()
      .rangeRound([
        height - barHeight / 2,
        height - taskLevels.length * (barHeight + barPadding) - barHeight / 2
      ])
      .domain(taskLevels)
    let newYScale = y

    console.log('0 -> time:', x.invert(0))
    console.log('end -> time:', x.invert(width))
    console.log('task[0] - value:', y('0'))
    console.log('task[1] - value:', y('1'))

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${height})`)
      // @ts-ignore
      .call(genXAxis(x, initialTransform))

    g.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', `translate(0, 0)`)
      // @ts-ignore
      .call(genYAxis(tasks, taskLevels))

    g.selectAll('.axis--y .tick text').each(function (d, i) {
      const self = d3.select(this)
      const text = self.text()
      const split = text.split(',')
      if (split.length > 1) {
        self.text('')
        split.forEach((t, i) => {
          self
            .append('tspan')
            .attr('x', '-10')
            .attr('dy', i === 0 ? 0 : '1em')
            .text(t)
        })
      }
    })

    renderTodayRect()

    modifyBarGroupAttr(
      g
        .selectAll('.bar-group')
        .data(tasks)
        .enter()
        .append('g')
        .attr('class', 'bar-group'),
      x,
      y,
      initialTransform
    )

    // modifyTextAttr(
    //   g
    //     .selectAll('.bar-label')
    //     .data(tasks)
    //     .enter()
    //     .append('text')
    //     .attr('class', 'bar-label'),
    //   x
    // )

    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 10])
      .on('start', zoomStart)
      .on('zoom', zoomed)
      .on('end', zoomEnd)

    function zoomStart() {
      zooming = true
      // 清除旧的样式
      clearHighlightBar(hoverData, newXScale, newYScale, newTransform)
      hoverData = null
      // 缩放时先清除激活的柱子，等缩放结束后再高亮激活的柱子
      clearHighlightBar(activeData, newXScale, newYScale, newTransform)
      restoreData = activeData
      activeData = null
    }

    function zoomEnd() {
      zooming = false
      if (restoreData) {
        highlightBar(restoreData, newXScale, newYScale, newTransform)
        activeData = restoreData
        restoreData = null
      }
    }

    function zoomed(event) {
      newXScale = event.transform.rescaleX(x)
      newTransform = event.transform
      // console.log('transform:', newTransform)
      const st = newXScale.invert(0)
      const et = newXScale.invert(width)
      const filterTasks: ITask[] = tasks.filter((t) => {
        if (!t.children || t.children.length === 0) {
          return !(t.endTime < st || t.startTime > et)
        } else {
          return !(
            t.children[t.children.length - 1].endTime < st ||
            t.children[0].startTime > et
          )
        }
      })
      taskLevels = [...new Set(filterTasks.map((t) => t.level + ''))]

      // 更新x轴
      svg
        .select('.axis--x')
        // @ts-ignore
        .call(genXAxis(newXScale, newTransform))

      // 更新y轴
      svg
        .select('.axis--y')
        // @ts-ignore
        .call(genYAxis(filterTasks, taskLevels))

      g.selectAll('.axis--y .tick text').each(function (d, i) {
        const self = d3.select(this)
        const text = self.text()
        const split = text.split(',')
        if (split.length > 1) {
          self.text('')
          split.forEach((t, i) => {
            self
              .append('tspan')
              .attr('x', '-10')
              .attr('dy', i === 0 ? '0' : '1em')
              .text(t)
          })
        }
      })

      renderTodayRect()

      // 绘制柱状图
      const barGroup = g
        .selectAll('.bar-group')
        .data(filterTasks, (d: ITask) => d.name)

      barGroup.exit().remove()

      modifyBarGroupAttr(
        // @ts-ignore
        barGroup.enter().append('g').attr('class', 'bar-group').merge(barGroup),
        newXScale,
        newYScale,
        newTransform
      )

      // g.selectAll('.bar-label').remove()

      // modifyTextAttr(
      //   g
      //     .selectAll('.bar-label')
      //     .data(tasks)
      //     .enter()
      //     .append('text')
      //     .attr('class', 'bar-label'),
      //   newXScale
      // )
    }

    // @ts-ignore
    svg.call(zoom).call(zoom.transform, initialTransform)

    const jumpToTask = (t: ITask) => {
      if (activeData?.name === t.name) {
        // 如果是同一个柱子，则还原transform
        // @ts-ignore
        svg.call(zoom.transform, initialTransform)
        // 如果是同一个柱子，则取消高亮
        barClickHandler(null, t, newXScale, newYScale, newTransform)
        activeData = null
      } else {
        svg.call(
          // @ts-ignore
          zoom.transform,
          genTransform(
            dayjs(t.children?.length ? t.children[0].startTime : t.startTime)
              .subtract(offsetDate, 'day')
              .toDate(),
            dayjs(
              t.children?.length
                ? t.children[t.children.length - 1].endTime
                : t.endTime
            )
              .add(offsetDate, 'day')
              .toDate()
          )
        )
        // 如果点击的是不同的柱子，则高亮柱子
        barClickHandler(null, t, newXScale, newYScale, newTransform)
        activeData = t
      }
    }

    const TaskList = (props: { data: ITask[] }) => {
      return props.data.length > 0 ? (
        <ul>
          {props.data.map((t, i) => (
            <li
              key={i}
              className='py-8px px-4px cursor-pointer hover:bg-emerald-200'
              onClick={() => jumpToTask(t)}
            >
              <div className='text-14px'>{t.name}</div>
              <div className='text-12px text-gray-500'>
                <span>{dayjs(t.startTime).format('YYYY-MM-DD')}</span>
                <span> -- </span>
                <span>{dayjs(t.endTime).format('YYYY-MM-DD')}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className='pl-40px pt-14px'>暂无数据</div>
      )
    }

    const tabItems = [
      {
        key: 'doing',
        label: '正在进行',
        children: (
          <TaskList data={tasks.filter((t) => t.status.includes('doing'))} />
        )
      },
      {
        key: 'parallel',
        label: '并行中',
        children: (
          <TaskList data={tasks.filter((t) => t.status.includes('parallel'))} />
        )
      },
      {
        key: 'coming-soon',
        label: '即将开始',
        children: (
          <TaskList
            data={tasks.filter((t) => t.status.includes('coming-soon'))}
          />
        )
      },
      {
        key: 'expiring-soon',
        label: '即将过期',
        children: (
          <TaskList
            data={tasks.filter((t) => t.status.includes('expiring-soon'))}
          />
        )
      },
      {
        key: 'delay',
        label: '延期中',
        children: (
          <TaskList data={tasks.filter((t) => t.status.includes('delay'))} />
        )
      },
      {
        key: 'done',
        label: '已完成',
        children: (
          <TaskList data={tasks.filter((t) => t.status.includes('done'))} />
        )
      }
    ]
    setTabItems(tabItems)
  }

  useEffect(renderChart, [])

  return (
    <div className='flex w-full h-full px-200px items-center justify-between'>
      <div className='calendar-container w-800px h-400px'>
        <svg
          width='800'
          height='400'
          style={{ backgroundColor: '#f4f4f5' }}
        ></svg>
      </div>
      <div className='w-500px h-400px'>
        <ATabs items={tabItems} defaultActiveKey='doing'></ATabs>
      </div>
    </div>
  )
}

export default withSuspense(Calendar)
