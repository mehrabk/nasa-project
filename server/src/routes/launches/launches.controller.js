const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchById,
  abortLauchById
} = require("../../models/launches.model")

const { getPagination } = require("../../services/query")

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query)
  const launches = await getAllLaunches(skip, limit)
  return res.status(200).json(launches)
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body
  if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.destination) {
    return res.status(400).json({
      error: "Missing required launch property"
    })
  }

  launch.launchDate = new Date(launch.launchDate)
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date"
    })
  }

  launch.launchDate = new Date(launch.launchDate)
  await scheduleNewLaunch(launch)
  return res.status(201).json(launch)
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id)
  const existLaunch = await existsLaunchById(launchId)
  if (!existLaunch) {
    return res.status(404).json({
      error: "Launch Not Found!"
    })
  }

  const aborted = await abortLauchById(launchId)
  if (!aborted) {
    return res.status(400).json({
      error: "Launch not aborted"
    })
  }
  return res.status(200).json({
    ok: true
  })
}

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch }
