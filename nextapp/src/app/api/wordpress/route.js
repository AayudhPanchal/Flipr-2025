import { NextResponse } from 'next/server';

const WP_API_URL = process.env.WORDPRESS_API_URL;
const WP_USERNAME = process.env.WORDPRESS_USERNAME;
const WP_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

export async function POST(request) {
  try {
    const { title, content, summary, imageUrl } = await request.json();

    // Format the content with proper HTML styling
    const formattedContent = `
      <div class="news-summary">
        ${imageUrl ? `<img src="${imageUrl}" class="featured-image" alt="${title}"/>` : ''}
        <div class="summary-content">
          ${content}
        </div>
        <hr class="divider" />
        <div class="original-summary">
          <h2>AI Generated Summary</h2>
          ${summary}
        </div>
      </div>
    `;

    const wpPost = {
      title: title,
      content: formattedContent,
      status: 'publish',
      format: 'standard',
    };

    const response = await fetch(`${WP_API_URL}/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64'),
      },
      body: JSON.stringify(wpPost),
    });

    if (!response.ok) {
      throw new Error('Failed to post to WordPress');
    }

    const data = await response.json();
    return NextResponse.json({ success: true, postUrl: data.link });

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
