from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from langchain_groq import ChatGroq
import re
import os
import json
from dotenv import load_dotenv
from news_source_matcher import extract_news_sources
import logging
from geopy.geocoders import Nominatim
from bs4 import BeautifulSoup
import time
from functools import partial
from googlenewsdecoder import gnewsdecoder

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize the ChatGroq LLM
llm = ChatGroq(
    temperature=0.3,
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name='llama-3.3-70b-versatile'
)

# Complete list of Indian States and Union Territories with their capitals
STATE_CAPITALS = {
    # States
    "Andhra Pradesh": "Amaravati",
    "Arunachal Pradesh": "Itanagar",
    "Assam": "Dispur",
    "Bihar": "Patna",
    "Chhattisgarh": "Raipur",
    "Goa": "Panaji",
    "Gujarat": "Gandhinagar",
    "Haryana": "Chandigarh",
    "Himachal Pradesh": "Shimla",
    "Jharkhand": "Ranchi",
    "Karnataka": "Bengaluru",
    "Kerala": "Thiruvananthapuram",
    "Madhya Pradesh": "Bhopal",
    "Maharashtra": "Mumbai",
    "Manipur": "Imphal",
    "Meghalaya": "Shillong",
    "Mizoram": "Aizawl",
    "Nagaland": "Kohima",
    "Odisha": "Bhubaneswar",
    "Punjab": "Chandigarh",
    "Rajasthan": "Jaipur",
    "Sikkim": "Gangtok",
    "Tamil Nadu": "Chennai",
    "Telangana": "Hyderabad",
    "Tripura": "Agartala",
    "Uttar Pradesh": "Lucknow",
    "Uttarakhand": "Dehradun",
    "West Bengal": "Kolkata",
    
    # Union Territories
    "Andaman and Nicobar Islands": "Port Blair",
    "Chandigarh": "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu": "Daman",
    "Delhi": "New Delhi",
    "Jammu and Kashmir": "Srinagar",
    "Ladakh": "Leh",
    "Lakshadweep": "Kavaratti",
    "Puducherry": "Puducherry"
}

def get_state_from_coordinates(lat, lng):
    print(f"\n📍 Processing coordinates: {lat}, {lng}")
    geolocator = Nominatim(user_agent="news_app")
    try:
        location = geolocator.reverse((float(lat), float(lng)))
        address = location.raw['address']
        state = address.get('state', '')
        
        # Print detailed location info
        print(f"📌 Found location details:")
        print(f"  State: {state}")
        print(f"  Full address: {location.address}")
        
        return state
    except Exception as e:
        print(f"❌ Error getting state: {str(e)}")
        return None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def format_summary(text):
    try:
        print("Received text for summarization:", text[:200] + "...")
        
        structure_prompt = """
        Analyze and summarize this article in exactly this format, including all section headers (with square brackets enclosed headings):
        [Overview]
        {2-3 sentences overview}

        [Key Points]
        1. {key point 1}
        2. {key point 2}
        3. {key point 3}

        [Conclusion]
        {1-2 sentences conclusion}

        [Text to Image Generation]
        {2-3 sentences prompt for generating the images based on the article}
        """
        
        # Use ChatGroq to generate summary
        response = llm.invoke(f"Summarize this article:\n{text}\n\nFormat:\n{structure_prompt}")
        raw_summary = response.content
        print("Raw summary received:", raw_summary) # Debug log
        
        # Default values in case sections are missing
        overview = "No overview available."
        key_points = ["No key points available."]
        conclusion = "No conclusion available."
        text_to_image = "No text to image generation information available."
        
        # Process key points with better formatting
        sections = raw_summary.split("[")
        for section in sections:
            if "Overview]" in section:
                overview = section.split("]")[1].strip()
            elif "Key Points]" in section:
                points_text = section.split("]")[1].strip()
                # Extract points and clean them
                key_points = []
                for line in points_text.split('\n'):
                    line = line.strip()
                    # Remove numbers and dots from beginning
                    cleaned_point = re.sub(r'^\d+\.\s*', '', line)
                    if cleaned_point and len(cleaned_point) > 5:  # Minimum length check
                        key_points.append(cleaned_point)
                
                if not key_points:
                    key_points = ["No key points available."]
            elif "Conclusion]" in section:
                conclusion = section.split("]")[1].strip()
            elif "Text to Image Generation]" in section:
                text_to_image = section.split("]")[1].strip()

        formatted_summary = {
            "sections": [
                {
                    "type": "overview",
                    "title": "Overview",
                    "content": overview
                },
                {
                    "type": "points",
                    "title": "Key Points",
                    "content": key_points  # This will be an array of strings
                },
                {
                    "type": "conclusion",
                    "title": "Conclusion",
                    "content": conclusion
                },
                {
                    "type": "text_to_image",
                    "title": "Text to Image Generation",
                    "content": text_to_image
                }
            ]
        }
        
        print("Formatted summary structure:", json.dumps(formatted_summary, indent=2))
        return formatted_summary

    except Exception as e:
        print(f"Error in format_summary: {str(e)}")
        return {
            "sections": [
                {
                    "type": "overview",
                    "title": "Error",
                    "content": "Unable to generate summary. Please try again later."
                }
            ]
        }

@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        formatted_summary = format_summary(text)
        print("Formatted summary:", formatted_summary) # Debug log
        
        seo_meta_tags = {
            "title": "Article Summary",
            "description": formatted_summary['sections'][0]['content'],
            "keywords": "summary, article, key points, overview, conclusion",
            "author": "Your Company Name"
        }
        
        structured_data = {
            "@context": "http://schema.org",
            "@type": "Article",
            "headline": "Article Summary",
            "description": formatted_summary['sections'][0]['content'],
            "articleBody": text,
            "author": {
                "@type": "Organization",
                "name": "Your Company Name"
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "http://example.com/article"
            }
        }
        
        return jsonify({
            "success": True,
            "summary": formatted_summary,
            "seo_meta_tags": seo_meta_tags,
            "structured_data": structured_data,
            "styles": {
                "overview": "bg-blue-50 p-6 rounded-lg mb-6",
                "points": "space-y-4 bg-gray-50 p-6 rounded-lg mb-6",
                "conclusion": "bg-blue-50 p-6 rounded-lg",
                "title": "text-xl font-bold text-blue-800 mb-4",
                "point": "flex items-start space-x-3",
                "number": "font-bold text-blue-600 min-w-[25px]",
                "content": "text-gray-700 leading-relaxed"
            }
        })
    except Exception as e:
        print(f"Summarization error: {str(e)}")
        return jsonify({"error": f"Failed to generate summary: {str(e)}"}), 500

@app.route('/search', methods=['GET'])
def search_news():
    try:
        category = request.args.get('category', '')
        subcategory = request.args.get('subcategory', '')
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        
        print(f"\n=== New Search Request ===")
        print(f"🔍 Subcategory: {subcategory}")
        print(f"📍 Coordinates: {lat}, {lng}")
        
        state = get_state_from_coordinates(lat, lng) if lat and lng else None
        state_capital = STATE_CAPITALS.get(state, '')
        
        print(f"\n🗺️ Location Summary:")
        print(f"  State: {state or 'Not detected'}")
        print(f"  Capital: {state_capital or 'Not found'}")
        
        logger.info(f"Received parameters - subcategory: {subcategory}, lat: {lat}, lng: {lng}")
        
        # Get state from coordinates
        state = None
        if lat and lng:
            state = get_state_from_coordinates(lat, lng)
            logger.info(f"Detected state: {state}")
        
        # Get state capital
        state_capital = STATE_CAPITALS.get(state, '')
        logger.info(f"State capital: {state_capital}")
        
        # Construct search query
        search_terms = []
        
        if subcategory and subcategory.lower() == 'all':
            search_terms.append(category)

        if subcategory and subcategory.lower() != 'all':
            search_terms.append(subcategory)
            
        if state:
            search_terms.append(state)
            
        if state_capital:
            search_terms.append(state_capital)
            
        # Ensure we have at least one search term
        if not search_terms:
            search_terms.append("news")  # default term
            
        query = '%20'.join(search_terms)
        url = f"https://news.google.com/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
        
        logger.info(f"Search terms: {search_terms}")
        logger.info(f"Final query URL: {url}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }

        response = requests.get(url, headers=headers)

        # Extract news sources with their URLs
        news_sources = extract_news_sources(response.text)
        
        # Process each source
        articles = []
        for source in news_sources:
            try:
                article_data = {
                    'headline': source['headline'],
                    'source': source['source'],
                    'url': source['url'],
                    'image': source['image'],
                    'timestamp': source['timestamp']
                }
                
                articles.append(article_data)
                
            except Exception as e:
                logger.error(f"Error processing article from {source['source']}: {str(e)}")
                continue

        return jsonify(articles)

    except Exception as e:
        logger.error(f"Error in search_news: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/article', methods=['GET'])
def get_article():
    try:
        encoded_url = request.args.get('url')
        url = gnewsdecoder(encoded_url)["decoded_url"]
        print(f"Fetching article from: {url}")

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            return jsonify({'error': f'Failed to fetch article: {str(e)}'}), 500

        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract main content
        content = []
        for p in soup.find_all(['p', 'span', 'article', 'data', 'data-articlebody', '[class*="content"]', '[class*="article"]']):
            text = p.get_text().strip()
            if len(text) > 10:  # Filter out short paragraphs
                content.append(text)
        
        if not content:
            return jsonify({'error': 'Could not extract article content'}), 500
            
        article_text = ' '.join(content)
        print(f"Extracted text length: {len(article_text)} characters")

        def generate():
            try:
                # Get summary from ML server
                summarizer_url = 'http://localhost:5000/summarize'
                summary_response = requests.post(
                    summarizer_url,
                    json={'text': article_text},
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                print(summary_response)
                if not summary_response.ok:
                    error_msg = summary_response.json().get('error', 'Unknown error')
                    yield f"data: {json.dumps({'error': f'ML Server error: {error_msg}'})}\n\n"
                    return

                summary_data = summary_response.json()
                print("\n=== Summary Data to be Sent ===")
                print("Summary structure:", json.dumps(summary_data['summary'], indent=2))
                print("Styles:", json.dumps(summary_data['styles'], indent=2))
                
                response_data = {
                    'summary': summary_data['summary'],
                    'styles': summary_data['styles'],
                    'isLast': True
                }
                
                print("\nFinal response:", json.dumps(response_data, indent=2))
                yield f"data: {json.dumps(response_data)}\n\n"
                
            except Exception as e:
                print(f"Error in generate: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return app.response_class(
            generate(),
            mimetype='text/event-stream'
        )

    except Exception as e:
        print(f"Error in get_article: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Combined App running on port 5000")
    app.run(port=5000, debug=True)