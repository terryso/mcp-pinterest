// Pinterest image scraper using puppeteer-core
import fs from 'fs';
import puppeteer from 'puppeteer-core';

// Default configuration constants
const DEFAULT_SEARCH_LIMIT = 10;
const DEFAULT_HEADLESS_MODE = true;

class PinterestScraper {
  constructor() {
    this.baseUrl = 'https://www.pinterest.com';
    this.searchUrl = `${this.baseUrl}/search/pins/?q=`;
    // Default Chrome paths for different platforms
    this.chromePaths = {
      mac: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      macAlt: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      linux: '/usr/bin/google-chrome',
      win: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      winAlt: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    };
  }

  /**
   * Search for Pinterest images
   * @param {string} keyword - Search keyword
   * @param {number} limit - Result limit
   * @param {boolean} headless - Whether to use headless mode
   * @returns {Promise<Array>} - Search results array
   */
  async search(keyword, limit = DEFAULT_SEARCH_LIMIT, headless = DEFAULT_HEADLESS_MODE) {
    // Debug log for parameters
    console.error('PinterestScraper.search called with:');
    console.error('- keyword:', keyword);
    console.error('- limit:', limit);
    console.error('- headless:', headless);
    
    let browser = null;
    
    try {
      // Build search URL
      const searchQuery = encodeURIComponent(keyword);
      const url = `${this.searchUrl}${searchQuery}`;
      console.error('Search URL:', url);
      
      // Launch browser - using system installed Chrome
      try {
        const options = {
          headless: headless ? 'new' : false,
          args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
          ]
        };
        
        // Try to find Chrome executable
        const platform = process.platform;
        if (platform === 'darwin') {
          options.executablePath = this.chromePaths.mac;
        } else if (platform === 'linux') {
          options.executablePath = this.chromePaths.linux;
        } else if (platform === 'win32') {
          options.executablePath = this.chromePaths.win;
        }
        
        console.error('Launching browser with options:', JSON.stringify(options));
        browser = await puppeteer.launch(options);
      } catch (err) {
        console.error('Failed to launch browser:', err.message);
        return [];
      }
      
      if (!browser) {
        console.error('Browser is null, returning empty results');
        return [];
      }
      
      // Create new page
      let page;
      try {
        page = await browser.newPage();
      } catch (err) {
        console.error('Failed to create page:', err.message);
        await browser.close();
        return [];
      }
      
      // Set viewport size
      await page.setViewport({ width: 1280, height: 800 }).catch(err => {
        console.error('Failed to set viewport:', err.message);
      });
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36').catch(err => {
        console.error('Failed to set user agent:', err.message);
      });
      
      // Set timeouts
      page.setDefaultNavigationTimeout(60000);
      page.setDefaultTimeout(30000);
      
      // Simplify request interception
      try {
        await page.setRequestInterception(true);
        page.on('request', (req) => {
          const resourceType = req.resourceType();
          if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media') {
            req.abort();
          } else {
            req.continue();
          }
        });
      } catch (err) {
        console.error('Failed to set request interception:', err.message);
      }
      
      // Navigate to Pinterest search page
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      } catch (err) {
        console.error('Page navigation failed:', err.message);
        await browser.close();
        return [];
      }
      
      // Wait for images to load
      try {
        await page.waitForSelector('div[data-test-id="pin"]', { timeout: 10000 });
      } catch (err) {
        console.log('Pin elements not found, but continuing:', err.message);
      }
      
      // Scroll page to load more content
      try {
        // Calculate scroll distance based on limit
        const scrollDistance = Math.max(limit * 300, 1000);
        await this.autoScroll(page, scrollDistance);
      } catch (err) {
        console.error('Failed to scroll page:', err.message);
      }
      
      // Extract image data
      let results = [];
      
      try {
        // Extract src attributes from all image elements
        results = await page.evaluate(() => {
          const images = Array.from(document.querySelectorAll('img'));
          return images
            .filter(img => img.src && img.src.includes('pinimg.com'))
            .map(img => {
              let imageUrl = img.src;
              
              // Handle various thumbnail sizes, convert to original size
              if (imageUrl.match(/\/\d+x\d*\//)) {
                imageUrl = imageUrl.replace(/\/\d+x\d*\//, '/originals/');
              }
              
              // Replace specific thumbnail patterns
              const thumbnailPatterns = ['/60x60/', '/236x/', '/474x/', '/736x/'];
              for (const pattern of thumbnailPatterns) {
                if (imageUrl.includes(pattern)) {
                  imageUrl = imageUrl.replace(pattern, '/originals/');
                  break;
                }
              }
              
              return {
                title: img.alt || 'Unknown Title',
                image_url: imageUrl,
                link: img.closest('a') ? img.closest('a').href : imageUrl,
                source: 'pinterest'
              };
            });
        }).catch(err => {
          console.error('Failed to extract images:', err.message);
          return [];
        });
      } catch (err) {
        console.error('Error evaluating page:', err.message);
        results = [];
      }
      
      // Ensure results is an array
      const validResults = Array.isArray(results) ? results : [];
      
      // Deduplicate and limit results
      const uniqueResults = [];
      const urlSet = new Set();
      
      for (const item of validResults) {
        if (uniqueResults.length >= limit) break;
        
        // Ensure item is valid object with image_url property
        if (item && typeof item === 'object' && item.image_url && !urlSet.has(item.image_url)) {
          urlSet.add(item.image_url);
          uniqueResults.push(item);
        }
      }
      
      return uniqueResults;
    } catch (error) {
      console.error('Pinterest search error:', error.message);
      return [];
    } finally {
      // Close browser
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          console.error('Error closing browser:', e.message);
        }
      }
    }
  }
  
  /**
   * Auto-scroll page to load more content
   * @param {Page} page - Puppeteer page object
   * @param {number} maxScrollDistance - Maximum scroll distance
   */
  async autoScroll(page, maxScrollDistance = 3000) {
    await page.evaluate(async (maxScrollDistance) => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          
          // Stop after scrolling a certain distance
          if (totalHeight >= maxScrollDistance) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    }, maxScrollDistance);
    
    // Wait for new content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  /**
   * Download image
   * @param {string} imageUrl - Image URL
   * @param {string} outputPath - Output path
   * @returns {Promise<boolean>} - Whether download was successful
   */
  async downloadImage(imageUrl, outputPath) {
    try {
      console.log(`Downloading image: ${imageUrl}`);
      
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed, status code: ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      
      console.log(`Image saved to: ${outputPath}`);
      return true;
    } catch (error) {
      console.error(`Failed to download image: ${error.message}`);
      return false;
    }
  }
}

// Export PinterestScraper class
export { PinterestScraper as default }; 