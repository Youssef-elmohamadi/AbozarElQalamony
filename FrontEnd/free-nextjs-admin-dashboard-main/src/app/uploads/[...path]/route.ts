import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import https from "https";

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".mp3":
      return "audio/mpeg";
    case ".m4a":
      return "audio/mp4";
    case ".wav":
      return "audio/wav";
    case ".mp4":
      return "video/mp4";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  if (!pathSegments || pathSegments.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Prevent path traversal
  const safeSegments = pathSegments.map((s) => path.basename(s));
  const relativeSubpath = path.join(...safeSegments);

  // 1. Check local public/uploads directory
  const publicUploadPath = path.resolve(process.cwd(), "public", "uploads", relativeSubpath);

  // 2. Check backend API wwwRoot/uploads directory
  const backendUploadPath = path.resolve(
    process.cwd(),
    "../../abuzarelqalamony.Api/wwwRoot/uploads",
    relativeSubpath
  );

  let targetFilePath: string | null = null;
  if (fs.existsSync(publicUploadPath)) {
    targetFilePath = publicUploadPath;
  } else if (fs.existsSync(backendUploadPath)) {
    targetFilePath = backendUploadPath;
  }

  // If found on disk, stream with Range support
  if (targetFilePath) {
    try {
      const stat = fs.statSync(targetFilePath);
      const fileSize = stat.size;
      const mimeType = getMimeType(targetFilePath);
      const rangeHeader = request.headers.get("range");

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (isNaN(start) || start >= fileSize || (parts[1] && isNaN(end))) {
          return new NextResponse(null, {
            status: 416,
            headers: {
              "Content-Range": `bytes */${fileSize}`,
            },
          });
        }

        const chunksize = end - start + 1;
        const nodeStream = fs.createReadStream(targetFilePath, { start, end });
        // @ts-ignore
        const webStream = new ReadableStream({
          start(controller) {
            nodeStream.on("data", (chunk) => controller.enqueue(chunk));
            nodeStream.on("end", () => controller.close());
            nodeStream.on("error", (err) => controller.error(err));
          },
          cancel() {
            nodeStream.destroy();
          },
        });

        return new NextResponse(webStream as any, {
          status: 206,
          headers: {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunksize),
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=3600",
          },
        });
      }

      // No range requested -> full file
      const nodeStream = fs.createReadStream(targetFilePath);
      // @ts-ignore
      const webStream = new ReadableStream({
        start(controller) {
          nodeStream.on("data", (chunk) => controller.enqueue(chunk));
          nodeStream.on("end", () => controller.close());
          nodeStream.on("error", (err) => controller.error(err));
        },
        cancel() {
          nodeStream.destroy();
        },
      });

      return new NextResponse(webStream as any, {
        status: 200,
        headers: {
          "Content-Length": String(fileSize),
          "Accept-Ranges": "bytes",
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (err) {
      console.error("Error reading file from disk:", err);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }

  // 3. Fallback: Proxy from backend API with SSL validation bypass for local development
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";
  const remoteUrl = `${baseUrl}/uploads/${safeSegments.join("/")}`;

  try {
    const isHttps = remoteUrl.startsWith("https://");
    const agent = isHttps
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

    const proxyRes = await fetch(remoteUrl, {
      // @ts-ignore
      agent,
      headers: {
        ...(request.headers.get("range") ? { range: request.headers.get("range")! } : {}),
      },
      cache: "no-store",
    });

    if (!proxyRes.ok) {
      return new NextResponse(proxyRes.statusText, { status: proxyRes.status });
    }

    const responseHeaders = new Headers();
    const contentType = proxyRes.headers.get("content-type");
    const contentLength = proxyRes.headers.get("content-length");
    const contentRange = proxyRes.headers.get("content-range");
    const acceptRanges = proxyRes.headers.get("accept-ranges");

    if (contentType) responseHeaders.set("Content-Type", contentType);
    if (contentLength) responseHeaders.set("Content-Length", contentLength);
    if (contentRange) responseHeaders.set("Content-Range", contentRange);
    if (acceptRanges) responseHeaders.set("Accept-Ranges", acceptRanges);

    return new NextResponse(proxyRes.body as any, {
      status: proxyRes.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error(`Proxy fallback error for ${remoteUrl}:`, err);
    return new NextResponse("Media file not found or backend unreachable", { status: 404 });
  }
}
