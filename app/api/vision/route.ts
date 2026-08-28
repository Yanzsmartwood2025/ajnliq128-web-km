import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { image } = await req.json()
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Ensure it's a valid Base64 Data URL, and extract the base64 part if needed
    const base64Image = image.startsWith('data:image')
      ? image.split(',')[1]
      : image

    // Fallback rotation logic
    const groqKey = process.env.GROQ_API_KEY
    const mistralKey = process.env.MISTRAL_API_KEY

    // Try Groq first
    if (groqKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.2-11b-vision-preview',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Describe brevemente qué se dibujó en esta imagen (trazos blancos sobre fondo oscuro). Responde como si fueras arIA, una IA amistosa.' },
                  { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } }
                ]
              }
            ]
          })
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({ reply: data.choices[0].message.content })
        }
        console.error('Groq Vision API failed:', await response.text())
      } catch (err) {
        console.error('Groq Vision request error:', err)
      }
    }

    // Fallback to Mistral
    if (mistralKey) {
      try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mistralKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'pixtral-12b-2409',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Describe brevemente qué se dibujó en esta imagen (trazos blancos sobre fondo oscuro). Responde como si fueras arIA, una IA amistosa.' },
                  { type: 'image_url', image_url: `data:image/png;base64,${base64Image}` }
                ]
              }
            ]
          })
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({ reply: data.choices[0].message.content })
        }
        console.error('Mistral Vision API failed:', await response.text())
      } catch (err) {
        console.error('Mistral Vision request error:', err)
      }
    }

    // If both fail or no keys provided, return mock
    return NextResponse.json({ reply: 'Veo que dibujaste algo interesante... ¡Me gusta! (Mock response)' })

  } catch (error) {
    console.error('Vision API Route Error:', error)
    return NextResponse.json({ reply: 'Parece que hubo un error al procesar tu dibujo. (Mock fallback)' })
  }
}
