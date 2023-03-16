import express from "express"
import config from "./src/config.js"
import winston from "winston"
import knex from "knex"
import BaseModel from "./src/db/models/BaseModel.js"
import chalk from "chalk"
import prepareRoutes from "./src/prepareRoutes.js"

const db = knex(config.db)

BaseModel.knex(db)

const app = express()

app.use((req, res, next) => {
  req.locals = {}

  next()
})

app.use(express.json())

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.json(),
        winston.format((info) => {
          info[Symbol.for("message")] = `[${chalk[
            info.level === "sql" ? "blue" : "magenta"
          ](info.level)}] ${chalk[
            info.level === "sql" ? "blueBright" : "yellow"
          ](info.message)}`

          return info
        })()
      ),
    }),
  ],
  levels: { ...winston.config.cli.levels, sql: 10 },
  level: 0,
})

prepareRoutes({ app, db })

app.listen(config.port, () => logger.info(`Listening on : ${config.port}`))
