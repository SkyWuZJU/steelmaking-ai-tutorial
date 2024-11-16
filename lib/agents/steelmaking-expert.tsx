import { CoreMessage, streamText, CoreUserMessage } from "ai";
import { createStreamableUI, createStreamableValue } from "ai/rsc";
import { openai } from '@ai-sdk/openai';
import { AnswerSection } from "@/components/answer-section";
import { vectorstore } from "@/app/api/file/vector-store"
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, BaseMessage, HumanMessage, AIMessage, FunctionMessage } from "@langchain/core/messages";
import { HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { DocumentInterface } from "@langchain/core/documents";

const SYSTEM_PROMPT = `你是一名转炉炼钢领域的专家。对于用户提出的问题，你善于将提供的背景知识和自己的经验知识相结合，给出专业和直接的回答。`
const PROMPT = `用户：{user_message}\n参考知识：{context}`

/**
 * Convert a message from Vercel AI CoreMessage to Langchain BaseMessage
 * @param message A CoreMessage object of Vercel AI SDK
 * @returns A BaseMessage object of Langchain Core
 */
const convertToLangchainBaseMessage = (message: CoreMessage): BaseMessage => {
    // if message is an instance of CoreUserMessage
    if (message.role === 'user') {
        return new HumanMessage(typeof message.content === 'string' ? message.content : '')
    } else if (message.role === 'assistant') {
        return new AIMessage(typeof message.content === 'string' ? message.content : '')
    } else if (message.role === 'system') {
        return new SystemMessage(typeof message.content === 'string' ? message.content : '')
    } else {
        return new FunctionMessage({
            name: message.role,
            content: typeof message.content === 'string' ? message.content : ''
        })
    }
}

const formatDocumentToContext = (documents: DocumentInterface[]): string => {
    // TODO: Waiting for further implementation. Now just union all the pageContent
    return documents.map(doc => doc.pageContent).join('\n')
}

export async function steelmakingExpert(
    uiStream: ReturnType<typeof createStreamableUI>,
    messages: CoreMessage[]
) {
    try{
        // Step 1: Prepare required variables
        let fullResponse = ''
        const streamableText = createStreamableValue<string>()
        const retriever = vectorstore.asRetriever()  // TODO: Advanced config for the retriever
        const humanMessageTemplate = HumanMessagePromptTemplate.fromTemplate(PROMPT)
        const model = new ChatOpenAI(
            {
                model: 'gpt-4o',
                temperature: 0.5,
            },
        )
        let wrappedMessages = messages.slice(0, -1).map(convertToLangchainBaseMessage)
        wrappedMessages.unshift(new SystemMessage(SYSTEM_PROMPT))

        // Step 2: Retrieve context knowledge and finalize the message list
        const retrievedDocuments = await retriever.invoke(wrappedMessages[wrappedMessages.length - 1].content as string)
        const lastUserMessage = await humanMessageTemplate.format({
            user_message: messages[messages.length - 1].content,
            context: formatDocumentToContext(retrievedDocuments)
        }) 
        wrappedMessages.push(new HumanMessage(lastUserMessage))

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