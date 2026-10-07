import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./data/AppContext";
import { ToastProvider } from "./components/ToastStack";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Accueil from "./pages/Accueil";
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
import VerifierFacture from "./pages/facturation/VerifierFacture";
import HistoriqueFactures from "./pages/facturation/HistoriqueFactures";
import Clients from "./pages/Clients";
import UsersByRole from "./pages/utilisateurs/UsersByRole";
import UsersAll from "./pages/utilisateurs/UsersAll";
import PermissionsOverview from "./pages/utilisateurs/PermissionsOverview";
import RapportVentes from "./pages/rapports/RapportVentes";
import RapportStock from "./pages/rapports/RapportStock";
import RapportBenefices from "./pages/rapports/RapportBenefices";
import Parametres from "./pages/Parametres";
import APropos from "./pages/APropos";

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/accueil" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verifier-facture" element={<VerifierFacture />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route element={<RoleGuard />}>
              <Route path="/dashboard" element={<Dashboard />} />
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
              <Route path="utilisateurs" element={<UsersAll />} />
              <Route path="utilisateurs/tous" element={<UsersAll />} />
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
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}
