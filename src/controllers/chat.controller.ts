import { Request, Response } from "express";
import { runChat } from "src/services/ingest.service";

export default async (req: Request, res: Response) => {
    try {
        const { question, history = [] } = req.body;

        if (!question) throw new Error('NO_QUESTION')

        const response = await runChat(history, question)
        res.send({ question, response })
    } catch (err) {
        console.log(err)
        res.status(406)
        res.send(`Error`)
    }
}