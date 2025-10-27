import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const submissionsPath = path.join(process.cwd(), 'data', 'submissions', 'submissions.json');

// Function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Function to sanitize input
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the required fields
    const { name, email, eventType, message } = body;
    if (!name || !email || !eventType || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedEventType = sanitizeInput(eventType);
    const sanitizedMessage = sanitizeInput(message);
    const sanitizedPhone = body.phone ? sanitizeInput(body.phone) : undefined;
    const sanitizedEventDate = body.eventDate ? sanitizeInput(body.eventDate) : undefined;

    // Ensure directory exists
    const dir = path.dirname(submissionsPath);
    await fs.mkdir(dir, { recursive: true });

    // Read existing submissions
    let submissions = [];
    try {
      const data = await fs.readFile(submissionsPath, 'utf8');
      submissions = JSON.parse(data);
    } catch (err) {
      // If file doesn't exist or is corrupted, start with empty array
      submissions = [];
    }

    // Add new submission with timestamp
    const newSubmission = {
      name: sanitizedName,
      email: sanitizedEmail,
      eventType: sanitizedEventType,
      message: sanitizedMessage,
      ...(sanitizedPhone && { phone: sanitizedPhone }),
      ...(sanitizedEventDate && { eventDate: sanitizedEventDate }),
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };
    submissions.push(newSubmission);

    // Write back to file
    await fs.writeFile(submissionsPath, JSON.stringify(submissions, null, 2));

    return NextResponse.json({ message: 'Form submitted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}