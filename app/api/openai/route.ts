import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Use edge runtime for streaming responses
export const runtime = 'edge';

/**
 * Processes the AI response stream to extract only the text content
 * Filters out metadata prefixes like "f:", "0:", "e:", "d:", "3:" etc.
 */
const processStreamResponse = (stream: ReadableStream): ReadableStream => {
	const textDecoder = new TextDecoder();
	const textEncoder = new TextEncoder();

	const transformStream = new TransformStream({
		transform(chunk, controller) {
			const text = textDecoder.decode(chunk);
			// Split by lines to process each entry
			const lines = text.split('\n');

			for (const line of lines) {
				// Skip empty lines
				if (!line.trim()) continue;

				// Process based on line prefix
				if (line.startsWith('0:')) {
					// Content line - extract just the text (remove "0:" prefix)
					const content = line
						.substring(3, line.length - 1)
						.replaceAll('\\"', '"')
						.replaceAll('\\n', '\n')
						.replaceAll('\\r', '\r')
						.replaceAll('\\t', '\t');
					controller.enqueue(textEncoder.encode(content));
				} else if (line.startsWith('3:')) {
					// Error message
					console.error('Error in AI response:', line.substring(2));
				} else if (
					line.startsWith('f:') ||
					line.startsWith('e:') ||
					line.startsWith('d:')
				) {
					// Skip metadata lines (format, end, data)
					continue;
				} else {
					// Handle any unrecognized format
					console.warn('Unknown line format in AI response:', line);
				}
			}
		},
	});

	return stream.pipeThrough(transformStream);
};

export async function POST(req: NextRequest) {
	try {
		// Get the request data
		const { prompt, messages, system } = await req.json();

		// For backward compatibility - convert single prompt to messages format if provided
		const messageInput = messages || (prompt ? [{ role: 'user', content: prompt }] : null);

		if (!messageInput) {
			return NextResponse.json(
				{ error: 'Invalid input: requires prompt or messages' },
				{ status: 400 }
			);
		}

		// Use the AI SDK's streamText function with openai
		const result = streamText({
			model: openai('gpt-4o'),
			system: system || 'You are a helpful assistant.',
			messages: messageInput,
		});

		// Process the response to extract only text content
		const rawResponse = result.toDataStreamResponse();

		if (!rawResponse.body) {
			return new Response('No response from AI', { status: 500 });
		}

		const processedStream = processStreamResponse(rawResponse.body);

		// Return the cleaned response
		return new Response(processedStream);
	} catch (error) {
		console.error('Error in OpenAI API route:', error);
		return NextResponse.json(
			{ error: (error as Error).message || 'An unexpected error occurred' },
			{ status: 500 }
		);
	}
}
