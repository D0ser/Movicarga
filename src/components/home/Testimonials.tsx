import { FC } from "react";

interface Testimonial {
  id: number;
  content: string;
  author: string;
  position: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    content:
      "Movicarga ha transformado nuestra cadena de suministro. Su profesionalismo y atención al detalle nos ha permitido reducir costos y mejorar la satisfacción de nuestros clientes.",
    author: "María Gómez",
    position: "Directora de Operaciones, TechCorp",
  },
  {
    id: 2,
    content:
      "Hemos trabajado con Movicarga durante más de 5 años y siempre han superado nuestras expectativas. Su servicio al cliente es excepcional.",
    author: "Roberto Méndez",
    position: "Gerente Logístico, Industrial SA",
  },
  {
    id: 3,
    content:
      "Su capacidad para manejar entregas urgentes ha sido crucial para nuestro negocio. Recomiendo ampliamente sus servicios de logística.",
    author: "Ana Martínez",
    position: "CEO, Distribuidora del Este",
  },
];

const Testimonials: FC = () => {
  return (
    <section className="py-16 bg-gray-50" id="testimonios">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            La satisfacción de nuestros clientes es nuestra mayor recompensa y
            motivación para seguir mejorando.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <svg
                className="h-8 w-8 text-primary-400 mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote>
                <p className="text-gray-600 mb-4">{testimonial.content}</p>
                <footer>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-gray-500 text-sm">
                    {testimonial.position}
                  </p>
                </footer>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
