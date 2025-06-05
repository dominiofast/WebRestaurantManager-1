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
  // Tamanhos responsivos padronizados - AUMENTADO EM 15%
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36',
    lg: 'w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48'
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
            className="text-white text-xs px-2 py-1 rounded-lg font-bold shadow-lg border border-white/20"
            style={{
              backgroundColor: 'var(--store-primary-color, #FF6B35)',
              background: `linear-gradient(135deg, var(--store-primary-color, #FF6B35), var(--store-primary-color, #FF6B35)dd)`
            }}
          >
            -30%
          </div>
        </div>
      )}
    </div>
  );
}