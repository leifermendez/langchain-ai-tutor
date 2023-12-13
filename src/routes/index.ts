import { Router } from "express";
import ingestRoute from "./ingest";
import chatRoute from "./chat";

const routes = Router()
routes.use(ingestRoute)
routes.use(chatRoute)

export default  routes