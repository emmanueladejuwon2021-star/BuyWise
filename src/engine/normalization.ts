/**
 * PHASE 2 - ENGINE: Normalization & Tokenization
 * 
 * Handles string normalization, title tokenization, and fuzzy matching
 * for product deduplication and search intent parsing.
 */

// Common stop words to ignore during tokenization
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'this', 'that', 'new', 'hot',
  'sale', 'best', 'top', 'deal', 'free', 'shipping', 'original', 'genuine',
  'authentic', 'official', 'brand', 'latest', '2023', '2024', '2025',
]);

// Common abbreviations and their expansions
const ABBREVIATIONS: Record<string, string> = {
  'gb': 'gigabyte',
  'tb': 'terabyte',
  'mb': 'megabyte',
  'kg': 'kilogram',
  'mm': 'millimeter',
  'cm': 'centimeter',
  'inch': 'inch',
  'hz': 'hertz',
  'mhz': 'megahertz',
  'ghz': 'gigahertz',
  'mp': 'megapixel',
  'mah': 'milliampere hour',
  'usb': 'universal serial bus',
  'hd': 'high definition',
  'fhd': 'full high definition',
  'qhd': 'quad high definition',
  'uhd': 'ultra high definition',
  'oled': 'organic light emitting diode',
  'lcd': 'liquid crystal display',
  'led': 'light emitting diode',
  'ssd': 'solid state drive',
  'hdd': 'hard disk drive',
  'ram': 'random access memory',
  'cpu': 'central processing unit',
  'gpu': 'graphics processing unit',
  'wifi': 'wireless fidelity',
  'bt': 'bluetooth',
  'nfc': 'near field communication',
  'pro': 'professional',
  'max': 'maximum',
  'mini': 'mini',
  'plus': 'plus',
  'ultra': 'ultra',
};

// Common synonyms for fuzzy matching
const SYNONYMS: Record<string, string[]> = {
  'phone': ['smartphone', 'mobile', 'cellphone', 'cell phone'],
  'laptop': ['notebook', 'computer', 'pc'],
  'tv': ['television', 'monitor', 'display'],
  'headphone': ['headset', 'earphone', 'earbud'],
  'shoe': ['sneaker', 'footwear', 'trainer'],
  'shirt': ['tee', 't-shirt', 'top'],
  'watch': ['smartwatch', 'timepiece'],
};

/**
 * Normalize a string for comparison
 * - Lowercase
 * - Remove special characters (keep alphanumeric and spaces)
 * - Collapse whitespace
 * - Trim
 */
export function normalizeString(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace special chars with space
    .replace(/\s+/g, ' ')      // Collapse whitespace
    .trim();
}

/**
 * Tokenize a string into meaningful tokens
 * - Normalize first
 * - Split into words
 * - Remove stop words
 * - Expand abbreviations
 */
export function tokenize(input: string): string[] {
  const normalized = normalizeString(input);
  const words = normalized.split(' ').filter(w => w.length > 0);
  
  return words
    .filter(word => !STOP_WORDS.has(word))
    .map(word => ABBREVIATIONS[word] || word);
}

/**
 * Extract structured attributes from a product title
 * e.g., "Samsung Galaxy S23 Ultra 256GB Phantom Black"
 */
export interface ExtractedAttributes {
  brand?: string;
  model?: string;
  storage?: string;
  color?: string;
  size?: string;
  version?: string;
  rawTokens: string[];
}

const STORAGE_PATTERN = /\b(\d+)\s*(gb|tb|mb)\b/i;
const COLOR_PATTERN = /\b(black|white|red|blue|green|yellow|gold|silver|gray|grey|pink|purple|phantom|midnight|starlight|natural|graphite|space)\b/i;
const SIZE_PATTERN = /\b(\d+\.?\d*)\s*(inch|in|"|cm|mm)\b/i;
const VERSION_PATTERN = /\b(pro|max|plus|mini|ultra|lite|se)\b/i;

export function extractAttributes(title: string): ExtractedAttributes {
  const normalized = normalizeString(title);
  const tokens = normalized.split(' ').filter(t => t.length > 0);
  
  const storageMatch = title.match(STORAGE_PATTERN);
  const colorMatch = title.match(COLOR_PATTERN);
  const sizeMatch = title.match(SIZE_PATTERN);
  const versionMatch = title.match(VERSION_PATTERN);
  
  // Heuristic: first token is often the brand
  const knownBrands = ['apple', 'samsung', 'sony', 'nike', 'lg', 'dyson', 'amazon', 'hp', 'lenovo', 'adidas', 'xiaomi', 'google', 'microsoft', 'canon', 'bose', 'dell', 'jbl', 'secretlab', 'payporte'];
  const brand = tokens.find(t => knownBrands.includes(t));
  
  return {
    brand,
    model: tokens.slice(1, 4).join(' '), // Next few tokens often form the model
    storage: storageMatch ? `${storageMatch[1]}${storageMatch[2].toLowerCase()}` : undefined,
    color: colorMatch ? colorMatch[1].toLowerCase() : undefined,
    size: sizeMatch ? `${sizeMatch[1]}${sizeMatch[2]}` : undefined,
    version: versionMatch ? versionMatch[1].toLowerCase() : undefined,
    rawTokens: tokens,
  };
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score between two strings (0 to 1)
 */
export function stringSimilarity(a: string, b: string): number {
  const normA = normalizeString(a);
  const normB = normalizeString(b);
  
  if (normA === normB) return 1;
  if (!normA || !normB) return 0;
  
  const distance = levenshteinDistance(normA, normB);
  const maxLen = Math.max(normA.length, normB.length);
  return 1 - distance / maxLen;
}

/**
 * Calculate token overlap similarity (Jaccard-like)
 */
export function tokenOverlap(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  
  if (tokensA.size === 0 && tokensB.size === 0) return 1;
  
  let intersection = 0;
  tokensA.forEach(t => { if (tokensB.has(t)) intersection++; });
  
  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Check if two strings are synonyms (e.g., "phone" and "smartphone")
 */
export function areSynonyms(a: string, b: string): boolean {
  const normA = normalizeString(a);
  const normB = normalizeString(b);
  
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    const allTerms = [key, ...synonyms].map(normalizeString);
    if (allTerms.includes(normA) && allTerms.includes(normB)) return true;
  }
  return false;
}

/**
 * Parse search query for intent
 * - Detect quoted phrases for exact matching
 * - Extract brand, model, specs
 * - Detect category hints
 */
export interface SearchIntent {
  originalQuery: string;
  exactPhrases: string[];
  tokens: string[];
  detectedBrand?: string;
  detectedCategory?: string;
  detectedSpecs: Record<string, string>;
  isFuzzy: boolean;
}

const CATEGORY_HINTS: Record<string, string[]> = {
  phones: ['phone', 'smartphone', 'mobile', 'iphone', 'galaxy', 'pixel', 'tablet', 'ipad'],
  laptops: ['laptop', 'notebook', 'macbook', 'thinkpad', 'computer', 'pc'],
  electronics: ['headphone', 'earbud', 'tv', 'television', 'speaker', 'camera', 'watch', 'airpod'],
  fashion: ['shoe', 'sneaker', 'shirt', 'dress', 'jacket', 'nike', 'adidas'],
  gaming: ['playstation', 'ps5', 'xbox', 'nintendo', 'console', 'gaming'],
  appliances: ['vacuum', 'dyson', 'blender', 'microwave', 'refrigerator', 'washer'],
  home: ['chair', 'desk', 'furniture', 'sofa', 'bed', 'table'],
};

export function parseSearchIntent(query: string): SearchIntent {
  const exactPhrases: string[] = [];
  let cleanQuery = query;
  
  // Extract quoted phrases
  const quoteRegex = /"([^"]+)"/g;
  let match;
  while ((match = quoteRegex.exec(query)) !== null) {
    exactPhrases.push(match[1]);
  }
  cleanQuery = query.replace(quoteRegex, '').trim();
  
  const tokens = tokenize(cleanQuery);
  const attributes = extractAttributes(cleanQuery);
  
  // Detect category
  let detectedCategory: string | undefined;
  for (const [category, hints] of Object.entries(CATEGORY_HINTS)) {
    if (tokens.some(t => hints.includes(t)) || attributes.rawTokens.some(t => hints.includes(t))) {
      detectedCategory = category;
      break;
    }
  }
  
  // Detect specs
  const detectedSpecs: Record<string, string> = {};
  if (attributes.storage) detectedSpecs.storage = attributes.storage;
  if (attributes.color) detectedSpecs.color = attributes.color;
  if (attributes.size) detectedSpecs.size = attributes.size;
  if (attributes.version) detectedSpecs.version = attributes.version;
  
  // Check for fuzzy indicators (typos, partial words)
  const isFuzzy = tokens.some(t => t.length >= 3 && t.length <= 5) || query.includes('?');
  
  return {
    originalQuery: query,
    exactPhrases,
    tokens,
    detectedBrand: attributes.brand,
    detectedCategory,
    detectedSpecs,
    isFuzzy,
  };
}
