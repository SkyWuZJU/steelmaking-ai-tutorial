import {
  CoreMessage,
  CoreUserMessage,
  CoreToolMessage,
  CoreSystemMessage,
  CoreAssistantMessage,
  ToolResultPart
} from 'ai'
import {
  SystemMessage,
  BaseMessage,
  HumanMessage,
  AIMessage,
  FunctionMessage
} from '@langchain/core/messages'

/**
 * Convert a message from Vercel AI CoreMessage to Langchain BaseMessage
 * @param message A CoreMessage object of Vercel AI SDK
 * @returns A BaseMessage object of Langchain Core
 */
export const convertToLangchainBaseMessage = (
  message: CoreMessage
): BaseMessage => {
  // if message is an instance of CoreUserMessage
  const content = typeof message.content === 'string' ? message.content : ''
  const kwargs = message.experimental_providerMetadata

  if ((message as CoreUserMessage).role === 'user') {
    return new HumanMessage(content, kwargs)
  } else if ((message as CoreAssistantMessage).role === 'assistant') {
    return new AIMessage(content, kwargs)
  } else if ((message as CoreSystemMessage).role === 'system') {
    return new SystemMessage(content, kwargs)
  } else if ((message as CoreToolMessage).role === 'tool') {
    const toolContent = message.content
    if (typeof toolContent === 'string') {
      return new FunctionMessage({
        name: 'tool',
        content: toolContent,
        additional_kwargs: kwargs
      })
    } else if (toolContent.length === 1) {
      const toolPart = toolContent[0] as ToolResultPart
      return new FunctionMessage({
        name: toolPart.toolName,
        content: JSON.stringify(toolPart.result),
        id: toolPart.toolCallId,
        additional_kwargs: toolPart.experimental_providerMetadata
      })
    } else {
      throw new Error('Unknown message type')
    }
  } else {
    throw new Error('Unknown message type')
  }
}
