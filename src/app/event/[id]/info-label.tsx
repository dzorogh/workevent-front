import { discoveryFilterLabelClass } from '@/lib/discovery-ui';

export default function InfoLabel({ label }: { label: string }) {
    return <div className={discoveryFilterLabelClass}>{label}</div>;
}
