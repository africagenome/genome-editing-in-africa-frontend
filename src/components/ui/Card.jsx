import React from 'react';

const Card = ({ icon, title, description }) => {
  return (
    <div className="card">
      <i className={icon}></i>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default Card;