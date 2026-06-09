import React from 'react';

const Button = ({ variant = 'primary', children, onClick, href, ...props }) => {
  const getVariantClass = () => {
    switch(variant) {
      case 'primary':
        return 'btn-primary';
      case 'outline':
        return 'btn-outline';
      case 'outline-light':
        return 'btn-outline';
      case 'light':
        return 'btn-light';
      default:
        return 'btn-primary';
    }
  };

  const className = getVariantClass();
  const style = variant === 'outline-light' ? { background: 'rgba(255,255,255,0.15)', borderColor: 'white', color: 'white' } : {};

  if (href) {
    return (
      <a href={href} className={className} style={style} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className} style={style} {...props}>
      {children}
    </button>
  );
};

export default Button;