import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { PainelExecutivo } from './pages/PainelExecutivo';
import { PerfilColaboradores } from './pages/PerfilColaboradores';
import { PerfilLideranca } from './pages/PerfilLideranca';
import { AnalisePilares } from './pages/AnalisePilares';
import { AVozDoColaborador } from './pages/AVozDoColaborador';
import { ConclusoesIA } from './pages/ConclusoesIA';
import { SeriesHistoricas } from './pages/SeriesHistoricas';
import { Configuracoes } from './pages/Configuracoes';
import { ProgramaMesh } from './pages/ProgramaMesh';
import { PrincipaisNecessidades } from './pages/PrincipaisNecessidades';
import { RelatorioCompleto } from './pages/RelatorioCompleto';
import { PersonaMesh } from './pages/PersonaMesh';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/relatorio" element={<RelatorioCompleto />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<PainelExecutivo />} />
          <Route path="perfil" element={<PerfilColaboradores />} />
          <Route path="lideranca" element={<PerfilLideranca />} />
          <Route path="pilares" element={<AnalisePilares />} />
          <Route path="necessidades" element={<PrincipaisNecessidades />} />
          <Route path="voz" element={<AVozDoColaborador />} />
          <Route path="conclusoes" element={<ConclusoesIA />} />
          <Route path="historico" element={<SeriesHistoricas />} />
          <Route path="persona" element={<PersonaMesh />} />
          <Route path="programa" element={<ProgramaMesh />} />
          <Route path="config" element={<Configuracoes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
