'use client';

import { useEffect, useState } from 'react';
import { discoveryPrimaryButtonClass } from '@/lib/discovery-ui';

export default function ApplyBar() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const form = document.getElementById('apply');
        if (!form) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShow(!entry.isIntersecting);
            },
            { threshold: 0.15 },
        );

        observer.observe(form);
        return () => observer.disconnect();
    }, []);

    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E4E8F1] bg-white/95 p-3 backdrop-blur min-[768px]:hidden">
            <a href="#apply" className={`${discoveryPrimaryButtonClass} w-full`}>
                Оставить заявку
            </a>
        </div>
    );
}
