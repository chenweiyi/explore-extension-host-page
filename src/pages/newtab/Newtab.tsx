import React, { useEffect, useState } from 'react'
import '@pages/newtab/Newtab.css'
import useStorage from '@src/shared/hooks/useStorage'
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage'
import withSuspense from '@src/shared/hoc/withSuspense'
import { isNil } from 'lodash-es'
import clsx from 'clsx'
import logo from '@assets/img/tab-icon-48.png'

interface ICategoryKey extends chrome.bookmarks.BookmarkTreeNode {
  parentIds?: Set<string>
  parentTitles?: string[]
}

type ICategoryData = Map<ICategoryKey, chrome.bookmarks.BookmarkTreeNode[]>

const Newtab = () => {
  // const theme = useStorage(exampleThemeStorage)

  const [allData, setAllData] = useState<chrome.bookmarks.BookmarkTreeNode[]>(
    []
  )
  const [categoryData, setCategoryData] = useState<ICategoryData>(new Map())
  const [folders, setFolders] = useState<Array<ICategoryKey>>([])

  const [filterData, setFilterData] = useState<
    chrome.bookmarks.BookmarkTreeNode[]
  >([])
  const [activeFolder, setActiveFolder] = useState<string>('-1')
  const [searchVal, setSearchVal] = useState<string>('')

  const res: chrome.bookmarks.BookmarkTreeNode[] = []
  const mapRes: ICategoryData = new Map()

  function processBookmarkNodes(nodes: chrome.bookmarks.BookmarkTreeNode[]) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (node.url) {
        // 处理书签节点的URL
        // console.log(node.url)
        res.push(node)
      }
      if (node.children) {
        // 递归处理子节点
        processBookmarkNodes(node.children)
      }
    }
  }

  function processBookmarkNodes2(
    nodes: ICategoryKey[],
    parentNode?: ICategoryKey
  ) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (isNil(node.url)) {
        !node.parentIds && (node.parentIds = new Set())
        node.parentIds.add(node.parentId)
        !node.parentTitles && (node.parentTitles = [])
        parentNode && node.parentTitles.push(parentNode.title)
      }
      if (node.children) {
        if (node.children.find((node) => node.url)) {
          mapRes.set(
            node,
            node.children.filter((node) => !node.children && node.url)
          )
        }
        // 递归处理子节点
        processBookmarkNodes2(node.children, node)
      }
    }
  }

  function traverseAllData() {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      console.log(bookmarkTreeNodes)
      processBookmarkNodes(bookmarkTreeNodes)
      setAllData(res)
    })
  }

  function traverseCategoryData() {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      processBookmarkNodes2(bookmarkTreeNodes)
      const newMapRes: ICategoryData = new Map()
      newMapRes.set(
        {
          id: '-1',
          title: '全部'
        },
        res
      )
      for (const [key, val] of mapRes) {
        newMapRes.set(key, val)
      }
      setCategoryData(newMapRes)
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
    traverseAllData()
    traverseCategoryData()
  }, [])

  useEffect(() => {
    const folders = []
    for (const key of categoryData.keys()) {
      folders.push(key)
    }
    setFolders(folders)
  }, [categoryData.size])

  useEffect(() => {
    changeFilterDataByActiveFolder()
  }, [activeFolder, categoryData.size, folders.length, searchVal])

  // console.log('activeFolder:', activeFolder)

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
          grid-cols-4
          grid-rows-[80px]
          auto-rows-[80px]
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
                border 
                border-cyan-300
                px-[8px] 
                py-[12px] 
                rounded-[4px] 
                bg-cyan-200
                overflow-hidden 
                text-ellipsis 
                whitespace-nowrap
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
                title={d.title}
                onClick={() => window.open(d.url)}
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

                <div
                  className='
                w-full 
                overflow-hidden 
                text-ellipsis 
                whitespace-nowrap 
                text-gray-700 
                font-normal
                mt-[8px]
                text-[14px]
                group-hover:text-white
              '
                >
                  <IMdiLinkVariant className='inline-block mr-[4px]' />
                  {d.url}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default withSuspense(Newtab)
