import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={60}
    height={40}
    fill="none"
    className={props.className + " md:h-[40px] h-[28px]"}
    {...props}
  >
    <path
      fill="url(#a)"
      d="M45.193.043c.794-.066 1.614-.03 2.41-.032l7.419-.003c.706 0 1.443-.042 2.142.065.477.073.95.304 1.34.58.748.529 1.293 1.327 1.44 2.232.16.98-.02 1.989-.612 2.8-.46.63-1.105 1.108-1.865 1.314-.862.234-1.922.119-2.813.119l-6.703.01c-.763.001-2.185-.087-2.889.026-.494.08-.951.318-1.242.731-.241.342-.324.763-.25 1.171.106.584.564 1.107 1.128 1.305.816.285 1.918.134 2.781.13l6.285-.007c1.069 0 2.313-.096 3.354.065a3.24 3.24 0 0 1 1.376.561 3.524 3.524 0 0 1 .639.572 3.843 3.843 0 0 1 .212.27 3.437 3.437 0 0 1 .51 1.08 3.361 3.361 0 0 1 .072.334c.161.956-.02 1.971-.596 2.765a3.376 3.376 0 0 1-.812.798 3.448 3.448 0 0 1-1.031.49c-.947.263-2.11.136-3.089.13l-6.12.007c-.997-.001-2.509-.098-3.434.059a1.62 1.62 0 0 0-1.05.698c-.284.411-.331.809-.186 1.285.04.128.11.25.134.382l.007.05c.354.265.575.615 1.025.75.805.244 1.869.108 2.712.106l6.419-.007c1.066 0 2.287-.095 3.33.065a3.055 3.055 0 0 1 1.483.696 3.712 3.712 0 0 1 .485.494 3.604 3.604 0 0 1 .527.893 3.402 3.402 0 0 1 .196.662c.176.955-.002 1.988-.566 2.788a3.817 3.817 0 0 1-.334.401 3.478 3.478 0 0 1-.825.635 3.602 3.602 0 0 1-1.148.4c-.768.13-1.609.068-2.387.067l-3.894-.004-5.05.003c-.999 0-2.083.085-3.067-.09-1.05-.185-2.115-.684-2.978-1.3-1.718-1.229-2.82-3.119-3.148-5.185a9.26 9.26 0 0 1-.035-2.692c.124-.878.37-1.738.58-2.598.346-1.433.703-2.862 1.072-4.29l1.09-4.16c.305-1.205.566-2.438.983-3.612a6.18 6.18 0 0 1 .828-1.552 6.157 6.157 0 0 1 .831-.908 6.385 6.385 0 0 1 1.264-.88 6.31 6.31 0 0 1 2.05-.67Z"
    />
    <path
      fill="url(#b)"
      d="M18.574 11.55C17.44 8.41 15.52 5.48 15.647 3.631a3.659 3.659 0 0 1 .468-1.548c.495-.879 1.378-1.543 2.354-1.808a3.877 3.877 0 0 1 2.927.375c.63.36 1.227.93 1.558 1.575.368.719.555 1.536.771 2.31l3.713 13.262c.819-3.081 1.614-6.168 2.386-9.262.464-1.88.858-3.909 1.427-5.75A3.758 3.758 0 0 1 33.14.512C34 .063 35.055-.055 35.987.243c1.049.336 1.83 1.075 2.322 2.036.114.27.213.576.269.864.074.384.013.745-.062 1.123-.289 1.448-.718 2.895-1.08 4.329a617.503 617.503 0 0 1-2.037 8.016c-.658 2.62-1.543 5.284-2.385 7.858a6.095 6.095 0 0 1-.765 1.577c-.555.804-1.372 1.527-2.365 1.701-1.14.2-3.1.328-4.182-.07a2.833 2.833 0 0 1-1.208-.893c-.426-.538-.708-1.219-1.022-1.825-5.532-15.118-3.765-10.272-4.898-13.41Z"
    />
    <path
      fill="url(#c)"
      d="M2.49 11.55C.704 6.602-.102 4.987.01 3.64c.113-1.346.027-.27.051-.403a3.675 3.675 0 0 1 .417-1.145C.973 1.215 1.856.55 2.832.285A3.87 3.87 0 0 1 5.07.353a3.86 3.86 0 0 1 .69.308c.63.36 1.226.929 1.557 1.575.369.718.555 1.535.771 2.309l3.713 13.263a618.28 618.28 0 0 0 2.386-9.262c.465-1.88.858-3.91 1.427-5.75A3.758 3.758 0 0 1 17.502.522c.862-.45 1.917-.568 2.848-.27 1.05.337 1.83 1.075 2.322 2.037.115.27.213.576.27.864.073.384.012.744-.063 1.122-.288 1.449-.718 2.896-1.08 4.33a617.861 617.861 0 0 1-2.037 8.015c-.658 2.62-1.543 5.284-2.384 7.858a6.094 6.094 0 0 1-.766 1.577c-.555.804-1.372 1.528-2.365 1.702-1.14.2-3.1.328-4.182-.07a2.833 2.833 0 0 1-1.207-.894c-.427-.538-.71-1.218-1.023-1.824-6.138-15.052-3.559-8.473-5.345-13.42Z"
    />
    <path
      className="hidden md:block"
      fill="url(#d)"
      d="M3.991 39 1.76 32.976h1.032l1.86 5.304H4.34l1.92-5.304h.84l1.884 5.304h-.3l1.872-5.304h.984L9.295 39H8.36l-1.944-5.388h.48L4.94 39h-.948Zm11.092.108c-.576 0-1.08-.124-1.512-.372a2.576 2.576 0 0 1-.984-1.08c-.232-.472-.348-1.028-.348-1.668 0-.648.116-1.204.348-1.668.232-.464.56-.82.984-1.068.432-.256.936-.384 1.512-.384.584 0 1.088.128 1.512.384.432.248.764.604.996 1.068.24.464.36 1.02.36 1.668 0 .64-.12 1.196-.36 1.668a2.552 2.552 0 0 1-.996 1.08c-.424.248-.928.372-1.512.372Zm0-.792c.576 0 1.032-.196 1.368-.588.336-.4.504-.98.504-1.74 0-.768-.172-1.348-.516-1.74-.336-.4-.788-.6-1.356-.6-.568 0-1.02.2-1.356.6-.336.392-.504.972-.504 1.74 0 .76.168 1.34.504 1.74.336.392.788.588 1.356.588Zm4.24.684v-4.572c0-.24-.009-.484-.025-.732a10.193 10.193 0 0 0-.048-.72h.936l.12 1.464-.168.012c.08-.36.22-.656.42-.888.2-.232.436-.404.708-.516.272-.12.556-.18.852-.18.12 0 .224.004.312.012a.91.91 0 0 1 .264.06l-.012.864a1.41 1.41 0 0 0-.336-.072 2.067 2.067 0 0 0-.336-.024c-.352 0-.66.084-.924.252a1.693 1.693 0 0 0-.588.648 1.9 1.9 0 0 0-.192.84V39h-.984Zm4.263 0v-8.832h.972v5.484h.024l2.796-2.676h1.224l-3.3 3.144.024-.492L28.914 39h-1.26l-3.072-2.832h-.024V39h-.972Zm8.579.108c-.944 0-1.688-.272-2.232-.816-.544-.552-.816-1.316-.816-2.292 0-.632.12-1.18.36-1.644.24-.472.576-.836 1.008-1.092.432-.264.928-.396 1.488-.396.552 0 1.016.116 1.392.348.376.232.664.564.864.996.2.424.3.928.3 1.512v.36h-4.668v-.612h4.032l-.204.156c0-.64-.144-1.14-.432-1.5-.288-.36-.716-.54-1.284-.54-.6 0-1.068.212-1.404.636-.336.416-.504.98-.504 1.692v.108c0 .752.184 1.324.552 1.716.376.384.9.576 1.572.576.36 0 .696-.052 1.008-.156.32-.112.624-.292.912-.54l.336.684c-.264.256-.6.456-1.008.6-.4.136-.824.204-1.272.204ZM37.602 39l-2.58-6.024h1.056l2.16 5.304h-.324l2.184-5.304h1.008L38.526 39h-.924Zm7.073.108c-.944 0-1.688-.272-2.232-.816-.544-.552-.816-1.316-.816-2.292 0-.632.12-1.18.36-1.644.24-.472.576-.836 1.008-1.092.432-.264.928-.396 1.488-.396.552 0 1.016.116 1.392.348.376.232.664.564.864.996.2.424.3.928.3 1.512v.36h-4.668v-.612h4.032l-.204.156c0-.64-.144-1.14-.432-1.5-.288-.36-.716-.54-1.284-.54-.6 0-1.068.212-1.404.636-.336.416-.504.98-.504 1.692v.108c0 .752.184 1.324.552 1.716.376.384.9.576 1.572.576.36 0 .696-.052 1.008-.156.32-.112.624-.292.912-.54l.336.684c-.264.256-.6.456-1.008.6-.4.136-.824.204-1.272.204ZM48.406 39v-4.632c0-.224-.012-.452-.036-.684-.016-.24-.036-.476-.06-.708h.936l.12 1.32h-.144c.176-.464.456-.816.84-1.056a2.482 2.482 0 0 1 1.356-.372c.712 0 1.248.192 1.608.576.368.376.552.972.552 1.788V39h-.972v-3.708c0-.568-.116-.98-.348-1.236-.224-.264-.576-.396-1.056-.396-.56 0-1.004.172-1.332.516-.328.344-.492.804-.492 1.38V39h-.972Zm9.048.108c-.592 0-1.044-.168-1.356-.504-.312-.344-.468-.86-.468-1.548v-3.324h-1.176v-.756h1.176v-1.644l.972-.276v1.92h1.728v.756h-1.728v3.216c0 .48.08.824.24 1.032.168.2.416.3.744.3.152 0 .288-.012.408-.036a2.56 2.56 0 0 0 .324-.108v.816a1.671 1.671 0 0 1-.408.108 2.208 2.208 0 0 1-.456.048Z"
    />
    <defs>
      <linearGradient
        id="a"
        x1={0}
        x2={62.514}
        y1={0.816}
        y2={8.61}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#494BE2" />
        <stop offset={1} stopColor="#2426B0" />
      </linearGradient>
      <linearGradient
        id="b"
        x1={0}
        x2={62.514}
        y1={0.816}
        y2={8.61}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#494BE2" />
        <stop offset={1} stopColor="#2426B0" />
      </linearGradient>
      <linearGradient
        id="c"
        x1={0}
        x2={62.514}
        y1={0.816}
        y2={8.61}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#494BE2" />
        <stop offset={1} stopColor="#2426B0" />
      </linearGradient>
      <linearGradient
        id="d"
        x1={0}
        x2={53.33}
        y1={31.233}
        y2={54.505}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#494BE2" />
        <stop offset={1} stopColor="#2426B0" />
      </linearGradient>
    </defs>
  </svg>
)
export default SvgComponent
