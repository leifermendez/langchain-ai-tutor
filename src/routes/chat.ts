import { Router } from "express"
import chatSqlController from "src/controllers/chat-sql.controller"
import chatController from "src/controllers/chat.controller"

const chatRoute = Router()

/**
 * Ruta para realizar el chat
 */
chatRoute.post('/chat', chatController)

chatRoute.post('/chat-sql', chatSqlController)

export default chatRoute