import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={1258}
    height={167}
    fill="none"
    {...props}
  >
    <text
      xmlSpace="preserve"
      fill="url(#footer-gradient)"
      fontFamily="Inter"
      fontSize={264}
      letterSpacing="-.01em"
      style={{
        whiteSpace: "pre",
      }}
    >
      <tspan x={-8.983} y={192}>
        {"workevent"}
      </tspan>
    </text>
    <defs>
      <linearGradient
        id="footer-gradient"
        x1={604.06}
        x2={604.06}
        y1={0}
        y2={167}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#fff" />
        <stop offset={1} stopColor="#23256D" stopOpacity={0.5} />
      </linearGradient>
    </defs>
  </svg>
)
export default SvgComponent