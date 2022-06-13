const http = require("http")
require("dotenv").config()

const { mongoConnect } = require("./services/mongo")
const { loadPlanetsData } = require("./models/planets.model")
const { loadLaunchData } = require("./models/launches.model")

const app = require("./app")

const PORT = process.env.PORT || 8000

const server = http.createServer(app)

async function startServer() {
  await mongoConnect()
  await loadPlanetsData()
  await loadLaunchData()
  server.listen(PORT, () => console.log(`Server Is Listening on port ${PORT}`))
}

startServer()
