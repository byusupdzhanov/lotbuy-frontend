import React, { forwardRef, memo, useMemo, useState } from 'react';

const defaultFallback = '/assets/images/no_image.png';

const AppImage = forwardRef(function AppImage(
  { src, alt = 'Image', className = '', fallback = defaultFallback, onError, ...props },
  ref
) {
  const [failed, setFailed] = useState(false);

  const resolvedSrc = useMemo(() => {
    if (!failed && src) {
      return src;
    }
    return fallback || defaultFallback;
  }, [failed, fallback, src]);

  const handleError = (event) => {
    if (onError) {
      onError(event);
    }
    if (!failed && src && src !== fallback) {
      setFailed(true);
    }
  };

  return (
    <img
      ref={ref}
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
});

AppImage.displayName = 'AppImage';

export default memo(AppImage);
