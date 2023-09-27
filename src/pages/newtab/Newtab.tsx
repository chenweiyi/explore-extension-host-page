import React, { useEffect, useState } from 'react'
import '@pages/newtab/Newtab.css'
import useStorage from '@src/shared/hooks/useStorage'
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage'
import withSuspense from '@src/shared/hoc/withSuspense'
import { isNil } from 'lodash-es'
import clsx from 'clsx'
import logo from '@assets/img/tab-icon-48.png'
import dayjs from 'dayjs'

interface ICategoryKey extends chrome.bookmarks.BookmarkTreeNode {
  parentIds?: Set<string>
  parentTitles?: string[]
  lastModifiedTime?: string
}

type ICategoryData = Map<ICategoryKey, ICategoryKey[]>

const Newtab = () => {
  // const theme = useStorage(exampleThemeStorage)

  const [categoryData, setCategoryData] = useState<ICategoryData>(new Map())
  const [folders, setFolders] = useState<Array<ICategoryKey>>([])

  const [filterData, setFilterData] = useState<ICategoryKey[]>([])
  const [activeFolder, setActiveFolder] = useState<string>('-1')
  const [searchVal, setSearchVal] = useState<string>('')

  const mapRes: ICategoryData = new Map()

  function processBookmarkNodes2(
    nodes: ICategoryKey[],
    parentNode?: ICategoryKey
  ) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (isNil(node.url) && node.children?.length > 0) {
        !node.parentIds && (node.parentIds = new Set())
        !isNil(node.parentId) && node.parentIds.add(node.parentId)
        !node.parentTitles && (node.parentTitles = [])
        parentNode?.title && node.parentTitles.push(parentNode.title)
        if (node.children.find((node) => node.url)) {
          mapRes.set(
            node,
            node.children
              .filter((node) => !node.children && node.url)
              .map((node2) => {
                const _node: ICategoryKey = { ...node2 }
                !_node.parentIds && (_node.parentIds = new Set())
                !isNil(_node.parentId) && _node.parentIds.add(_node.parentId)
                !_node.parentTitles && (_node.parentTitles = [])
                node?.title && _node.parentTitles.push(node.title)
                _node.lastModifiedTime = dayjs(_node.dateAdded).format(
                  'YYYY-MM-DD'
                )
                return _node
              })
              .sort((a, b) => b.dateAdded - a.dateAdded)
          )
        }
        // 递归处理子节点
        processBookmarkNodes2(node.children, node)
      }
    }
  }

  function traverseCategoryData() {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      console.log('bookmarkTreeNodes:', bookmarkTreeNodes)
      processBookmarkNodes2(bookmarkTreeNodes)
      const allKey = {
        id: '-1',
        title: '全部'
      }
      const arr: ICategoryKey[] = []
      for (const val of mapRes.values()) {
        arr.push(...val)
      }
      mapRes.set(
        allKey,
        arr.sort((a, b) => b.dateAdded - a.dateAdded)
      )
      console.log('mapRes:', mapRes)
      setCategoryData(mapRes)
    })
  }

  function changeFilterDataByActiveFolder() {
    const data = categoryData.get(folders.find((f) => f.id === activeFolder))
    console.log('data:', data)
    if (!data) return []
    setFilterData(
      data.filter((d) => {
        if (searchVal === '') return d
        return (
          d.title.toLowerCase().includes(searchVal.toLowerCase()) ||
          searchVal.toLowerCase().includes(d.title.toLowerCase())
        )
      })
    )
  }

  function search(e: React.FormEvent<HTMLInputElement>) {
    const value = e.currentTarget.value
    setSearchVal(value)
  }

  useEffect(() => {
    traverseCategoryData()
  }, [])

  useEffect(() => {
    const folders: ICategoryKey[] = []
    for (const key of categoryData.keys()) {
      folders.push(key)
    }
    const allKeyIndex = folders.findIndex((f) => f.id === '-1')
    const allKey = folders.splice(allKeyIndex, 1)
    setFolders([...allKey, ...folders])
  }, [categoryData.size])

  useEffect(() => {
    changeFilterDataByActiveFolder()
  }, [activeFolder, categoryData.size, folders.length, searchVal])

  console.log('folders:', folders)

  return (
    <div
      className='
        app 
        bg-white
        w-[80%]
        h-[85%]
        flex
        flex-row
        items-stretch
        rounded-[8px]
        overflow-hidden
        shadow-lg
      '
    >
      <div
        className='
        left 
        w-[300px] 
        flex 
        flex-col 
        items-stretch 
        bg-gray-300
        rounded-l-[8px]
        px-[16px]
        py-[16px]
        overflow-hidden
      '
      >
        <div
          className='
          logo
          text-[30px]
          px-[12px]
          mb-[16px]
          h-[60px]
        '
        >
          <img src={logo} className='App-logo h-[48px]' alt='logo' />
        </div>
        <div
          className='
          title
          text-[12px]
          mb-[16px]
          text-gray-500
          px-[12px]
        '
        >
          文件夹
        </div>
        <div className='flex-1 flex flex-col items-stretch overflow-y-auto'>
          {folders.map((folder) => {
            return (
              <span
                key={folder.id}
                className={clsx([
                  'folder-item',
                  'rounded-[4px]',
                  'px-[12px]',
                  'py-[4px]',
                  'mr-[8px]',
                  'mb-[8px]',
                  'text-[16px]',
                  'cursor-pointer',
                  'flex',
                  'items-center',
                  'hover:text-blue-600',
                  activeFolder === folder.id
                    ? 'text-blue-600 font-semibold'
                    : 'text-black'
                ])}
                onClick={() => setActiveFolder(folder.id)}
              >
                <IMdiFolderOutline className='inline-block mr-[20px]' />
                {folder.title}
              </span>
            )
          })}
        </div>
      </div>
      <div
        className='
        right 
        flex-1 
        flex 
        flex-col 
        items-stretch 
        border-y-[1px] 
        border-r-[1px] 
        border-gray-300 
        border-solid
        rounded-r-[8px]
      '
      >
        <div
          className='
          header
          h-[72px] 
          py-[4px] 
          px-[16px] 
          flex
          justify-between
          items-center
          border-b-[1px]
          border-gray-300
          border-solid
        '
        >
          <div className='search relative'>
            <input
              type='text'
              placeholder='请搜索'
              className='
                h-[30px]
                w-[300px]
                bg-white
                appearance-none
                border
                border-slate-400
                border-solid
                text-slate-500
                outline-0
                pl-[24px]
                rounded-[4px]
              '
              onInput={(e) => search(e)}
            />
            <IMdiMagnify className='absolute left-[6px] top-[8px] text-cyan-500' />
          </div>
          <div className='user flex items-center'>
            <IMdiAccount className='text-cyan-500 text-[16px] mr-[4px]' />
            <span className='text-slate-500 text-[16px]'>User</span>
          </div>
        </div>
        <div
          className='
            app-content
            flex-1
            px-[16px]
            py-[12px]
            grid
            grid-cols-3
            grid-rows-[128px]
            auto-rows-[128px]
            gap-x-[16px]
            gap-y-[16px]
            overflow-y-auto
          '
        >
          {filterData?.map((d) => {
            return (
              <div
                className='
                item
                flex
                flex-col
                items-stretch
                border 
                border-cyan-300
                px-[8px] 
                py-[12px] 
                rounded-[4px] 
                bg-cyan-200
                text-black
                font-medium
                cursor-pointer
                shadow-normal
                hover:font-bold
                hover:bg-cyan-500
                hover:shadow-active
                group
              '
                key={d.id}
                onClick={() => window.open(d.url)}
              >
                <div
                  className='
                    overflow-hidden 
                    text-ellipsis 
                    whitespace-nowrap
                  '
                  title={d.title}
                >
                  <a
                    href={d.url}
                    target='_blank'
                    rel='noreferrer'
                    className='
                    text-[16px]
                    group-hover:text-white
                  '
                  >
                    {d.title}
                  </a>
                </div>

                <div
                  className='
                    flex
                    items-center
                    text-gray-700 
                    font-normal
                    mt-[8px]
                    mb-[4px]
                    text-[14px]
                    group-hover:text-white
                  '
                  title={d.url}
                >
                  <IMdiLinkVariant className='inline-block mr-[4px]' />
                  <span
                    className='
                    flex-1
                    overflow-hidden 
                    text-ellipsis 
                    whitespace-nowrap 
                  '
                  >
                    {d.url}
                  </span>
                </div>
                <div
                  className='
                  flex
                  items-center
                  text-gray-700 
                  font-normal 
                  text-[14px] 
                  group-hover:text-white
                '
                >
                  <IMdiClockTimeSevenOutline className='inline-block mr-[4px]' />
                  <span
                    className='
                    flex-1
                    overflow-hidden 
                    text-ellipsis 
                    whitespace-nowrap 
                  '
                  >
                    {d.lastModifiedTime}
                  </span>
                </div>
                {d.parentTitles?.length > 0 ? (
                  <div
                    className='
                      flex
                      items-center
                      text-gray-700 
                      font-normal 
                      text-[14px] 
                      group-hover:text-white
                      mt-[4px]
                    '
                  >
                    <IMdiFolderOutline className='inline-block mr-[4px]' />
                    <span
                      className='
                        flex-1
                        overflow-hidden 
                        text-ellipsis 
                        whitespace-nowrap 
                      '
                    >
                      {d.parentTitles[d.parentTitles.length - 1]}
                    </span>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default withSuspense(Newtab)
