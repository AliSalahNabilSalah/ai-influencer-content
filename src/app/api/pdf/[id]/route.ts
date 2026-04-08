import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import puppeteer from 'puppeteer';

export const maxDuration = 60;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await prisma.influencerSession.findUnique({ where: { id } });
  if (!session || !session.result) {
    return NextResponse.json({ error: 'Session not found or not complete' }, { status: 404 });
  }

  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https';
  const printUrl = `${protocol}://${host}/print/${id}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });

    // Wait for fonts to load
    await page.goto(printUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    // ASCII-safe filename (Arabic chars cause ByteString error in Content-Disposition)
    const safeFilename = `nojom_brief_${id.slice(0, 8)}.pdf`;
    const encodedFilename = encodeURIComponent(`${session.name}_brief.pdf`);

    return new Response(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json(
      { error: 'فشل إنشاء PDF', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
