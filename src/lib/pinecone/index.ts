import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Document } from "langchain/dist/document";
import { pinecone } from "./connect";

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

const runOnPinecone = async (docs: Document<Record<string, any>>[]) => {
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex: index,
        textKey: "text",
    });

    return true
};

export { runOnPinecone }