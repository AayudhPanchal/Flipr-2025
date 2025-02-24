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
    
    # Find all article elements containing both source and URL
    articles = soup.find_all('article')
    print(f"Found {len(articles)} potential news articles")
    
    for article in articles:
        source_element = article.find(class_='vr1PYe')
        url_element = article.find(class_='WwrzSb')
        head_element = article.find(class_='JtKRv')
        img_element = article.find(class_='Quavad vwBmvb')
        timestamp_element = article.find(class_='hvbAAd')
        print(f"\nSource: {source_element}, URL: {url_element}, Headline: {head_element}, Image: {img_element}, Timestamp: {timestamp_element}")
        
        if source_element and url_element:
            source_text = source_element.get_text(strip=True)
            url = url_element.get('href', '')
            head_text = head_element.get_text(strip=True)
            timestamp_text = timestamp_element.get_text(strip=True)
            if img_element:
                img_url = img_element.get('src', '')
            else:
                img_url = ''
            
            matched_agency = match_news_source(source_text)
            
            if matched_agency:
                print(f"✓ Matched: {source_text} → {matched_agency}")
                news_sources.append({
                    'source': matched_agency,
                    'headline': head_text,
                    'url': "https://news.google.com/" + url,
                    'image': "https://news.google.com" + img_url,
                    'timestamp': timestamp_text
                })
            else:
                print(f"✗ Unmatched source: {source_text}")
    print(news_sources)
    print(f"\nTotal matched sources: {len(news_sources)}")
    return news_sources
