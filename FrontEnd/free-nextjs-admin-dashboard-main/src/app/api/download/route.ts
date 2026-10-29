import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");
  const fileName = searchParams.get("filename") || "audio.mp3";

  if (!fileUrl) {
    return new NextResponse("Missing file URL", { status: 400 });
  }

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return new NextResponse("Failed to fetch file", { status: response.status });
    }

    const headers = new Headers();
    // Force browser to download directly instead of streaming in player
    const encodedFileName = encodeURIComponent(fileName);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`
    );
    headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");

    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}
