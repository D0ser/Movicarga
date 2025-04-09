import React from 'react';

// Definición del componente con tipado explícito
const ContactPage: React.FC = () => {
  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contacto</h1>
        <p>Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info">
          <h2>Información de Contacto</h2>
          <div className="info-item">
            <i className="fas fa-map-marker-alt"></i>
            <p>Av. Principal 123, Lima, Perú</p>
          </div>
          <div className="info-item">
            <i className="fas fa-phone"></i>
            <p>+51 123 456 789</p>
          </div>
          <div className="info-item">
            <i className="fas fa-envelope"></i>
            <p>info@movicarga.com</p>
          </div>
          <div className="info-item">
            <i className="fas fa-clock"></i>
            <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
          </div>
        </div>

        <div className="contact-form">
          <h2>Envíanos un Mensaje</h2>
          <form>
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input type="text" id="name" placeholder="Tu nombre" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="Tu email" required />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Asunto</label>
              <input type="text" id="subject" placeholder="Asunto del mensaje" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" placeholder="Tu mensaje" rows={5} required></textarea>
            </div>
            <button type="submit" className="submit-btn">
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
