import React, { useState } from 'react';

const Dropdown = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="dropdown" 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="dropbtn">
        {title} <i className="fas fa-chevron-down"></i>
      </button>
      {isOpen && (
        <div className="dropdown-content">
          {items.map((item, idx) => {
            if (item.subItems) {
              return (
                <div key={idx} className="sub-dropdown">
                  <a href="#">
                    {item.label} <i className="fas fa-angle-right"></i>
                  </a>
                  <div className="sub-content">
                    {item.subItems.map((sub, subIdx) => (
                      <a key={subIdx} href={sub.href}>{sub.label}</a>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <a key={idx} href={item.href}>{item.label}</a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;