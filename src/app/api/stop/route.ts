import { AccessToken, EgressClient, EncodedFileType } from "livekit-server-sdk"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")

  const apiKey = process.env.NEXT_PUBLIC_LIVEKIT_API_KEY
  const apiSecret = process.env.NEXT_PUBLIC_LIVEKIT_API_SECRET
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL
  const egressClient = new EgressClient(wsUrl!, apiKey, apiSecret)

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }
  try {
    const response = await egressClient.stopEgress(id)
    return NextResponse.json(response)
  } catch (error) {
    console.log(error, "Error while")
    return NextResponse.json(error)
  }
}
