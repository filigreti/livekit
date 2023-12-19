import { AccessToken, EgressClient, EncodedFileType } from "livekit-server-sdk"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room")
  const username = req.nextUrl.searchParams.get("username")
  if (!room) {
    return NextResponse.json(
      { error: 'Missing "room" query parameter' },
      { status: 400 }
    )
  } else if (!username) {
    return NextResponse.json(
      { error: 'Missing "username" query parameter' },
      { status: 400 }
    )
  }

  const apiKey = process.env.NEXT_PUBLIC_LIVEKIT_API_KEY
  const apiSecret = process.env.NEXT_PUBLIC_LIVEKIT_API_SECRET
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  }

  const at = new AccessToken(apiKey, apiSecret, { identity: username })

  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true })

  return NextResponse.json({ token: at.toJwt() })
}

export async function POST(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room")

  const apiKey = process.env.NEXT_PUBLIC_LIVEKIT_API_KEY
  const apiSecret = process.env.NEXT_PUBLIC_LIVEKIT_API_SECRET
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL
  const egressClient = new EgressClient(wsUrl!, apiKey, apiSecret)

  const output = {
    fileType: EncodedFileType.MP4,
    filepath: "livekit-demo/room-composite-test.mp4",
    s3: {
      accessKey: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
      secret: process.env.NEXT_PUBLIC_S3_SECRET,
      bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      region: "us-east-1",
    },
  }
  if (!room) {
    return NextResponse.json(
      { error: 'Missing "room" query parameter' },
      { status: 400 }
    )
  }
  try {
    const response = await egressClient.startRoomCompositeEgress(room!, output)
    return NextResponse.json(response)
  } catch (error) {
    console.log(error, "Error while")
    return NextResponse.json(error)
  }
}
