const { default: axios } = require("axios")
const launchesDB = require("./launches.mongo")
const planets = require("./planets.mongo")

const DEFAULT_FLIGHT_NUMBER = 100

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query"

async function populateLaunches() {
  console.log("Downloading Launch Data...")
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1
          }
        },
        {
          path: "payloads",
          select: {
            customers: 1
          }
        }
      ]
    }
  })

  if (response.status !== 200) {
    console.log("Problem downloading launch data")
    throw new Error("Launch Data Download Failed")
  }

  const launchDocs = response.data.docs
  if (launchDocs.length) {
    for (const launchDoc of launchDocs) {
      const payloads = launchDoc["payloads"]
      const customers = payloads.flatMap(payload => {
        return payload["customers"]
      })

      const launch = {
        flightNumber: launchDoc["flight_number"],
        mission: launchDoc["name"],
        rocket: launchDoc["rocket"]["name"],
        launchDate: launchDoc["date_local"],
        upcoming: launchDoc["upcoming"],
        success: launchDoc["success"],
        customers
      }

      console.log(launch.flightNumber, launch.mission)

      // TODO: populate Launche
      await saveLaunch(launch)
    }
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat"
  })
  if (firstLaunch) {
    console.log("Lauch Data Already Loaded.")
  } else {
    await populateLaunches()
  }
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDB.findOne().sort("-flightNumber")

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER
  }

  return latestLaunch.flightNumber
}

async function getAllLaunches(limit, skip) {
  return await launchesDB
    .find(
      {},
      {
        _id: 0,
        __v: 0
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit)
}

async function saveLaunch(launch) {
  //findOneAndUpdate()
  await launchesDB.updateOne(
    {
      flightNumber: launch.flightNumber
    },
    launch,
    {
      upsert: true
    }
  )
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.destination
  })

  if (!planet) {
    throw new Error("No matching planet found")
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Zero to mastery", "NASA"],
    flightNumber: newFlightNumber
  })

  await saveLaunch(newLaunch)
}

async function findLaunch(filter) {
  return await launchesDB.findOne(filter)
}

async function existsLaunchById(launchId) {
  return await findLaunch({ flightNumber: launchId })
}

async function abortLauchById(launchId) {
  const aborted = await launchesDB.updateOne(
    {
      flightNumber: launchId
    },
    {
      upcoming: false,
      success: false
    }
  )
  return aborted.acknowledged && aborted.matchedCount === 1
}

module.exports = {
  loadLaunchData,
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchById,
  abortLauchById
}
