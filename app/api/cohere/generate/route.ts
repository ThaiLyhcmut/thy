import { NextRequest, NextResponse } from 'next/server'

// Real Cohere API integration
const COHERE_API_KEY = '0gP9Z4gXgoGC4rf7eldEuJpoUo4TXStMI0bq30W9'

export async function POST(request: NextRequest) {
  try {
    const { prompt, max_tokens, temperature, model } = await request.json()

    console.log('Calling Cohere API with prompt:', prompt.substring(0, 100) + '...')

    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'command',
        prompt,
        max_tokens: max_tokens || 300,
        temperature: temperature || 0.8,
        stop_sequences: [],
      })
    })

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Cohere API response:', data)
    
    const generatedText = data.generations && data.generations.length > 0 
      ? data.generations[0].text 
      : data.text || ''
    
    console.log('Generated text length:', generatedText.length)
    
    return NextResponse.json({
      text: generatedText
    })
  } catch (error) {
    console.error('Cohere API error:', error)
    
    // Fallback to mock data if Cohere API fails
    const fallbackResponse = {
      text: `Chúc mừng năm mới
Gia đình hạnh phúc
Sức khỏe dồi dào
Công việc thuận lợi
Học tập tốt
Tình yêu đẹp
Bạn bè thân thiết
Du lịch vui vẻ
Ăn ngon ngủ kỏi
Cuộc sống bình an
Thời tiết đẹp trời
Gặp may mắn
Kiếm được tiền
Mua nhà mới
Có xe đẹp
Thi đậu đại học
Được thăng chức
Làm việc chăm chỉ
Nghỉ ngơi thư giãn
Vui vẻ mỗi ngày`
    }

    return NextResponse.json(fallbackResponse)
  }
}

// Real Cohere API integration with your key:
// Uncomment and use this instead of mock for production:
/*
const COHERE_API_KEY = '0gP9Z4gXgoGC4rf7eldEuJpoUo4TXStMI0bq30W9'

export async function POST(request: NextRequest) {
  try {
    const { prompt, max_tokens, temperature, model } = await request.json()

    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'command',
        prompt,
        max_tokens: max_tokens || 300,
        temperature: temperature || 0.8,
        stop_sequences: [],
      })
    })

    const data = await response.json()
    
    return NextResponse.json({
      text: data.generations[0].text
    })
  } catch (error) {
    console.error('Cohere API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate phrases' },
      { status: 500 }
    )
  }
}
*/