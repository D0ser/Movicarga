import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
// Importar desde el archivo índice
import { HomePage, ServicesPage, AboutUsPage, ContactPage, NotFoundPage } from './pages';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="servicios" element={<ServicesPage />} />
        <Route path="nosotros" element={<AboutUsPage />} />
        <Route path="contacto" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
