import { SystemMessage, AIMessage, HumanMessage } from "langchain/schema";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PromptTemplate } from "langchain/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { chainIntent } from "src/lib/langchain";
import { pinecone } from "src/lib/pinecone/connect";
import { RunnableSequence } from "langchain/schema/runnable";
import { StringOutputParser } from "langchain/schema/output_parser";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatOpenAI } from "langchain/chat_models/openai";


/**
 * Ingestar
 * @param pathFile 
 * @returns 
 */
const runIngest = async (pathFile: string) => {
  console.log(`Fichero PDF:`, pathFile)
  const loader = new PDFLoader(pathFile);
  const rawDocs = await loader.load();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await textSplitter.splitDocuments(rawDocs);
  return docs
};

/**
 * Hablar
 * @param history 
 * @param question 
 * @param customerName 
 * @param cb 
 * @returns 
 */
const runChat = async (
  history: { content: string, role: string }[] = [],
  question: string,
) => {

  const index = pinecone.Index(`${process.env.PINECONE_INDEX_NAME}`);

  const loadedVectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({}),
    {
      pineconeIndex: index,
      textKey: "text",
    }
  );

  const pastMessages = history.map((message) => {
    if (message.role === "system") {
      return new SystemMessage(message.content);
    }
    if (message.role === "assistant") {
      return new AIMessage(message.content);
    }
    if (message.role === "user") {
      return new HumanMessage(`${message.content}`);
    }
  });

  const chain = chainIntent(loadedVectorStore);
  const sanitizedQuestion = question.trim().replace("\n", " ");

  const response = await chain.call({
    question: sanitizedQuestion,
    chat_history: pastMessages
  });

  const tokenSpend = Number(chain.tags[0]) ?? 0
  return { response, tokens: tokenSpend };
};

/**
 * Se encarga de seleccionar la palabras claves del contexto de la conversion: "curso,node,mysql, etc.."
 * @param history 
 * @param question 
 * @returns 
 */
const runChatSQLKeywords = async (
  history: { content: string, role: string }[] = [],
  question: string,
) => {

  const questionPrompt = PromptTemplate.fromTemplate(
    `Use the following context items to generate a list of keywords to search in a mysql database.
    "Example: I want information about iphone accessories: Keywords: iphone, accessories".
    "Example: Do you have node or express course: Keywords: express, node".
        ----------------
        CHAT HISTORY: {chatHistory}
        ----------------
        QUESTION: {question}
        ----------------
        Keywords:`
  );

  const model = new ChatOpenAI({ modelName: 'gpt-4' });


  const pastMessages = history.map((message) => {
    if (message.role === "assistant") {
      return `AI: ${message.content}\n` //AI: te recomiendo aprender..
    }
    if (message.role === "user") {
      return `Human: ${message.content}\n`  //Human: quiero un curso sobre node
    }
  }).join('\n')


  const chain = RunnableSequence.from([
    {
      question: (input: { question: string; chatHistory?: string }) =>
        input.question,
      chatHistory: () => pastMessages
    },
    questionPrompt,
    model,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({
    question,
  });

  return result
};

const runChatSQL = async (
  history: { content: string, role: string }[] = [],
  question: string,
  context: any[],
) => {

  const questionPrompt = PromptTemplate.fromTemplate(
    `Use the following contextual elements to give an appropriate answer, you are a virtual assistant whose mission is to sell courses for programmers. All prices USD
        ----------------
        CONTEXT: {context}
        ----------------
        CHAT HISTORY: {chatHistory}
        ----------------
        QUESTION: {question}
        ----------------
        Helpful Answer:`
  );
  const model = new ChatOpenAI({ modelName: 'gpt-4' });


  const pastMessages = history.map((message) => {
    if (message.role === "assistant") {
      return `AI: ${message.content}\n`
    }
    if (message.role === "user") {
      return `Human: ${message.content}\n`
    }
  }).join('\n')

  const parseContext = context.map((items) => {
    return `ID:${items.id}, Product Name: ${items.name}, Product Description: ${items.description}, Product Price: ${items.price}`
  }).join('\n')

  console.log('--->',parseContext)

  const chain = RunnableSequence.from([
    {
      question: (input: { question: string; chatHistory?: string }) =>
        input.question,
      chatHistory: () => pastMessages,
      context: () => parseContext
    },
    questionPrompt,
    model,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({
    question,
  });

  return result
};


export { runIngest, runChat, runChatSQLKeywords, runChatSQL }