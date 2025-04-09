import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Servicios profesionales de transporte y carga
          </h1>
          <p className="text-xl mb-8">
            Soluciones logísticas integrales adaptadas a tus necesidades
            empresariales. Transportamos tu carga con seguridad y eficiencia.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/servicios" className="btn-primary">
              Nuestros servicios
            </Link>
            <Link
              to="/contacto"
              className="btn bg-white text-blue-800 hover:bg-gray-100"
            >
              Solicitar presupuesto
            </Link>
          </div>
        </div>
      </div>
      <div
        className="absolute bottom-0 right-0 w-1/3 h-full opacity-20 md:opacity-30"
        aria-hidden="true"
        style={{
          backgroundImage: "url('/images/truck-silhouette.svg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right",
          backgroundSize: "contain",
        }}
      ></div>
    </section>
  );
};

export default HeroSection;
