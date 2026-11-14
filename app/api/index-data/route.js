import { NextResponse } from 'next/server';
import { getIndexData } from '../../../lib/bankData';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const index = searchParams.get('index') || 'bank';
  const range = searchParams.get('range') || '1D';
  const data = getIndexData(index, range);
  if (!data) {
    return NextResponse.json({ error: `Unknown index "${index}"` }, { status: 404 });
  }
  return NextResponse.json(data);
}
