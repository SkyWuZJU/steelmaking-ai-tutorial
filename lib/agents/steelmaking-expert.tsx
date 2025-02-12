import { CoreMessage } from 'ai'
import { createStreamableUI, createStreamableValue } from 'ai/rsc'
import { AnswerSection } from '@/components/answer-section'
import { vectorstore } from '@/app/api/file/vector-store'
import { ChatOpenAI } from '@langchain/openai'
import {
  SystemMessage,
  HumanMessage,
  BaseMessage
} from '@langchain/core/messages'
import { HumanMessagePromptTemplate } from '@langchain/core/prompts'
import { DocumentInterface } from '@langchain/core/documents'
import { convertToLangchainBaseMessage } from './helper-function'

const SYSTEM_PROMPT = `你是一名转炉炼钢领域的专家。对于用户提出的问题，你善于将提供的背景知识和自己的经验知识相结合，给出专业和直接的回答。`
const PROMPT = '用户现在的问题：{user_message}\n参考知识：{context}'

export async function steelmakingExpert(
  uiStream: ReturnType<typeof createStreamableUI>,
  aiMessages: CoreMessage[]
) {
  try {
    // Step 1: Prepare required variables
    let fullResponse = ''
    const streamableText = createStreamableValue<string>()
    const humanMessageTemplate = HumanMessagePromptTemplate.fromTemplate(PROMPT)
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.3
    })
    let langchainMessages = aiMessages.map(convertToLangchainBaseMessage)
    langchainMessages = formatAllHumanMessages(langchainMessages)
    langchainMessages = addSystemMessage(langchainMessages, SYSTEM_PROMPT)

    // Step 2: Retrieve context knowledge and finalize the message list
    const retriever = vectorstore.asRetriever(10) // TODO: Advanced config for the retriever
    const retrievedDocuments = await retriever.invoke(
      langchainMessages[langchainMessages.length - 1].content as string
    )
    const lastUserMessage = await humanMessageTemplate.format({
      user_message: aiMessages[aiMessages.length - 1].content,
      context: formatDocumentToContext(retrievedDocuments)
    })

    langchainMessages[langchainMessages.length - 1].content = lastUserMessage.content
    // console.debug(
    //   '#### Messages ####\n',
    //   langchainMessages.map(msg => `${msg.getType()}\n${msg.content}`).join('\n')
    // )

    // Step 3: Stream the messages to the model
    const result = await model.stream(langchainMessages)
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

function addSystemMessage(
  messages: BaseMessage[],
  systemPrompt: string
): BaseMessage[] {
  if (messages[0].getType() !== 'system') {
    return [new SystemMessage(systemPrompt), ...messages]
  } else {
    return messages
  }
}

function formatAllHumanMessages(messages: BaseMessage[]): BaseMessage[] {
  return messages.map(msg => {
    if (msg.getType() === 'human') {
      return new HumanMessage(parseInputString((msg as HumanMessage).content as string))
    } else {
      return msg
    }
  })
}

function parseInputString(possibleJson: string): string {
  try {
    const obj = JSON.parse(possibleJson)
    if (obj && typeof obj === 'object' && 'input' in obj) {
      return obj.input
    }
  } catch {
    // do nothing
  }
  return possibleJson
}
