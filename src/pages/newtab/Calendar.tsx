import withSuspense from '@src/shared/hoc/withSuspense'
import * as d3 from 'd3'

type IChildTask = {
  startTime: Date
  endTime: Date
  type: 'start' | 'block' | 'area' | 'end'
}

type ITask = {
  name: string
  color?: string
  startTime: Date
  endTime: Date
  level: number
  children?: Array<IChildTask>
}

const defaultColor = '#b3e19d'
const activeColor = '#95d475'

const tasks: ITask[] = [
  {
    name: 'task1',
    color: defaultColor,
    startTime: dayjs('2024-07-01').toDate(),
    endTime: dayjs('2024-07-04').toDate(),
    level: 0,
    children: [
      {
        startTime: dayjs('2024-07-01').toDate(),
        endTime: dayjs('2024-07-03').toDate(),
        type: 'start'
      },
      {
        startTime: dayjs('2024-07-03').toDate(),
        endTime: dayjs('2024-07-07').toDate(),
        type: 'block'
      },
      {
        startTime: dayjs('2024-07-09').toDate(),
        endTime: dayjs('2024-07-10').toDate(),
        type: 'end'
      }
    ]
  },
  {
    name: 'task2',
    color: defaultColor,
    startTime: dayjs('2024-07-03').toDate(),
    endTime: dayjs('2024-07-05').toDate(),
    level: 1,
    children: [
      {
        startTime: dayjs('2024-07-03').toDate(),
        endTime: dayjs('2024-07-04').toDate(),
        type: 'start'
      },
      {
        startTime: dayjs('2024-07-04').toDate(),
        endTime: dayjs('2024-07-07').toDate(),
        type: 'block'
      },
      {
        startTime: dayjs('2024-07-07').toDate(),
        endTime: dayjs('2024-07-08').toDate(),
        type: 'end'
      }
    ]
  },
  {
    name: 'task3',
    color: defaultColor,
    startTime: dayjs('2024-07-04').toDate(),
    endTime: dayjs('2024-07-07').toDate(),
    level: 2
  },
  {
    name: 'task4',
    color: defaultColor,
    startTime: dayjs('2024-07-10').toDate(),
    endTime: dayjs('2024-07-12').toDate(),
    level: 0
  }
]

const Calendar = () => {
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

    let hoverData: ITask | null = null
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

    const initialTransform = d3.zoomIdentity
      .scale(width / (initialXScale(maxTime) - initialXScale(minTime)))
      .translate(-initialXScale(minTime), 0)
    let newTransform = initialTransform

    console.log('initialTransform:', initialTransform)

    /**
     * 高亮柱子
     */
    function highlightBar(d, x, transform) {
      if (d.name === activeData?.name) return
      const i = tasks.findIndex((t) => t.name === d.name)
      d3.selectAll('.bar')
        .filter((_, _i) => _i === i)
        .style('stroke', hoverBarStrokeColor)
        .style('stroke-width', '1px')
        .attr('fill', activeColor)
      // 添加左侧虚线
      g.append('line')
        .attr('class', 'dashed-line')
        .attr('x1', x(d.startTime))
        .attr('y1', height - (d.level + 1) * (barHeight + barPadding))
        .attr('x2', x(d.startTime))
        .attr('y2', height)
        .style('stroke', hoverLineStrokeColor)
        .style('stroke-dasharray', '5,5')
        .datum(d)

      // 添加右侧虚线
      g.append('line')
        .attr('class', 'dashed-line')
        .attr('x1', x(d.endTime))
        .attr('y1', height - (d.level + 1) * (barHeight + barPadding))
        .attr('x2', x(d.endTime))
        .attr('y2', height)
        .style('stroke', hoverLineStrokeColor)
        .style('stroke-dasharray', '5,5')
        .datum(d)

      d3.selectAll('.axis--x .tick text')
        .filter(
          (_d: { time: Date }) =>
            dayjs(_d.time).isSame(dayjs(d.startTime)) ||
            dayjs(_d.time).isSame(dayjs(d.endTime))
        )
        .style('fill', hoverTickFillColor)
        .style('font-size', hoverTickFontSize)
    }

    /**
     * 清除柱子的高亮样式
     */
    function clearHighlightBar(d, x, transform) {
      if (!d) return
      const index = tasks.findIndex((t) => t.name === d.name)
      d3.selectAll('.bar')
        .filter((_, i) => i === index)
        .style('stroke', 'none')
        .attr('fill', defaultColor)
      g.selectAll('.dashed-line')
        .filter((_d: ITask) => _d.name === d.name)
        .remove()

      // 还原x轴标签样式
      d3.selectAll('.axis--x .tick text')
        .filter(
          (_d: { time: Date }) =>
            dayjs(_d.time).isSame(dayjs(d.startTime)) ||
            dayjs(_d.time).isSame(dayjs(d.endTime))
        )
        .style('fill', textColor)
        .style('font-size', textFontSize)
    }

    function barClickHandler(e, d, x, transform) {
      if (zooming) return
      if (d.name !== activeData?.name) {
        // 清除之前激活的tab的样式
        clearHighlightBar(activeData, newXScale, newTransform)
        // 高亮新的柱子
        highlightBar(d, x, transform)
        activeData = d
      } else {
        // 如果是同一个柱子，则取消高亮
        clearHighlightBar(d, x, transform)
        activeData = null
      }
    }

    function barMouseOverHandler(e, d, x, transform) {
      if (zooming) return
      hoverData = d
      highlightBar(d, x, transform)
    }

    function barMouseOutHandler(e, d, x, transform) {
      if (d.name !== activeData?.name) {
        clearHighlightBar(d, x, transform)
      }
      hoverData = null
    }

    function modifyBarAttr(barSelector, scaleX, transform) {
      barSelector
        .attr('y', (d, i) => height - (d.level + 1) * (barPadding + barHeight))
        .attr('x', (d) => scaleX(d.startTime))
        .attr('height', barHeight)
        .attr('width', (d) => scaleX(d.endTime) - scaleX(d.startTime))
        .attr('fill', (d) => d.color)
        .on('mouseover', function (e, d) {
          barMouseOverHandler.call(this, e, d, scaleX, transform)
        })
        .on('mouseout', function (e, d) {
          barMouseOutHandler.call(this, e, d, scaleX, transform)
        })
        .on('click', function (e, d) {
          barClickHandler.call(this, e, d, scaleX, transform)
        })
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
                  ? // ? d3.timeFormat('%Y-%m-%d')(val as Date)
                    null
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

    function genYAxis(y, x, transform) {
      const st = x.invert(0)
      const et = x.invert(width)
      const filterTasks: ITask[] = tasks.filter(
        (t) => !(t.endTime < st || t.startTime > et)
      )
      // console.log('filterTasks:', filterTasks)
      taskLevels = [...new Set(filterTasks.map((t) => t.level + ''))]
      newYScale = d3
        .scaleBand()
        .rangeRound([
          height - barHeight / 2,
          height - taskLevels.length * (barHeight + barPadding) - barHeight / 2
        ])
        .domain(taskLevels.toSorted())
      return d3
        .axisLeft(newYScale)
        .tickValues(filterTasks.map((t) => t.level + ''))
        .tickFormat(function (val, index) {
          console.log('val:', val)
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
      .call(genYAxis(y, x, initialTransform))

    g.selectAll('.axis--y .tick text').each(function (d, i) {
      const self = d3.select(this)
      const text = self.text()
      const split = text.split(',')
      if (split.length > 1) {
        self.text('')
        split.forEach((t, i) => {
          self.append('tspan').attr('x', '-10').attr('dy', `${i}em`).text(t)
        })
      }
    })

    renderTodayRect()

    modifyBarAttr(
      g
        .selectAll('.bar')
        .data(tasks)
        .enter()
        .append('rect')
        .attr('class', 'bar'),
      x,
      initialTransform
    )

    modifyTextAttr(
      g
        .selectAll('.bar-label')
        .data(tasks)
        .enter()
        .append('text')
        .attr('class', 'bar-label'),
      x
    )

    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 10])
      .on('start', zoomStart)
      .on('zoom', zoomed)
      .on('end', zoomEnd)

    function zoomStart(event) {
      zooming = true
      // 清除旧的样式
      clearHighlightBar(hoverData, newXScale, newTransform)
      hoverData = null
      clearHighlightBar(activeData, newXScale, newTransform)
      restoreData = activeData
      activeData = null
    }

    function zoomEnd() {
      zooming = false
      if (restoreData) {
        highlightBar(restoreData, newXScale, newTransform)
        activeData = restoreData
        restoreData = null
      }
    }

    function zoomed(event) {
      newXScale = event.transform.rescaleX(x)
      newTransform = event.transform
      // console.log('transform:', newTransform)

      // 更新x轴
      svg
        .select('.axis--x')
        // @ts-ignore
        .call(genXAxis(newXScale, newTransform))

      // 更新y轴
      svg
        .select('.axis--y')
        // @ts-ignore
        .call(genYAxis(y, newXScale, newTransform))

      g.selectAll('.axis--y .tick text').each(function (d, i) {
        const self = d3.select(this)
        const text = self.text()
        const split = text.split(',')
        if (split.length > 1) {
          self.text('')
          split.forEach((t, i) => {
            self.append('tspan').attr('x', '-10').attr('dy', `${i}em`).text(t)
          })
        }
      })

      renderTodayRect()

      // 绘制柱状图
      g.selectAll('.bar').remove()

      modifyBarAttr(
        g
          .selectAll('.bar')
          .data(tasks)
          .enter()
          .append('rect')
          .attr('class', 'bar'),
        newXScale,
        event.transform
      )

      g.selectAll('.bar-label').remove()

      modifyTextAttr(
        g
          .selectAll('.bar-label')
          .data(tasks)
          .enter()
          .append('text')
          .attr('class', 'bar-label'),
        newXScale
      )
    }

    // @ts-ignore
    svg.call(zoom).call(zoom.transform, initialTransform)
  }

  useEffect(renderChart, [])

  return (
    <div className='calendar-container w-800px h-400px'>
      <svg width='800' height='400' style={{ backgroundColor: '#fff' }}></svg>
    </div>
  )
}

export default withSuspense(Calendar)
