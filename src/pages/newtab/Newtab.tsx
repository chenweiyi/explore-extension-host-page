import React from 'react'
import '@pages/newtab/Newtab.css'
// import useStorage from '@src/shared/hooks/useStorage'
// import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage'
import withSuspense from '@src/shared/hoc/withSuspense'
import LeftMenu from './components/LeftMenu'
import RightHead from './components/RightHead'
import RightContent from './components/RightContent'

export interface ICategoryKey extends chrome.bookmarks.BookmarkTreeNode {
  parentIds?: Set<string>
  parentTitles?: string[]
  lastModifiedTime?: string
}

export type ICategoryData = Map<ICategoryKey, ICategoryKey[]>

const Newtab = () => {
  // const theme = useStorage(exampleThemeStorage)

  const [categoryData, setCategoryData] = useState<ICategoryData>(new Map())
  const [folders, setFolders] = useState<Array<ICategoryKey>>([])

  const [filterData, setFilterData] = useState<ICategoryKey[]>([])
  const [activeFolder, setActiveFolder] = useState<string>('-1')
  const [searchVal, setSearchVal] = useState<string>('')

  const mapRes: ICategoryData = new Map()

  function processBookmarkNodes(
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
        processBookmarkNodes(node.children, node)
      }
    }
  }

  function traverseCategoryData() {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      console.log('bookmarkTreeNodes:', bookmarkTreeNodes)
      processBookmarkNodes(bookmarkTreeNodes)
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

  useUpdateEffect(() => {
    // activeFolder改变时，存储当前activeFolder
    chrome.storage.sync.get(['saveSelectFolder'], function (result) {
      if (result.saveSelectFolder) {
        chrome.storage.sync.set({ activeFolder })
      } else {
        chrome.storage.sync.set({ activeFolder: '-1' })
      }
    })
  }, [activeFolder])

  useEffect(() => {
    chrome.storage.sync.get(['activeFolder'], function (result) {
      setActiveFolder(result.activeFolder || '-1')
    })
  }, [])

  // console.log('folders:', folders)

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
      <LeftMenu
        folders={folders}
        activeFolder={activeFolder}
        setActiveFolder={setActiveFolder}
      />
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
        <RightHead setSearchVal={setSearchVal} />
        <RightContent filterData={filterData} />
      </div>
    </div>
  )
}

export default withSuspense(Newtab)
