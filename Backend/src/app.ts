import express from "express"
import router from "./routes"
import cors from "cors"
import bodyparser from "body-parser"

const app = express()

app.use(cors({origin:'*'}))

app.use(express.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())

app.use('/', router)

export default app