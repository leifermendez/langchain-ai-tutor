
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import routes from './routes'
import { mysqlInstante } from './lib/mysql'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT ?? 3000


/**
 * Iniciamos nuestra API REST
 */
const main = async () => {
    await mysqlInstante.init()
    app.use(routes)
    app.listen(PORT, () => {
        console.log(`Listo http://localhost:${PORT}`)
    })
}


main()