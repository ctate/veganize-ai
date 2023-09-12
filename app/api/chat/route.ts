import OpenAI from 'openai'
import {
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData,
} from 'ai'
import { NextRequest } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  messages.unshift({
    role: 'system',
    content:
      'Veganize the recipe below. Only return the ingredients and the directions in the response.',
  })

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages,
  })

  const data = new experimental_StreamData()

  let message = ''
  const stream = OpenAIStream(response, {
    onToken(token) {
      message += token
    },
    async onFinal() {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          ...messages,
          {
            role: 'assistant',
            content: message,
          },
          {
            role: 'user',
            content: 'Come up with a name for this recipe',
          },
        ],
      })

      const title = response.choices[0].message.content!

      const imageResponse = await openai.images.generate({
        prompt: title,
        n: 1,
        size: '512x512',
      })

      const imageUrl = imageResponse.data[0].url!

      data.append({
        imageUrl,
        title,
      })

      data.close()
    },
    experimental_streamData: true,
  })

  return new StreamingTextResponse(stream, {}, data)
}
