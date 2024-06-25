import {
  LOCAL_RELOAD_SOCKET_URL,
  UPDATE_COMPLETE_MESSAGE,
  UPDATE_PENDING_MESSAGE,
  UPDATE_REQUEST_MESSAGE
} from './constant'
import MessageInterpreter from './interpreter'

let needToUpdate = false

export default function initReloadClient({
  watchPath,
  onUpdate
}: {
  watchPath: string | string[]
  onUpdate: () => void
}): WebSocket {
  const socket = new WebSocket(LOCAL_RELOAD_SOCKET_URL)

  function sendUpdateCompleteMessage() {
    socket.send(MessageInterpreter.send({ type: UPDATE_COMPLETE_MESSAGE }))
  }

  socket.addEventListener('message', (event) => {
    const message = MessageInterpreter.receive(String(event.data))

    switch (message.type) {
      case UPDATE_REQUEST_MESSAGE: {
        console.log('UPDATE_REQUEST_MESSAGE:', needToUpdate)
        if (needToUpdate) {
          sendUpdateCompleteMessage()
          needToUpdate = false
          onUpdate()
        }
        return
      }
      case UPDATE_PENDING_MESSAGE: {
        console.log('UPDATE_PENDING_MESSAGE:', needToUpdate)
        if (!needToUpdate) {
          if (typeof watchPath === 'string') {
            needToUpdate = message.path.includes(watchPath)
          } else if (Array.isArray(watchPath)) {
            needToUpdate = watchPath.some((path) => message.path.includes(path))
          }
        }
        return
      }
    }
  })

  socket.onclose = () => {
    console.warn(
      `Reload server disconnected.\nPlease check if the WebSocket server is running properly on ${LOCAL_RELOAD_SOCKET_URL}. This feature detects changes in the code and helps the browser to reload the extension or refresh the current tab.`
    )
  }

  return socket
}
