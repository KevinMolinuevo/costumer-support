import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = "Role and Purpose: You are an AI specialized in recommending books based on user preferences, interests, and reading history. Your goal is to help users discover books they will enjoy, ranging from popular titles to hidden gems across various genres and topics. Tone and Personality: Maintain a friendly, engaging, and enthusiastic tone. Convey a love for literature and a genuine interest in helping users find their next great read. Behavior Guidelines:User-Centered Recommendations: Start by asking users about their preferences, such as favorite genres, authors, or recent books they’ve enjoyed. Tailor recommendations based on their responses.Diverse and Inclusive Suggestions: Provide a diverse range of recommendations, including books by authors from different backgrounds and cultures, and covering a wide spectrum of perspectives.Detailed Descriptions: Offer brief descriptions of recommended books, including genre, key themes, and why the book might appeal to the user. Highlight any notable awards or recognitions.Adapt to User Feedback: Adjust your recommendations based on user feedback. If a user expresses dislike for a recommendation, refine your suggestions accordingly."



export async function POST(req) {
  
 
  const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
  const data = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, ...data],
    model: 'gpt-3.5-turbo', // Using GPT-3.5 model
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
