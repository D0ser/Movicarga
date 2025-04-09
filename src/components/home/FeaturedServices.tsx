import {
  TruckIcon,
  GlobeAltIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const services = [
  {
    id: 1,
    title: "Transporte Nacional",
    description:
      "Movimiento de carga en todo el territorio nacional, con seguimiento en tiempo real.",
    icon: TruckIcon,
  },
  {
    id: 2,
    title: "Logística Internacional",
    description:
      "Gestión de transporte y trámites para importación y exportación de mercancías.",
    icon: GlobeAltIcon,
  },
  {
    id: 3,
    title: "Administración de Inventario",
    description:
      "Control y gestión eficiente de inventarios en nuestros almacenes estratégicos.",
    icon: ClipboardDocumentIcon,
  },
];

const FeaturedServices = () => {
  return (
    <section className="py-16 bg-white" id="servicios-destacados">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">
            Nuestros Servicios Destacados
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ofrecemos soluciones logísticas completas para empresas de todos los
            tamaños, garantizando siempre la máxima calidad y eficiencia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <service.icon
                className="h-12 w-12 text-primary-600 mb-4"
                aria-hidden="true"
              />
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <Link
                to={`/servicios#${service.id}`}
                className="text-primary-600 font-medium hover:text-primary-700 flex items-center"
              >
                Más información
                <svg
                  className="ml-1 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
