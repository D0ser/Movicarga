import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com",
      icon: "fab fa-facebook-f",
    },
    { name: "Twitter", href: "https://twitter.com", icon: "fab fa-twitter" },
    {
      name: "LinkedIn",
      href: "https://linkedin.com",
      icon: "fab fa-linkedin-in",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Movicarga</h3>
            <p className="text-gray-300">
              Soluciones profesionales de transporte y logística para tus
              necesidades empresariales.
            </p>

            <div className="mt-4 flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={link.name}
                >
                  <i className={`${link.icon} text-lg`}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/servicios"
                  className="text-gray-300 hover:text-white"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-gray-300 hover:text-white">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <address className="not-italic text-gray-300">
              <p className="flex items-center mb-2">
                <i className="fas fa-map-marker-alt mr-2 text-gray-400"></i>
                Dirección: Av. Principal 123
              </p>
              <p className="flex items-center mb-2">
                <i className="fas fa-phone mr-2 text-gray-400"></i>
                Teléfono: (123) 456-7890
              </p>
              <p className="flex items-center">
                <i className="fas fa-envelope mr-2 text-gray-400"></i>
                Email: info@movicarga.com
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} Movicarga. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
