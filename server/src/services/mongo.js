const mongoose = require("mongoose")

const MONGO_URL = process.env.MONGO_URL

mongoose.connection.once("open", () => console.log("mongoose ready after connection initial"))
mongoose.connection.on("error", () => console.error("mongoose error after initial connection"))

async function mongoConnect() {
  await mongoose
    .connect(MONGO_URL)
    .then(() => console.log("mongoose connected"))
    .catch(err => console.error(err))
}

async function mongoDisconnect() {
  await mongoose.disconnect()
}

module.exports = {
  mongoConnect,
  mongoDisconnect
}
