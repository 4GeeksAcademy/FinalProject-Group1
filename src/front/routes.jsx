import { createBrowserRouter, createRoutesFromElements, Route, } from "react-router-dom";
import Layout from "./pages/Layout"; 
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Register from "./pages/Register";
import { Myprofile } from "./pages/Myprofile";
import { Login } from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CreateRecipe from "./pages/CreateRecipe";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import PublishedRecipes from "./pages/PublishedRecipes";
import PendingRecipes from "./pages/PendignRecipes";
import RejectedRecipes from "./pages/RejectedRecipes";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCategories from "./pages/AdminCategories";
import ProtectedRoute from "./components/ProtectedRoute";
import { CategoryView } from "./pages/CategoryView";
import { CategoriesListView } from './pages/CategoriesListView';
import { RecipeDetail } from "./pages/RecipeDetail";
import MyFavorites from "./pages/MyFavorites";
import AdminUsuarios from "./pages/AdminUsuarios";
import { SearchResults } from './pages/SearchResults';
import UserDashboard from "./pages/UserDashboard";
import { FavoritesView } from './pages/FavoritesView';
// --- IMPORTACIÓN NUEVA ---
import { AdminReportedComments } from "./pages/AdminReportedComments";
// -------------------------

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/register" element={< Register />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login" element={<Login />} />
      <Route path="/myprofile" element={<ProtectedRoute><Myprofile /></ProtectedRoute>} />
      <Route path="/recipes/create" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
      <Route path="/recipes/edit/:recipe_id" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
      
      <Route path="/admin/categories" element={
        <AdminProtectedRoute>
          <AdminCategories />
        </AdminProtectedRoute>
      } />
      
      {/* --- RUTA NUEVA: REPORTES --- */}
      <Route path="/admin/reportes" element={
        <AdminProtectedRoute>
          <AdminReportedComments />
        </AdminProtectedRoute>
      } />
      {/* --------------------------- */}

      <Route path="/status" element={
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      } />
      <Route path="/status/published/recipes/edit/:recipe_id" element={
        <AdminProtectedRoute>
          <CreateRecipe />
        </AdminProtectedRoute>
      } />
      <Route path="/status/pending/recipes/edit/:recipe_id" element={
        <AdminProtectedRoute>
          <CreateRecipe />
        </AdminProtectedRoute>
      } />
      <Route path="/status/rejected/recipes/edit/:recipe_id" element={
        <AdminProtectedRoute>
          <CreateRecipe />
        </AdminProtectedRoute>
      } />
      <Route path="/status/published" element={
        <AdminProtectedRoute>
          <PublishedRecipes />
        </AdminProtectedRoute>
      } />
      <Route path="/status/pending" element={
        <AdminProtectedRoute>
          <PendingRecipes />
        </AdminProtectedRoute>
      } />
      <Route path="/status/rejected" element={
        <AdminProtectedRoute>
          <RejectedRecipes />
        </AdminProtectedRoute>
      } />
       <Route path="/category/:categoryId" element={<CategoryView />} />
       <Route path="/categories" element={<CategoriesListView />} />
       <Route path="/search" element={<SearchResults />} />
      <Route path="/recipe/:recipeId" element={<RecipeDetail />} />
      
      <Route path="/administrar/users" element={
        <AdminProtectedRoute>
          <AdminUsuarios />
        </AdminProtectedRoute>
      } />
      <Route path="/favoritos" element={
        <ProtectedRoute>
           <MyFavorites />
        </ProtectedRoute>
      } />

      <Route path="/user/status" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/favorites" element={<FavoritesView />} />
      
    </Route>
  )
);