import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./data/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AjouterProduit from "./pages/produits/AjouterProduit";
import ModifierProduit from "./pages/produits/ModifierProduit";
import Categories from "./pages/produits/Categories";
import Prix from "./pages/produits/Prix";
import Entrees from "./pages/stock/Entrees";
import Sorties from "./pages/stock/Sorties";
import StockDisponible from "./pages/stock/StockDisponible";
import HistoriqueStock from "./pages/stock/HistoriqueStock";
import VenteMode from "./pages/ventes/VenteMode";
import Panier from "./pages/ventes/Panier";
import Paiement from "./pages/ventes/Paiement";
import GenererFacture from "./pages/facturation/GenererFacture";
import ImprimerFacture from "./pages/facturation/ImprimerFacture";
import HistoriqueFactures from "./pages/facturation/HistoriqueFactures";
import Clients from "./pages/Clients";
import UsersByRole from "./pages/utilisateurs/UsersByRole";
import PermissionsOverview from "./pages/utilisateurs/PermissionsOverview";
import RapportVentes from "./pages/rapports/RapportVentes";
import RapportStock from "./pages/rapports/RapportStock";
import RapportBenefices from "./pages/rapports/RapportBenefices";
import Parametres from "./pages/Parametres";
import APropos from "./pages/APropos";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route element={<RoleGuard />}>
              <Route index element={<Dashboard />} />
              <Route path="produits/ajouter" element={<AjouterProduit />} />
              <Route path="produits/modifier" element={<ModifierProduit />} />
              <Route path="produits/categories" element={<Categories />} />
              <Route path="produits/prix" element={<Prix />} />
              <Route path="stock/entrees" element={<Entrees />} />
              <Route path="stock/sorties" element={<Sorties />} />
              <Route path="stock/disponible" element={<StockDisponible />} />
              <Route path="stock/historique" element={<HistoriqueStock />} />
              <Route path="ventes/detail" element={<VenteMode mode="détail" />} />
              <Route path="ventes/gros" element={<VenteMode mode="gros" />} />
              <Route path="ventes/panier" element={<Panier />} />
              <Route path="ventes/paiement" element={<Paiement />} />
              <Route path="facturation/generer" element={<GenererFacture />} />
              <Route path="facturation/imprimer" element={<ImprimerFacture />} />
              <Route path="facturation/historique" element={<HistoriqueFactures />} />
              <Route path="clients" element={<Clients />} />
              <Route path="utilisateurs/admin" element={<UsersByRole role="admin" />} />
              <Route path="utilisateurs/manager" element={<UsersByRole role="manager" />} />
              <Route path="utilisateurs/vendeur" element={<UsersByRole role="vendeur" />} />
              <Route path="utilisateurs/administrateur" element={<Navigate to="/utilisateurs/admin" replace />} />
              <Route path="utilisateurs/caissier" element={<Navigate to="/utilisateurs/manager" replace />} />
              <Route path="utilisateurs/permissions" element={<PermissionsOverview />} />
              <Route path="rapports/ventes" element={<RapportVentes />} />
              <Route path="rapports/stock" element={<RapportStock />} />
              <Route path="rapports/benefices" element={<RapportBenefices />} />
              <Route path="parametres" element={<Parametres />} />
              <Route path="a-propos" element={<APropos />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
