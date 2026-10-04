import { Routes } from '@angular/router';
import { SiteShellComponent } from './layout/site-shell.component';
import { adminGuard } from './core/admin.guard';

const page = (load: () => Promise<any>) => ({ loadComponent: load });

export const routes: Routes = [
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login.component').then((m) => m.LoginComponent),
    title: 'Sign in · DevHub CMS',
  },
  {
    path: 'admin/reset-password',
    loadComponent: () => import('./features/admin/reset-password.component').then((m) => m.ResetPasswordComponent),
    title: 'Reset password · DevHub CMS',
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-shell.component').then((m) => m.AdminShellComponent),
    title: 'DevHub CMS',
    children: [
      { path: '', ...page(() => import('./features/admin/dashboard.component').then((m) => m.DashboardComponent)) },
      { path: 'posts', ...page(() => import('./features/admin/posts-list.component').then((m) => m.PostsListComponent)) },
      { path: 'posts/new', ...page(() => import('./features/admin/post-edit.component').then((m) => m.PostEditComponent)) },
      { path: 'posts/:id', ...page(() => import('./features/admin/post-edit.component').then((m) => m.PostEditComponent)) },
      { path: 'projects', ...page(() => import('./features/admin/projects-list.component').then((m) => m.ProjectsListComponent)) },
      { path: 'projects/new', ...page(() => import('./features/admin/project-edit.component').then((m) => m.ProjectEditComponent)) },
      { path: 'projects/:id', ...page(() => import('./features/admin/project-edit.component').then((m) => m.ProjectEditComponent)) },
      { path: 'gallery', ...page(() => import('./features/admin/gallery-admin.component').then((m) => m.GalleryAdminComponent)) },
      { path: 'team', ...page(() => import('./features/admin/team-admin.component').then((m) => m.TeamAdminComponent)) },
      { path: 'messages', ...page(() => import('./features/admin/messages.component').then((m) => m.MessagesComponent)) },
      { path: 'settings', ...page(() => import('./features/admin/settings.component').then((m) => m.SettingsComponent)) },
    ],
  },
  {
    path: '',
    component: SiteShellComponent,
    children: [
      { path: '', ...page(() => import('./features/public/home.component').then((m) => m.HomeComponent)) },
      { path: 'about', ...page(() => import('./features/public/about.component').then((m) => m.AboutComponent)) },
      { path: 'services', ...page(() => import('./features/public/services.component').then((m) => m.ServicesComponent)) },
      { path: 'team', ...page(() => import('./features/public/team.component').then((m) => m.TeamComponent)) },
      { path: 'projects', ...page(() => import('./features/public/projects.component').then((m) => m.ProjectsComponent)) },
      { path: 'projects/:slug', ...page(() => import('./features/public/project-detail.component').then((m) => m.ProjectDetailComponent)) },
      { path: 'insights', ...page(() => import('./features/public/insights.component').then((m) => m.InsightsComponent)) },
      { path: 'insights/:slug', ...page(() => import('./features/public/post-detail.component').then((m) => m.PostDetailComponent)) },
      { path: 'gallery', ...page(() => import('./features/public/gallery.component').then((m) => m.GalleryComponent)) },
      { path: 'contact', ...page(() => import('./features/public/contact.component').then((m) => m.ContactComponent)) },
      { path: '**', ...page(() => import('./features/public/not-found.component').then((m) => m.NotFoundComponent)) },
    ],
  },
];
