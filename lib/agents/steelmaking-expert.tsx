import { CoreMessage, streamText } from "ai";
import { createStreamableUI, createStreamableValue } from "ai/rsc";
import { openai } from '@ai-sdk/openai';
import { AnswerSection } from "@/components/answer-section";

const SYSTEM_PROMPT = `你是一名转炉炼钢领域的专家。对于用户提出的问题，你善于将提供的背景知识和自己的经验知识相结合，给出专业和直接的回答。`

export async function steelmakingExpert(
    uiStream: ReturnType<typeof createStreamableUI>,
    messages: CoreMessage[]
) {
    try{
        let fullResponse = ''
        const streamableText = createStreamableValue<string>()
    
        const result = await streamText({
            model: openai('gpt-4o'),
            system: SYSTEM_PROMPT,
            messages: messages,
        })
    
        uiStream.update(<AnswerSection result={streamableText.value} />)
    
        for await (const delta of result.fullStream) {
            if (delta.type === 'text-delta' && delta.textDelta) {
              fullResponse += delta.textDelta
              streamableText.update(fullResponse)
            }
          }
      
        streamableText.done(fullResponse)
    
        const toolResults: any[] = []
        return { text: fullResponse, toolResults }
    } catch (error) {
        console.error('Error in steelmakinExpert:', error)
        return { text: 'An error has occurred. Please try again.', toolResults: [] }
    }
}