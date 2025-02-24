from flask import Flask, request, jsonify
from langchain_groq import ChatGroq
import re
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Initialize the ChatGroq LLM
llm = ChatGroq(
    temperature=0.3,
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name='llama-3.3-70b-versatile'
)

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

if __name__ == '__main__':
    app.run(port="5000", debug=True)
