"use client"

import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from "@livekit/components-react"
import { useEffect, useState } from "react"
import { Track } from "livekit-client"
import { useSearchParams } from "next/navigation"
import { EncodedFileType, EgressClient } from "livekit-server-sdk"
import "@livekit/components-styles"

export default function Page() {
  // TODO: get user input for room and name
  const searchParams = useSearchParams()
  const room = "bigger9-room"
  const [token, setToken] = useState("")
  const [id, setId] = useState("")

  const search = searchParams.get("name")
  const name = `bigger9-user-${search}`

  const record = async () => {
    try {
      const resp = await fetch(
        `/api/get-participant-token?room=${room}&username=${name}`,
        {
          method: "POST",
        }
      )
      const data = await resp.json()
      console.log(data, "bbb")
      setId(data.egressId)
    } catch (error) {}
  }

  const stop = async () => {
    try {
      const resp = await fetch(`/api/stop?id=${id}`, {
        method: "POST",
      })
      const data = await resp.json()
      console.log(data, "fubar")
    } catch (error) {}
  }

  useEffect(() => {
    ;(async () => {
      try {
        const resp = await fetch(
          `/api/get-participant-token?room=${room}&username=${name}`
        )
        const data = await resp.json()
        setToken(data.token)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  if (token === "") {
    return <div>Getting token...</div>
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      // Use the default LiveKit theme for nice styles.
      data-lk-theme="default"
      style={{ height: "100dvh" }}
    >
      {/* Your custom component with basic video conferencing functionality. */}
      <MyVideoConference />
      {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
      <RoomAudioRenderer />
      <div
        onClick={record}
        className="bg-blue-500 py-5 rounded px-4 inline-flex  cursor-pointer"
      >
        record
      </div>
      <div
        onClick={stop}
        className="bg-red-500 py-5 rounded px-4 inline-flex  cursor-pointer"
      >
        stop
      </div>
      {/* Controls for the user to start/stop audio, video, and screen 
      share tracks and to leave the room. */}
      <ControlBar />
    </LiveKitRoom>
  )
}

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  )
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
      <ParticipantTile />
    </GridLayout>
  )
}
