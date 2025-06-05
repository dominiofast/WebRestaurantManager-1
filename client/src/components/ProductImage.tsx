interface ProductImageProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showPromoBadge?: boolean;
}

export default function ProductImage({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  showPromoBadge = false 
}: ProductImageProps) {
  // Tamanhos responsivos padronizados - FORÇANDO QUADRADO
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
    lg: 'w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40'
  };

  return (
    <div 
      className={`${sizeClasses[size]} bg-gray-50 flex-shrink-0 relative overflow-hidden ${className}`}
      style={{ 
        aspectRatio: '1 / 1',
        minWidth: size === 'sm' ? '4rem' : size === 'md' ? '5rem' : '8rem',
        minHeight: size === 'sm' ? '4rem' : size === 'md' ? '5rem' : '8rem'
      }}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover"
          style={{ 
            aspectRatio: '1 / 1',
            width: '100%',
            height: '100%'
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* Badge de promoção */}
      {showPromoBadge && (
        <div className="absolute -top-1 -right-1 z-10">
          <div 
            className="text-white text-xs px-2 py-1 rounded-full font-bold"
            style={{
              backgroundColor: 'var(--primary-color, #ff0000)'
            }}
          >
            30%OFF
          </div>
        </div>
      )}
    </div>
  );
}