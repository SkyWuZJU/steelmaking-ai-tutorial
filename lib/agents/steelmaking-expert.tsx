import { CoreMessage } from 'ai'
import { createStreamableUI, createStreamableValue } from 'ai/rsc'
import { AnswerSection } from '@/components/answer-section'
import { vectorstore } from '@/app/api/file/vector-store'
import { ChatOpenAI } from '@langchain/openai'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import { HumanMessagePromptTemplate } from '@langchain/core/prompts'
import { DocumentInterface } from '@langchain/core/documents'
import { convertToLangchainBaseMessage } from './helper-function'

const SYSTEM_PROMPT = `你是一名转炉炼钢领域的专家。对于用户提出的问题，你善于将提供的背景知识和自己的经验知识相结合，给出专业和直接的回答。`
const PROMPT = `用户：{user_message}\n参考知识：{context}`

export async function steelmakingExpert(
  uiStream: ReturnType<typeof createStreamableUI>,
  messages: CoreMessage[]
) {
  try {
    // Step 1: Prepare required variables
    let fullResponse = ''
    const streamableText = createStreamableValue<string>()
    const retriever = vectorstore.asRetriever() // TODO: Advanced config for the retriever
    const humanMessageTemplate = HumanMessagePromptTemplate.fromTemplate(PROMPT)
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.5
    })
    let wrappedMessages = messages
      .slice(0, -1)
      .map(convertToLangchainBaseMessage)
    wrappedMessages.unshift(new SystemMessage(SYSTEM_PROMPT)) // TODO: Check if the system prompt is added duplicatedly

    // Step 2: Retrieve context knowledge and finalize the message list
    const retrievedDocuments = await retriever.invoke(
      wrappedMessages[wrappedMessages.length - 1].content as string
    )
    const lastUserMessage = await humanMessageTemplate.format({
      user_message: messages[messages.length - 1].content,
      context: formatDocumentToContext(retrievedDocuments)
    })
    wrappedMessages.push(new HumanMessage(lastUserMessage))
    console.debug(
      '#### Messages ####\n',
      wrappedMessages.map(msg => `${msg.getType()}\n${msg.content}`).join('\n')
    )

    // Step 3: Stream the messages to the model
    const result = await model.stream(wrappedMessages)
    uiStream.update(<AnswerSection result={streamableText.value} />)

    for await (const chunk of result) {
      fullResponse += chunk.content
      streamableText.update(fullResponse)
    }

    streamableText.done(fullResponse)

    const toolResults: any[] = []
    return { text: fullResponse, toolResults }
  } catch (error) {
    console.error('Error in steelmakinExpert:', error)
    return { text: 'An error has occurred. Please try again.', toolResults: [] }
  }
}

const formatDocumentToContext = (documents: DocumentInterface[]): string => {
  // TODO: Waiting for further implementation. Now just union all the pageContent
  return documents.map(doc => doc.pageContent).join('\n')
}
