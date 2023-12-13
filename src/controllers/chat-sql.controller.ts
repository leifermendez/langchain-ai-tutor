import { Request, Response } from "express";
import { mysqlInstante } from "src/lib/mysql";
import { runChatSQL, runChatSQLKeywords } from "src/services/ingest.service";

export default async (req: Request, res: Response) => {
    try {
        const { question, history = [] } = req.body;

        if (!question) throw new Error('NO_QUESTION')

        const responseKeywords = await runChatSQLKeywords(history, question)

        const keywords = responseKeywords.replaceAll(' ','').split(',')

        const dataFromDb = await mysqlInstante.findProduct(keywords) as any
        
        const response = await runChatSQL(history, question, dataFromDb)

        //aqui usar el mysql
        
        res.send({ question, response, keywords, dataFromDb })
    } catch (err) {
        console.log(err)
        res.status(406)
        res.send(`Error`)
    }
}