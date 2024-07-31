import * as d3 from 'd3'
import { simpleCopy } from './util'

export type IStatus = Array<
  | 'doing'
  | 'blocking'
  | 'coming-soon'
  | 'unstart'
  | 'expiring-soon'
  | 'expired'
  | 'delay'
  | 'done'
>
export type IChildTaskType = 'start' | 'block' | 'area' | 'end'

export type IChildTask = {
  name: string
  color: string
  startTime: string
  endTime: string
  level: number
  type: IChildTaskType
  pid: string
}

export type IChildTask2 = Omit<IChildTask, 'startTime' | 'endTime'> & {
  startTime: Date
  endTime: Date
}

export type ITask = {
  name: string
  color: string
  startTime: string
  endTime: string
  level: number
  status: IStatus
  parallelTimes: string[]
  link?: string
  desc?: string
  children?: Array<IChildTask>
}

export type ITask2 = Omit<ITask, 'children' | 'startTime' | 'endTime'> & {
  startTime: Date
  endTime: Date
  children?: Array<IChildTask2>
}

export type IGanttProps = {
  tasks: ITask[]
  width: number
  height: number
  startTime?: string
  endTime?: string
  onSvgDblClick?: () => void
  onClickBarGroup?: (t: ITask2) => void
}

const Gantt = (props: IGanttProps, ref) => {
  const svgBgColor = '#f4f4f5'
  const barHeight = 30
  const barPadding = 30
  const offsetDate = 2
  const textColor = 'black'
  const textFontSize = '10px'
  const textFontFamily = 'sans-serif'
  const hoverBarStrokeColor = 'red'
  const hoverLineStrokeColor = 'red'
  const hoverTickFillColor = 'red'
  const hoverTickFontSize = '12px'
  const todayColor = 'rgba(243, 150, 17, 0.2)'
  const defaultBlockColor = '#e9e9eb'
  const margin = { top: 20, right: 30, bottom: 30, left: 30 }
  const scaleExtent: [number, number] = [0.2, 15]

  const [power, setPower] = useState({})

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
    } else if (transform.k >= 0.3 && transform.k < 0.4) {
      return 6
    } else if (transform.k >= 0.2 && transform.k < 0.3) {
      return 7
    } else if (transform.k >= 0.1 && transform.k < 0.2) {
      return 8
    } else if (transform.k >= 0.05 && transform.k < 0.1) {
      return 9
    } else if (transform.k >= 0.02 && transform.k < 0.05) {
      return 10
    }
    return 6
  }

  function getMaxYTextByTasks(tasks: ITask2[]) {
    let max = 0
    tasks.forEach((t) => {
      const len = getTextWidth(t.name, `${textFontSize} ${textFontFamily}`)
      max = Math.max(max, len)
    })
    return max
  }

  function transformTasks(tasks: ITask[]): ITask2[] {
    const target: Array<ITask2> = simpleCopy(tasks)
    for (let i = 0; i < target.length; i++) {
      const task = target[i]
      task.startTime = dayjs(task.startTime).toDate()
      task.endTime = dayjs(task.endTime).toDate()
      if (task.children?.length) {
        task.children.forEach((c) => {
          c.startTime = dayjs(c.startTime).toDate()
          c.endTime = dayjs(c.endTime).toDate()
        })
      }
    }
    return target
  }

  function renderChart(props: IGanttProps) {
    const {
      tasks: _tasks,
      startTime: _startTime,
      endTime: _endTime,
      onSvgDblClick,
      onClickBarGroup
    } = props
    let hoverData: ITask2 | IChildTask2 | null = null
    let activeData: ITask2 | null = null
    let restoreData: ITask2 | null = null
    let zooming = false
    let newXScale
    let newYScale
    let newTransform
    const tasks = transformTasks(_tasks)
    const startTime = dayjs(_startTime).toDate()
    const endTime = dayjs(_endTime).toDate()
    let taskLevels = [...new Set(tasks.map((t) => t.level + ''))]
    let maxYText = Math.ceil(getMaxYTextByTasks(tasks))
    // const startTime = dayjs(d3.min(tasks, (t) => t.startTime))
    //   .subtract(offsetDate, 'day')
    //   .toDate()
    // const endTime = dayjs(d3.max(tasks, (t) => t.endTime))
    //   .add(offsetDate, 'day')
    //   .toDate()

    d3.select('.calendar-container .gantt-container').remove()
    const svg = d3
      .select('.calendar-container')
      .append('svg')
      .attr('class', 'gantt-container')
      .attr('width', props.width)
      .attr('height', props.height)
      .style('background-color', svgBgColor)
    const width = +svg.attr('width') - margin.left - margin.right
    const height = +svg.attr('height') - margin.top - margin.bottom

    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip-bar')
      .append('rect')
      .attr('x', maxYText)
      .attr('y', margin.top)
      .attr('width', width - maxYText)
      .attr('height', height)

    // const minTime = dayjs(d3.min(tasks, (t) => t.startTime))
    //   .subtract(offsetDate, 'day')
    //   .toDate()
    // const maxTime = dayjs(d3.max(tasks, (t) => t.endTime))
    //   .add(offsetDate, 'day')
    //   .toDate()

    function genTransform(st, et, x: d3.ScaleTime<number, number, never>) {
      return d3.zoomIdentity.scale(width / (x(et) - x(st))).translate(-x(st), 0)
    }

    // 创建初始化x轴缩放比例
    const initialXScale = d3
      .scaleTime()
      .domain([startTime, endTime])
      .rangeRound([maxYText, width])

    const initialTransform = genTransform(startTime, endTime, initialXScale)
    newTransform = initialTransform

    console.log('initialTransform:', initialTransform)

    /**
     * 高亮柱子
     */
    function highlightBar(d: ITask2 | IChildTask2, x, y, transform) {
      if (d.name === activeData?.name) return
      let st, et
      if (Object.prototype.hasOwnProperty.call(d, 'pid')) {
        d3.selectAll('.bar-group').each(function (_d: ITask2, i) {
          if (_d.name === (d as IChildTask2).pid) {
            d3.select(this)
              .selectAll('.bar')
              .each(function (_d: ITask2 | IChildTask2, i) {
                if (_d.name === d.name) {
                  d3.select(this)
                    .style('stroke', hoverBarStrokeColor)
                    .style('stroke-width', '1px')
                }
              })
          }
        })
        st = (d as IChildTask2).startTime
        et = (d as IChildTask2).endTime
      } else {
        d3.selectAll('.bar-group').each(function (_d: ITask2, i) {
          if (_d.name === d.name) {
            d3.select(this)
              .style('stroke', hoverBarStrokeColor)
              .style('stroke-width', '1px')
          }
        })
        st = (d as ITask2).children?.length
          ? (d as ITask2).children[0].startTime
          : (d as ITask2).startTime
        et = (d as ITask2).children?.length
          ? (d as ITask2).children[(d as ITask2).children.length - 1].endTime
          : (d as ITask2).endTime
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

      // x轴标签样式
      d3.selectAll('.axis--x .tick text')
        .filter(
          (_d: { time: Date }) =>
            dayjs(_d.time).isSame(dayjs(st)) || dayjs(_d.time).isSame(dayjs(et))
        )
        .style('fill', hoverTickFillColor)
        .style('font-size', hoverTickFontSize)

      // y轴标签样式
      let yTextOrSpan = d3
        .selectAll('.axis--y .tick text')
        .filter(
          (t: { name: string }) => t.name === ((d as IChildTask2).pid || d.name)
        )
      // console.log('yTextOrSpan:', yTextOrSpan)
      if (yTextOrSpan.empty()) {
        yTextOrSpan = d3
          .selectAll('.axis--y .tick text tspan')
          .filter(
            (t: { name: string }) =>
              t.name === ((d as IChildTask2).pid || d.name)
          )
      }

      if (!yTextOrSpan.empty()) {
        yTextOrSpan
          .style('fill', hoverTickFillColor)
          .style('font-size', hoverTickFontSize)
      }
    }

    /**
     * 清除柱子的高亮样式
     */
    function clearHighlightBar(d: ITask2 | IChildTask2, x, y, transform) {
      if (!d) return
      let st, et
      if (Object.prototype.hasOwnProperty.call(d, 'pid')) {
        d3.selectAll('.bar-group').each(function (_d: ITask2, i) {
          if (_d.name === (d as IChildTask2).pid) {
            d3.select(this)
              .selectAll('.bar')
              .each(function (_d: ITask2 | IChildTask2, i) {
                if (_d.name === d.name) {
                  d3.select(this).style('stroke', 'inherit')
                  d3.select(this).style('stroke-width', 'inherit')
                }
              })
          }
        })
        st = (d as IChildTask2).startTime
        et = (d as IChildTask2).endTime
      } else {
        d3.selectAll('.bar-group').each(function (_d: ITask2, i) {
          if (_d.name === d.name) {
            d3.select(this).style('stroke', 'none')
          }
        })
        st = (d as ITask2).children?.length
          ? (d as ITask2).children[0].startTime
          : (d as ITask2).startTime
        et = (d as ITask2).children?.length
          ? (d as ITask2).children[(d as ITask2).children.length - 1].endTime
          : (d as ITask2).endTime
      }

      g.selectAll('.dashed-line')
        .filter((_d: ITask2) => _d.name === d.name)
        .remove()

      // 还原x轴标签样式
      d3.selectAll('.axis--x .tick text')
        .filter(
          (_d: { time: Date }) =>
            dayjs(_d.time).isSame(dayjs(st)) || dayjs(_d.time).isSame(dayjs(et))
        )
        .style('fill', textColor)
        .style('font-size', textFontSize)

      // 还原y轴标签样式
      // y轴标签样式
      // y轴标签样式
      let yTextOrSpan = d3
        .selectAll('.axis--y .tick text')
        .filter(
          (t: { name: string }) => t.name === ((d as IChildTask2).pid || d.name)
        )
      // console.log('yTextOrSpan:', yTextOrSpan)
      if (yTextOrSpan.empty()) {
        yTextOrSpan = d3
          .selectAll('.axis--y .tick text tspan')
          .filter(
            (t: { name: string }) =>
              t.name === ((d as IChildTask2).pid || d.name)
          )
      }

      if (!yTextOrSpan.empty()) {
        yTextOrSpan.style('fill', textColor).style('font-size', textFontSize)
      }
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
          if (activeData && activeData.name === d.name) {
            activeData = null
          } else {
            activeData = d
          }
        })
    }

    function modifyBarGroupAttr(barGroupSelector, x, y, transform) {
      const bars = barGroupSelector
        .attr('y', (d, i) => y(d.level + '') + barHeight / 2)
        .attr('x', (d) => {
          if (d.children?.length) {
            return x(d.children[0].startTime)
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
        .on('dblclick', function (e, d) {
          console.log('dblclick:', d)
          onClickBarGroup(d)
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
                .style('fill', textColor)
                .style('font-size', textFontSize)
                .datum({ time: val })

              return labelText
            }
        )
    }

    function genYAxis(filterTasks: ITask2[], taskLevels: string[]) {
      newYScale = d3
        .scaleBand()
        .rangeRound([
          height - barHeight / 2,
          height - taskLevels.length * (barHeight + barPadding) - barHeight / 2
        ])
        .domain(sortBy(taskLevels, (t) => +t))
      return d3
        .axisLeft(newYScale)
        .tickValues(taskLevels)
        .tickFormat(function (val, index) {
          // console.log('val:', val)
          // 设置text文字样式
          const label = filterTasks
            .filter((t) => t.level === +val)
            .map((t) => t.name)
            .join(',')
          d3.select(this)
            .style('fill', textColor)
            .style('font-size', textFontSize)
            .datum({ name: label })
          return label
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
        .attr('clip-path', 'url(#clip-bar)')

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
        .attr('clip-path', 'url(#clip-bar)')
    }

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const x = d3
      .scaleTime()
      .domain([startTime, endTime])
      .rangeRound([maxYText, width])

    newXScale = x
    const y = d3
      .scaleBand()
      .rangeRound([
        height - barHeight / 2,
        height - taskLevels.length * (barHeight + barPadding) - barHeight / 2
      ])
      .domain(taskLevels)
    newYScale = y

    // console.log('0 -> time:', x.invert(0))
    // console.log('end -> time:', x.invert(width))
    // console.log('task[0] - value:', y('0'))
    // console.log('task[1] - value:', y('1'))

    /**
     * 画x轴
     */
    function renderX(newXScale, newTransform) {
      const X = svg.select('.axis--x')
      let selectX: d3.Selection<SVGGElement, unknown, HTMLElement, any>
      if (X.empty()) {
        selectX = g
          .append('g')
          .attr('class', 'axis axis--x')
          .attr('transform', `translate(0, ${height})`)
      } else {
        selectX = X.attr(
          'transform',
          `translate(0, ${height})`
        ) as d3.Selection<SVGGElement, unknown, HTMLElement, any>
      }

      // @ts-ignore
      selectX.call(genXAxis(newXScale, newTransform))
    }

    renderX(x, initialTransform)

    /**
     * 画y轴
     */
    function renderY(maxYText: number, tasks: ITask2[], taskLevels: string[]) {
      const Y = svg.select('.axis--y')
      let selectY: d3.Selection<SVGGElement, unknown, HTMLElement, any>
      if (Y.empty()) {
        selectY = g
          .append('g')
          .attr('class', 'axis axis--y')
          .attr('transform', `translate(${maxYText}, 0)`)
      } else {
        selectY = Y.attr(
          'transform',
          `translate(${maxYText}, 0)`
        ) as d3.Selection<SVGGElement, unknown, HTMLElement, any>
      }

      if (tasks.length > 0) {
        // @ts-ignore
        selectY.style('display', 'block').call(genYAxis(tasks, taskLevels))
      } else {
        selectY.style('display', 'none')
      }
    }

    renderY(maxYText, tasks, taskLevels)

    /**
     * 设置y轴text是否需要分隔成多行
     */
    function setYTextSpan() {
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
              .datum({ name: t })
          })
        }
      })
    }

    setYTextSpan()

    renderTodayRect()

    modifyBarGroupAttr(
      g
        .selectAll('.bar-group')
        .data(tasks)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('clip-path', 'url(#clip-bar)'),
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
      .scaleExtent(scaleExtent)
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

    function getFilterTasks(x, tasks: ITask2[], xmin: number) {
      const st = x.invert(xmin)
      const et = x.invert(width)
      const filterTasks: ITask2[] = tasks.filter((t) => {
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
      return {
        filterTasks,
        taskLevels
      }
    }

    function zoomed(event) {
      newXScale = event.transform.rescaleX(x).rangeRound([maxYText, width])
      newTransform = event.transform
      // console.log('transform:', newTransform)

      const { filterTasks, taskLevels } = getFilterTasks(
        newXScale,
        tasks,
        maxYText
      )
      maxYText = getMaxYTextByTasks(filterTasks)

      // 更新x轴和y轴
      renderX(newXScale, newTransform)
      renderY(maxYText, filterTasks, taskLevels)

      setYTextSpan()

      renderTodayRect()

      // 绘制柱状图
      const barGroup = g
        .selectAll('.bar-group')
        .data(filterTasks, (d: ITask2) => d.name)

      barGroup.exit().remove()

      modifyBarGroupAttr(
        barGroup
          .enter()
          .append('g')
          .attr('class', 'bar-group')
          .attr('clip-path', 'url(#clip-bar)')
          // @ts-ignore
          .merge(barGroup),
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

    svg
      .call(zoom)
      .on('dblclick.zoom', () => {
        // setShowType('')
        onSvgDblClick?.()
      })
      // @ts-ignore
      .call(zoom.transform, initialTransform)

    function jumpToTask(t: ITask2) {
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
              .toDate(),
            newXScale
          )
        )
        // 如果点击的是不同的柱子，则高亮柱子
        barClickHandler(null, t, newXScale, newYScale, newTransform)
        activeData = t
      }
    }

    return {
      jumpToTask,
      refresh: (data = {}) => renderChart({ ...props, ...data })
    }
  }

  useImperativeHandle(ref, () => ({
    ...power
  }))

  useEffect(() => {
    console.log('-- gantt init --')
    setPower(
      renderChart({
        ...props,
        startTime:
          props.startTime ||
          dayjs().subtract(7, 'day').startOf('day').format('YYYY-MM-DD'),
        endTime:
          props.endTime ||
          dayjs().add(7, 'day').startOf('day').format('YYYY-MM-DD')
      })
    )
  }, [])

  return <svg className='gantt-container'></svg>
}

export default forwardRef(Gantt)
