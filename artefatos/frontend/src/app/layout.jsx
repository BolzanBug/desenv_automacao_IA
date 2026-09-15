import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Gestão de Afiliados - Pollen Parque Tecnológico',
  description: 'Plataforma Integrada de Gestão de Empresas Afiliadas, Contratos, Finanças e Espaços Físicos do Pollen Parque.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 min-h-screen text-slate-900 antialiased">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
        <ToastContainer position="top-right" autoClose={4000} theme="light" />
      </body>
    </html>
  );
}
