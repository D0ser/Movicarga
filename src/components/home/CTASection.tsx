import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="bg-primary-700 text-white py-16" id="contactanos">
      <div className="container-custom text-center">
        <h2 className="text-3xl font-bold mb-4">
          ¿Listo para optimizar tu logística?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Contáctanos hoy mismo para discutir cómo podemos ayudarte a mejorar
          tus operaciones de transporte y logística.
        </p>
        <Link
          to="/contacto"
          className="btn bg-white text-primary-700 hover:bg-gray-100 font-semibold px-8 py-3 inline-block"
        >
          Solicitar una consulta gratuita
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
