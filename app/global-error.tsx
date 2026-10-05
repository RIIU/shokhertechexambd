"use client";

import { useEffect } from "react";

/**
 * Catches errors in the RootLayout or anything at root level in Next.js App Router.
 * Replaces the entire <html> and <body> to prevent the default Next.js unstyled error page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="bn" >
      <head>
        <title>সার্ভারে সমস্যা হয়েছে · Shokher Tech Academy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#F6F7F9",
          color: "#101828",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            margin: "24px",
            padding: "36px 28px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: "24px",
            textAlign: "center",
            boxShadow: "0 12px 24px -12px rgba(16,24,40,0.18)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "#ECFDF3",
              color: "#08804A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            !
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#101828",
              marginBottom: "8px",
              lineHeight: 1.3,
            }}
          >
            দুঃখিত, পাতাটি লোড হতে সমস্যা হয়েছে
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: "#475467",
              marginBottom: "20px",
              lineHeight: 1.6,
            }}
          >
            সার্ভারে সাময়িক সমস্যা দেখা দিয়েছে। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করো অথবা হোমে ফিরে যাও।
          </p>

          {error?.digest && (
            <div
              style={{
                marginBottom: "24px",
                padding: "8px 12px",
                backgroundColor: "#F2F4F7",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "monospace",
                color: "#667085",
              }}
            >
              Error Digest: {error.digest}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "12px 24px",
                backgroundColor: "#08804A",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "14px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              আবার চেষ্টা করো
            </button>

            <a
              href="/"
              style={{
                padding: "12px 24px",
                backgroundColor: "transparent",
                color: "#101828",
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "12px",
                border: "1px solid #E4E7EC",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              হোম পেজে যাও
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
