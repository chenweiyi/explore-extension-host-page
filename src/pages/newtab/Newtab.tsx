import React, { useEffect, useState } from 'react'
import '@pages/newtab/Newtab.css'
import useStorage from '@src/shared/hooks/useStorage'
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage'
import withSuspense from '@src/shared/hoc/withSuspense'
import { isNil } from 'lodash-es'

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
    setFilterData(data || [])
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
  }, [activeFolder, categoryData.size, folders.length])

  return (
    <div
      className='
        app 
        p-[16px] 
        bg-slate-500 
        w-full 
        min-h-full
        flex
        flex-col
        items-stretch
      '
    >
      <div className='filter-area flex mb-[24px]'>
        <div className='filter-title mr-[8px] text-white whitespace-nowrap'>
          文件夹：
        </div>
        <div className='filter-content flex flex-wrap'>
          {folders.map((folder) => {
            return (
              <span
                key={folder.id}
                className='
                  folder-item
                  bg-gray-300
                  rounded-[2px]
                  text-black
                  px-[8px]
                  py-[2px]
                  mr-[8px]
                  mb-[8px]
                  cursor-pointer
                  hover:text-white
                  hover:bg-green-400
                '
                onClick={() => setActiveFolder(folder.id)}
              >
                {folder.title}
              </span>
            )
          })}
        </div>
      </div>
      <div
        className='
          app-content 
          flex
          flex-wrap
          justify-start
        '
      >
        {filterData?.map((d) => {
          return (
            <div
              className='
                item 
                w-[160px] 
                h-[50px] 
                mr-[12px] 
                mb-[16px] 
                border 
                border-cyan-300
                px-[8px] 
                py-[12px] 
                rounded-[4px] 
                bg-cyan-300
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
                hover:text-white
              '
              key={d.id}
              title={d.title}
            >
              <a
                href={d.url}
                target='_blank'
                rel='noreferrer'
                className='
                  
                '
              >
                {d.title}
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default withSuspense(Newtab)
