import { ImageResponse } from "next/og";

// apple-icon.tsx uses the Next 16 file convention to serve a PNG
// touch icon for iOS home-screen installs (which don't pick up the
// SVG icon.svg we serve to everyone else). 180×180 is the standard
// apple-touch-icon size.
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // brand-500 — matches the SVG mark + favicon.
          background: "#ef5a28",
          color: "#ffffff",
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: -4,
          // iOS rounds the corners itself, so no border-radius needed.
        }}
      >
        KK
      </div>
    ),
    { ...size },
  );
}
