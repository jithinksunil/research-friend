import {
  fetchAllSections,
  fetchDummyReportBuffer,
} from '@/lib/server-only/dashboard';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const companyName = searchParams.get('companyName');
  const isDummy = searchParams.get('isDummy') === 'true';

  if (!symbol || !companyName) {
    return Response.json(
      { message: 'Missing symbol or companyName parameter' },
      { status: 400 },
    );
  }
  try {
    const reportBuffer = isDummy
      ? await fetchDummyReportBuffer()
      : await fetchAllSections(
          companyName,
          symbol,
        );

    return new Response(reportBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${companyName}_report.pdf"`,
      },
    });
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
