import * as React from "react"
import { SVGProps } from "react"

const Burger = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="cursor-pointer"
    {...props}
  >
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
)

export default Burger
