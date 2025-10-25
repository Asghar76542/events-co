import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const submissionsPath = path.join(process.cwd(), 'data', 'submissions', 'submissions.json');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the required fields
    const { name, email, eventType, message } = body;
    if (!name || !email || !eventType || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Read existing submissions
    let submissions = [];
    if (fs.existsSync(submissionsPath)) {
      const data = fs.readFileSync(submissionsPath, 'utf8');
      submissions = JSON.parse(data);
    }

    // Add new submission with timestamp
    const newSubmission = {
      ...body,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    submissions.push(newSubmission);

    // Write back to file
    fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2));

    return NextResponse.json({ message: 'Form submitted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}