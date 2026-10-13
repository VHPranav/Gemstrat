// ---------------------------------------------------------------------------
// Cloudflare Worker: byte-range requests for the videos.
// The site is static files (out/, served by Workers static assets), which
// always answer with the whole file. Safari (Mac and iPhone) won't play a
// <video> unless the server honours `Range: bytes=…` with 206 Partial
// Content, so wrangler.jsonc runs this Worker first for /videos/* only: it
// fetches the file from the assets and streams back just the bytes asked
// for. Everything else is served by the assets directly.
// ---------------------------------------------------------------------------

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const VIDEO_CACHE = 'public, max-age=86400';

// File sizes by ETag, remembered per isolate: the assets binding streams
// files without a Content-Length, so the first request measures the file
const sizes = new Map<string, number>();

/** Parses a single `bytes=` range against the file size; null if unsatisfiable */
function parseRange(header: string, size: number): { start: number; end: number } | null {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start: number;
  let end: number;
  if (m[1] === '') {
    // Suffix: the last N bytes
    const n = Number(m[2]);
    if (n === 0) return null;
    start = Math.max(size - n, 0);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  return start <= end && start < size ? { start, end } : null;
}

/** Streams bytes start..end (inclusive) of a body, without buffering it */
function sliceStream(body: ReadableStream<Uint8Array>, start: number, end: number) {
  const reader = body.getReader();
  let pos = 0;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      // Read until a chunk overlaps the range (skipping the ones before it)
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        const chunkStart = pos;
        pos += value.length;
        if (pos <= start) continue;
        const from = Math.max(start - chunkStart, 0);
        const to = Math.min(end + 1 - chunkStart, value.length);
        controller.enqueue(value.subarray(from, to));
        if (pos > end) {
          controller.close();
          await reader.cancel();
        }
        return;
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    // The whole file, without the range
    const file = await env.ASSETS.fetch(new Request(request.url, { method: 'GET' }));
    if (!file.ok || !file.body) return file;
    const etag = file.headers.get('ETag') ?? '';
    let size = Number(file.headers.get('Content-Length')) || sizes.get(etag) || 0;
    let body: ReadableStream<Uint8Array> = file.body;
    if (!size) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      size = bytes.byteLength;
      if (etag) sizes.set(etag, size);
      body = new Response(bytes).body!;
    }

    const headers = new Headers(file.headers);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', VIDEO_CACHE);

    const rangeHeader = request.headers.get('Range');
    if (!rangeHeader) {
      headers.set('Content-Length', String(size));
      return new Response(request.method === 'HEAD' ? null : body, { status: 200, headers });
    }

    const range = parseRange(rangeHeader, size);
    if (!range) {
      await body.cancel();
      headers.set('Content-Range', `bytes */${size}`);
      headers.delete('Content-Length');
      return new Response(null, { status: 416, headers });
    }

    headers.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
    headers.set('Content-Length', String(range.end - range.start + 1));
    if (request.method === 'HEAD') {
      await body.cancel();
      return new Response(null, { status: 206, headers });
    }
    return new Response(sliceStream(body, range.start, range.end), { status: 206, headers });
  },
};

export default worker;
