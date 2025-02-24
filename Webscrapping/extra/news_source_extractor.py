from bs4 import BeautifulSoup
from datetime import datetime
import os

# News agency mapping for source matching
NEWS_AGENCY_MAPPING = {
    "The Times of India": ["Times of India", "TOI", "timesofindia"],
    "NDTV": ["NDTV News", "New Delhi Television", "ndtv"],
    "The Indian Express": ["Indian Express", "indianexpress"],
    "Hindustan Times": ["HT", "Hindustan Times", "hindustantimes"],
    "The Hindu": ["The Hindu", "thehindu"],
    "News18": ["CNN-News18", "News 18", "news18"],
    "India Today": ["India Today Group", "indiatoday"],
    "Zee News": ["Zee Media", "ZMCL", "zeenews"],
    "Business Standard": ["BS", "business-standard"],
    "Economic Times": ["ET", "Economic Times", "economictimes"],
    "Mint": ["Livemint", "livemint"],
    "The Tribune": ["Tribune India", "tribuneindia"],
    "Deccan Herald": ["DH", "deccanherald"],
    "The Telegraph": ["Telegraph India", "telegraphindia"],
    "The Quint": ["Quint Digital", "thequint"],
    "Scroll.in": ["Scroll", "scroll.in"],
    "ThePrint": ["The Print", "theprint"],
    "The Wire": ["Wire News", "thewire"],
    "FirstPost": ["First Post", "firstpost"],
    "Republic World": ["Republic TV", "Republic", "republicworld"]
}

def match_news_source(source_text):
    """Match news source text with known agency names"""
    source_text = source_text.strip().lower()
    
    for agency, variants in NEWS_AGENCY_MAPPING.items():
        if any(variant.lower() in source_text for variant in variants):
            return agency
    return None

def extract_news_sources(html_content):
    """Extract and validate news sources from HTML content"""
    soup = BeautifulSoup(html_content, 'html.parser')
    news_sources = []
    
    print("\n=== Processing News Sources ===")
    
    # Find all vr1PYe class elements
    source_elements = soup.find_all(class_='vr1PYe')
    print(f"Found {len(source_elements)} potential news sources")
    
    for element in source_elements:
        source_text = element.get_text(strip=True)
        matched_agency = match_news_source(source_text)
        
        if matched_agency:
            print(f"✓ Matched: {source_text} → {matched_agency}")
            news_sources.append({
                'source': matched_agency,
                'display_name': source_text,
                'timestamp': datetime.now().isoformat()
            })
        else:
            print(f"✗ Unmatched source: {source_text}")
    
    print(f"\nTotal matched sources: {len(news_sources)}")
    return news_sources
