import { useCallback, useEffect, useState } from "react"

import { httpGetLaunches, httpSubmitLaunch, httpAbortLaunch } from "./requests"

function useLaunches(onSuccessSound, onAbortSound, onFailureSound) {
  const [launches, saveLaunches] = useState([])
  const [isPendingLaunch, setPendingLaunch] = useState(false)

  const getLaunches = useCallback(async () => {
    const fetchedLaunches = await httpGetLaunches()
    saveLaunches(fetchedLaunches)
  }, [])

  useEffect(() => {
    getLaunches()
  }, [getLaunches])

  const submitLaunch = useCallback(
    e => {
      e.preventDefault()
      setPendingLaunch(true)
      const data = new FormData(e.target)
      const launchDate = new Date(data.get("launch-day"))
      const mission = data.get("mission-name")
      const rocket = data.get("rocket-name")
      const destination = data.get("planets-selector")
      httpSubmitLaunch({
        launchDate,
        mission,
        rocket,
        destination
      })
        .then(res => {
          console.log(res)
          getLaunches()
          setTimeout(() => {
            setPendingLaunch(false)
            onSuccessSound()
          }, 800)
        })
        .catch(err => {
          onFailureSound()
          console.log(err)
        })
    },
    [getLaunches, onSuccessSound, onFailureSound]
  )

  const abortLaunch = useCallback(
    async id => {
      const response = await httpAbortLaunch(id)
      console.log(response)
      const success = response.ok
      if (success) {
        getLaunches()
        onAbortSound()
      } else {
        onFailureSound()
      }
    },
    [getLaunches, onAbortSound, onFailureSound]
  )

  return {
    launches,
    isPendingLaunch,
    submitLaunch,
    abortLaunch
  }
}

export default useLaunches
