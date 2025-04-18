import React from 'react';

const ServicesPage = () => {
  return (
    <div className="services-page">
      <h1>Nuestros Servicios</h1>
      <div className="services-container">
        <div className="service-card">
          <h2>Transporte de carga</h2>
          <p>
            Ofrecemos servicios de transporte de carga a nivel nacional con la mayor seguridad y
            puntualidad.
          </p>
        </div>
        {/* Agrega más servicios según sea necesario */}
      </div>
    </div>
  );
};

export default ServicesPage;
