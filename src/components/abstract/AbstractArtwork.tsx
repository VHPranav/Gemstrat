import Image from 'next/image';
import artworks from '@/data/abstract/artworks.json';

export type AbstractArtworkName = (typeof artworks)[number]['slug'];

/** Original profile artwork. Keep its aspect ratio to preserve the geometry. */
export default function AbstractArtwork({
  name,
  className = '',
  priority = false,
}: {
  name: AbstractArtworkName;
  className?: string;
  priority?: boolean;
}) {
  const artwork = artworks.find((item) => item.slug === name);
  if (!artwork) return null;

  return (
    <Image
      src={artwork.src}
      alt={artwork.name}
      width={artwork.width}
      height={artwork.height}
      priority={priority}
      className={className}
    />
  );
}
