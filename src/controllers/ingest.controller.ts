import { Request, Response } from "express";
import { unlinkSync } from 'fs'
import { runOnPinecone } from "src/lib/pinecone";
import { runIngest } from "src/services/ingest.service";

export default async (req: Request, res: Response) => {
    try {
        const { file } = req;
        console.log(`[FILE DETAILS]:`,file)

        if (!file) throw Error('NO_FILE')

        const chunks = await runIngest(file.path)
        
        const embedding = await runOnPinecone(chunks)

        // unlinkSync(file.path) // es opcional!
        res.send({ response: chunks, embedding })
    } catch (err) {
        console.log(err)
        res.status(406)
        res.send(`Error`)
    }
}