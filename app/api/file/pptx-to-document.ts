import { Document } from "@langchain/core/documents";
import { parse, Element, Slide, Group } from 'pptx2json-ts';
import { JSDOM } from 'jsdom';

export const parsePptxToDocument = async (blob: Blob): Promise<Document[]> => {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const parseResult = await parse(buffer);
  const slides = parseResult.slides as Slide[];
  // console.debug('#### Slides Overview ####\n', slides);
  // slides.map((slide, index) => {
  //   console.debug(`#### Slide ${index} ####\n`);
  //   slide.elements.forEach(element => console.debug('\n', element));
  // });

  const cleanedSlides = removeDuplicatedElements(slides);
  console.debug('#### Cleaned Slides Overview ####\n', cleanedSlides);
  cleanedSlides.map((slide, index) => {
    console.debug(`#### Cleaned Slide ${index} ####\n`);
    slide.elements.forEach(element => console.debug('\n', element));
  });

  const documents = parseSlidesToDocument(cleanedSlides);
  // console.debug('#### Documents ####\n', documents);

  return documents;
}

function extractTextFromHTML(htmlString: string): string {
  const dom = new JSDOM(htmlString);
  const textContent = dom.window.document.body.textContent || '';
  return textContent + '\n';
}

/**
 * Clean up the slide by removing template elements
 * @param slides 
 */
function removeDuplicatedElements(slides: Slide[]): Slide[] {
  // const REMOVE_THREADHOLD = 0.1;
  let cleanedSlides = slides;

  if (slides.length <= 1) { return slides; }

  function isElementInEverySlide(element: Element, slides: Slide[]): boolean {
    return slides.every(slide =>
      slide.elements.some(slideElement => deepEqual(slideElement, element))
    );
  }

  function removeElementFromSlide(element: Element | Group, slide: Slide): Slide {
    return {
      ...slide,
      elements: slide.elements.filter(slideElement => !deepEqual(slideElement, element))
    };
  }

  // Check every element, and remove it from every slide if it's in every slide
  cleanedSlides.forEach(slide => {
    slide.elements.forEach(element => {
      if (isElementInEverySlide(element, cleanedSlides)) {
        console.debug('Removing......', element.type == 'text' ? element.content : element.type);
        cleanedSlides = cleanedSlides.map(slide => {
          return removeElementFromSlide(element, slide);
        });
      }
    });
  });

  return cleanedSlides;
}

function parseSlidesToDocument(slides: Slide[]): Document[] {

  // Generate a document for each slide
  const documents: Document[] = slides.map((slide, index) => {
    
    let pageContent = '';

    slide.elements.forEach(element => {
      if (element.type === 'text') {
        pageContent += extractTextFromHTML(element.content);
      }
    });

    return new Document({
      pageContent: pageContent,
      metadata: {
        slideIndex: index
      }
    })

  });

  return documents;
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}