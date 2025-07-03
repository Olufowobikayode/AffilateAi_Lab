import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export const scrapePage = async (url: string): Promise<string> => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.content();
    return content;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const parseHtml = (html: string, selector: string): string[] => {
  const $ = cheerio.load(html);
  const results: string[] = [];
  $(selector).each((_i, element) => {
    results.push($(element).text().trim());
  });
  return results;
};
