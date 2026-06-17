import { NextResponse } from 'next/server';

const VALID_CODES = [
  'USER-1256',
  'USER-1257',
  'USER-1258',
];

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const rawCode =
      body.key ||
      body.code ||
      body.password ||
      '';

    const userCode =
      String(rawCode)
        .trim()
        .toUpperCase();

    const valid =
      VALID_CODES.includes(userCode);

    return NextResponse.json({
      valid,
    });

  } catch {

    return NextResponse.json({
      valid: false,
    });

  }

}