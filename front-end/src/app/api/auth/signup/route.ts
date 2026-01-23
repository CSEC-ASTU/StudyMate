// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Your backend API URL from environment variable
    const BACKEND_URL = process.env.BACKEND_API_URL || 'https://studymate-api-vl93.onrender.com'
    
    console.log('Forwarding to backend:', `${BACKEND_URL}/api/auth/signup`)
    
    // Forward request to your backend
    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const text = await response.text()
    console.log('Backend response status:', response.status)
    console.log('Backend response text:', text)
    
    // Try to parse as JSON, if it fails, handle the error
    let data;
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('Failed to parse backend response as JSON:', e)
      return NextResponse.json(
        { error: 'Backend returned invalid JSON', rawResponse: text },
        { status: 500 }
      )
    }
    
    // Return the backend response
    return NextResponse.json(data, { status: response.status })
    
  } catch (error: any) {
    console.error('Signup proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to sign up', message: error.message },
      { status: 500 }
    )
  }
}