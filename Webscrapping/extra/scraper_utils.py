import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, unquote
import os
import json
from datetime import datetime

def decode_google_url(encoded_url):
    """Decode Google's encoded news URLs."""
    try:
        # Remove the ./articles/ prefix if present
        if encoded_url.startswith('./articles/'):
            encoded_url = encoded_url[11:]
        
        # Convert the base64-like encoding
        decoded_url = encoded_url.replace('?', '/')
        decoded_url = unquote(decoded_url)
        
        # If it's a Google redirect URL, get the actual URL
        if 'news.google.com' in decoded_url:
            response = requests.get(f"https://news.google.com/{decoded_url}", 
                                 allow_redirects=True)
            return response.url
        return decoded_url
    except Exception as e:
        print(f"Error decoding URL: {e}")
        return None

def decode_google_url(href):
    """
    Decode Google's encoded news URLs to get the actual website URL.
    """
    try:
        if href.startswith('./'):
            # Convert relative URL to absolute
            href = f"https://news.google.com{href[1:]}"
        elif not href.startswith('http'):
            href = f"https://news.google.com/{href}"

        # Follow redirects to get final URL
        response = requests.get(href, allow_redirects=True)
        return response.url
    except Exception as e:
        print(f"Error decoding URL: {e}")
        return None

def get_visible_content(url, headers):
    """Extract visible content as seen by users, including headings and article text."""
    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove hidden elements and scripts
        for element in soup.find_all(['script', 'style', 'meta', '[style*="display:none"]']):
            element.decompose()

        content_structure = {
            'title': '',
            'headings': [],
            'main_content': [],
            'metadata': {
                'author': '',
                'date': '',
                'tags': []
            }
        }

        # Extract title
        title_tag = soup.find('title')
        if title_tag:
            content_structure['title'] = title_tag.get_text(strip=True)

        # Extract headings hierarchically
        for i in range(1, 7):
            headings = soup.find_all(f'h{i}')
            for heading in headings:
                content_structure['headings'].append({
                    'level': i,
                    'text': heading.get_text(strip=True)
                })

        # Extract article content
        article_selectors = [
            'article',
            '.article-body',
            '.story-content',
            '.article-content',
            'main',
            '[role="main"]'
        ]

        main_content = None
        for selector in article_selectors:
            main_content = soup.select_one(selector)
            if main_content:
                break

        if main_content:
            paragraphs = main_content.find_all('p')
            content_structure['main_content'] = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)]

        # Extract metadata
        author_selectors = [
            '[rel="author"]',
            '.author',
            '.byline',
            '[itemprop="author"]'
        ]
        for selector in author_selectors:
            author = soup.select_one(selector)
            if author:
                content_structure['metadata']['author'] = author.get_text(strip=True)
                break

        # Extract date
        date_selectors = [
            '[itemprop="datePublished"]',
            '.date',
            '.published',
            'time'
        ]
        for selector in date_selectors:
            date = soup.select_one(selector)
            if date:
                content_structure['metadata']['date'] = date.get_text(strip=True)
                break

        # Extract tags
        tag_selectors = [
            '.tags',
            '.keywords',
            '[rel="tag"]'
        ]
        for selector in tag_selectors:
            tags = soup.select(selector)
            if tags:
                content_structure['metadata']['tags'] = [tag.get_text(strip=True) for tag in tags]
                break

        return content_structure

    except Exception as e:
        print(f"Error extracting visible content: {e}")
        return None

def extract_structured_content(url, headers):
    """
    Extract structured content from a webpage with class names and text.
    """
    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        structured_content = {
            'url': url,
            'timestamp': datetime.now().isoformat(),
            'elements': []
        }

        # Process all elements with class names
        for element in soup.find_all(class_=True):
            if element.string and element.string.strip():
                structured_content['elements'].append({
                    'tag': element.name,
                    'class': ' '.join(element.get('class')),
                    'text': element.string.strip()
                })

        return structured_content

    except Exception as e:
        print(f"Error extracting structured content: {e}")
        return None

def save_page_content(url, headers):
    """Enhanced version of save_page_content that includes visible content structure."""
    try:
        # Get both structured content and visible content
        visible_content = get_visible_content(url, headers)
        
        # Create directory for saved content
        output_dir = os.path.join('e:', 'Programs', 'Flipr', 'Webscrapping', 'scraped_content')
        os.makedirs(output_dir, exist_ok=True)
        
        # Create filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_filename = ''.join(c if c.isalnum() else '_' for c in url.split('/')[-1])
        filename = f"{safe_filename}_{timestamp}.txt"
        filepath = os.path.join(output_dir, filename)
        
        # Save enhanced content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"URL: {url}\n")
            f.write(f"Timestamp: {timestamp}\n")
            f.write("=" * 80 + "\n\n")

            if visible_content:
                # Write title
                f.write("TITLE:\n")
                f.write("-" * 40 + "\n")
                f.write(f"{visible_content['title']}\n\n")

                # Write metadata
                f.write("METADATA:\n")
                f.write("-" * 40 + "\n")
                f.write(f"Author: {visible_content['metadata']['author']}\n")
                f.write(f"Date: {visible_content['metadata']['date']}\n")
                f.write(f"Tags: {', '.join(visible_content['metadata']['tags'])}\n\n")

                # Write headings
                f.write("HEADINGS:\n")
                f.write("-" * 40 + "\n")
                for heading in visible_content['headings']:
                    f.write(f"{'#' * heading['level']} {heading['text']}\n")
                f.write("\n")

                # Write main content
                f.write("MAIN CONTENT:\n")
                f.write("-" * 40 + "\n")
                for paragraph in visible_content['main_content']:
                    f.write(f"{paragraph}\n\n")

        return filepath
    except Exception as e:
        print(f"Error saving enhanced page content: {e}")
        return None

def save_structured_content(content, base_dir='scraped_content'):
    """
    Save structured content to a text file with proper formatting.
    """
    try:
        # Create output directory
        output_dir = os.path.join('e:', 'Programs', 'Flipr', 'Webscrapping', base_dir)
        os.makedirs(output_dir, exist_ok=True)

        # Create filename based on timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_url = ''.join(c if c.isalnum() else '_' for c in content['url'].split('/')[-1])
        filename = f"{safe_url}_{timestamp}.txt"
        filepath = os.path.join(output_dir, filename)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"URL: {content['url']}\n")
            f.write(f"Timestamp: {content['timestamp']}\n")
            f.write("="*80 + "\n\n")
            
            f.write("STRUCTURED CONTENT:\n")
            f.write("-"*80 + "\n")
            
            for element in content['elements']:
                f.write(f"\n[{element['tag']} - class: {element['class']}]\n")
                f.write(f"{element['text']}\n")
                f.write("-"*40 + "\n")

        return filepath

    except Exception as e:
        print(f"Error saving structured content: {e}")
        return None

