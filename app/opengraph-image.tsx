import { ImageResponse } from "next/og";

export const alt = "דו\"חירבון - כי כל חוויה ראויה לתיעוד.";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

function visualRtl(value: string) {
  return Array.from(value).reverse().join("");
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #fffdf8 0%, #f7f0e5 52%, #edf7f4 100%)",
          color: "#161616",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px",
          width: "100%"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            textAlign: "right",
            width: "670px"
          }}
        >
          <div
            style={{
              alignSelf: "flex-end",
              background: "#161616",
              borderRadius: "10px",
              color: "#fffdf8",
              display: "flex",
              fontSize: "32px",
              fontWeight: 700,
              padding: "16px 24px"
            }}
          >
            {visualRtl("כי כל חוויה ראויה לתיעוד.")}
          </div>
          <div
            style={{
              direction: "rtl",
              display: "flex",
              fontSize: "118px",
              fontWeight: 900,
              letterSpacing: 0,
              lineHeight: 1
            }}
          >
            {visualRtl('דו"חירבון')}
          </div>
          <div
            style={{
              color: "#40536b",
              direction: "rtl",
              display: "flex",
              fontSize: "42px",
              fontWeight: 700,
              lineHeight: 1.25
            }}
          >
            {visualRtl("מערכת הומוריסטית לתיעוד חירבונים, דירוגים ולוח מדווחים.")}
          </div>
        </div>
        <div
          style={{
            alignItems: "center",
            background: "#f3b33d",
            border: "8px solid #161616",
            borderRadius: "28px",
            boxShadow: "16px 16px 0 #161616",
            display: "flex",
            fontSize: "190px",
            height: "340px",
            justifyContent: "center",
            width: "340px"
          }}
        >
          💩
        </div>
      </div>
    ),
    size
  );
}
