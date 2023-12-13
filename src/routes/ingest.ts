import { Router } from "express"
import ingestController from "src/controllers/ingest.controller"
import multerMiddleware from "src/middleware/file"

const ingestRoute = Router()

/**
 * Ruta para realizar la ingesta de datos
 * [POST] http://localhost:3000/ingest -d file.pdf
 */
ingestRoute.post('/ingest', multerMiddleware.single("file"), ingestController)

export default ingestRoute