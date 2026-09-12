export default function DiscoveryPreviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute('data-discovery-preview','');document.body&&document.body.setAttribute('data-discovery-preview','');`,
        }}
      />
      {children}
    </>
  );
}
