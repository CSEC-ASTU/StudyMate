// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const BACKEND_URL = process.env.BACKEND_API_URL || 'https://studymate-api-vl93.onrender.com'
    
    console.log('Forwarding login to backend:', `${BACKEND_URL}/api/auth/login`)
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const text = await response.text()
    console.log('Backend login response status:', response.status)
    console.log('Backend login response text:', text)
    
    let data;
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('Failed to parse backend login response as JSON:', e)
      return NextResponse.json(
        { error: 'Backend returned invalid JSON', rawResponse: text },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: response.status })
    
  } catch (error: any) {
    console.error('Login proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to login', message: error.message },
      { status: 500 }
    )
  }
}