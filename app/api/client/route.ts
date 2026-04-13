import { NextResponse } from 'next/server'

// Placeholder client validation — extend with Airtable Clients table later
const DEMO_CLIENTS: Record<string, { nom: string; multiplicateur: number; categories: string[] }> = {
  'HTL-DEMO-001': { nom: 'Hôtel Démo', multiplicateur: 0.85, categories: ['salon', 'chambre'] },
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json() as { code: string }
    const client = DEMO_CLIENTS[code?.toUpperCase()]

    if (!client) {
      return NextResponse.json({ valid: false }, { status: 404 })
    }

    return NextResponse.json({ valid: true, ...client })
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}
