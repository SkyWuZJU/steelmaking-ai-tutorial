import { Document } from '@langchain/core/documents'
import {
  Slide,
  Group,
  Element,
  Table,
  Shape,
  Diagram,
  BaseElement
} from 'pptxtojson'
import { JSDOM } from 'jsdom'

export const parsePptxToDocument = async (
  slides: Slide[]
): Promise<Document[]> => {
  const cleanedSlides = removeDuplicatedElements(slides)

  const documents = parseSlidesToDocument(cleanedSlides)

  return documents
}

/**
 * Clean up the slide by removing template elements
 * @param slides
 */
function removeDuplicatedElements(slides: Slide[]): Slide[] {
  const REMOVE_THREADHOLD = 0.8
  let cleanedSlides = slides

  if (slides.length <= 1) {
    return slides
  }

  // Check every element, and remove it from every slide if it's in every slide
  cleanedSlides.forEach(slide => {
    slide.elements.forEach(element => {
      const dupliactRatio =
        getElementRepeatCount(element, cleanedSlides) / cleanedSlides.length

      if (dupliactRatio >= REMOVE_THREADHOLD) {
        console.debug(
          `dupliactRatio is ${dupliactRatio}. Removing......`,
          element.type == 'text' ? element.content : element
        )
        cleanedSlides = cleanedSlides.map(slide => {
          return removeElementFromSlide(element, slide)
        })
      }
    })
  })

  return cleanedSlides
}

function parseSlidesToDocument(slides: Slide[]): Document[] {
  // Generate a document for each slide
  const documents: Document[] = slides.map((slide, index) => {
    let pageContent = ''

    slide.elements.forEach(element => {
      if (element.type === 'group') {
        element.elements.forEach(groupElement => {
          pageContent += extractDataFromBaseElement(groupElement) + '\n'
        })
      } else {
        pageContent += extractDataFromBaseElement(element) + '\n'
      }
    })

    return new Document({
      pageContent: pageContent,
      metadata: {
        slideIndex: index
      }
    })
  })

  return documents
}

//
// Helper functions
//

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

function getElementRepeatCount(element: Element, slides: Slide[]): number {
  return slides.filter(slide =>
    slide.elements.some(slideElement => deepEqual(slideElement, element))
  ).length
}

function removeElementFromSlide(element: Element | Group, slide: Slide): Slide {
  return {
    ...slide,
    elements: slide.elements.filter(
      slideElement => !deepEqual(slideElement, element)
    )
  }
}

//
// Element helper functions
//

function extractDataFromBaseElement(element: BaseElement): string {
  if (element.type === 'text') {
    return extractTextFromHTML(element.content)
  } else if (element.type === 'table') {
    return extractDataFromTable(element)
  } else if (element.type === 'shape') {
    return extractDataFromShape(element)
  } else if (element.type === 'diagram') {
    return extractDataFromDiagram(element)
  } else {
    return ''
  }
}

function extractTextFromHTML(htmlString: string): string {
  const dom = new JSDOM(htmlString)
  const textContent = dom.window.document.body.textContent || ''
  return textContent + '\n'
}

function isElementInEverySlide(element: Element, slides: Slide[]): boolean {
  return slides.every(slide =>
    slide.elements.some(slideElement => deepEqual(slideElement, element))
  )
}

function extractDataFromTable(table: Table): string {
  const textedTable = table.data.map(row =>
    row.map(cell => extractTextFromHTML(cell.text))
  )
  let tableContent = ''

  // format the table to a string like: '1 | 2 | 3\n4 | 5 | 6\n'
  textedTable.forEach(row => {
    tableContent += row.join(' | ') + '\n'
  })

  return tableContent
}

function extractDataFromShape(shape: Shape): string {
  const content = extractTextFromHTML(shape.content)
  return content
}

function extractDataFromDiagram(diagram: Diagram): string {
  let diagramContent = ''

  diagram.elements.forEach(element => {
    if (element.type === 'text') {
      diagramContent += extractTextFromHTML(element.content) + '\n'
    } else if (element.type === 'shape') {
      diagramContent += extractDataFromShape(element) + '\n'
    }
  })

  return diagramContent
}
