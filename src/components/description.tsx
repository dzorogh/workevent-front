"use client"

import { useState } from "react"

export default function Description({ children }: { children: React.ReactNode }) {
    const [showMore, setShowMore] = useState(false)

    return <div className="flex flex-col gap-4">
        <div className="relative">
            <div className={`prose max-w-prose ${showMore ? 'max-h-none' : 'max-h-[400px] overflow-y-hidden'}`}>
                {children}
            </div>
            {!showMore && children && <div className="h-16 bg-linear-to-b from-transparent to-background absolute bottom-0 left-0 w-full"></div>}
            {!children && <div className="text-muted-foreground">Описание отсутствует</div>}
        </div>

        {!showMore && children && <div>
            <button onClick={(e) => {
                e.preventDefault()
                setShowMore(!showMore)
            }} className="text-sm text-primary cursor-pointer" >Показать полностью</button>
        </div>}
    </div>
}
