import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../data/content.service';
import type { GalleryItem, Post, Project, SiteSettings } from '../../core/models';
import { ABOUT, DEFAULT_SETTINGS, EXPERTISE, FOCUS_AREAS, PARTNERS, PROCESS } from '../../data/site-content';
import { SeoService } from '../../core/seo.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { CountUpDirective } from '../../shared/count-up.directive';
import { LogoMarkComponent } from '../../shared/logo-mark.component';
import { IconComponent } from '../../shared/icon.component';
import { FacetsComponent } from '../../shared/facets.component';

const BAND_COLORS = ['#300066', '#2b3990', '#1e73be', '#4f8db3', '#0a9fd8', '#3f0f7f'];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe, RevealDirective, CountUpDirective, LogoMarkComponent, IconComponent, FacetsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private content = inject(ContentService);

  readonly about = ABOUT;
  readonly focusAreas = FOCUS_AREAS;
  readonly expertise = EXPERTISE;
  readonly process = PROCESS;
  readonly partners = PARTNERS;
  readonly bandColors = BAND_COLORS;

  readonly settings = signal<SiteSettings>(DEFAULT_SETTINGS);
  readonly projects = signal<Project[]>([]);
  readonly ongoing = signal<Project | null>(null);
  readonly posts = signal<Post[]>([]);
  readonly gallery = signal<GalleryItem[]>([]);
  readonly activeExpertise = signal(0);

  constructor() {
    inject(SeoService).set('');
  }

  async ngOnInit(): Promise<void> {
    const [settings, projects, posts, gallery] = await Promise.all([
      this.content.settings(),
      this.content.projects(),
      this.content.publishedPosts(3),
      this.content.gallery(),
    ]);
    this.settings.set(settings);
    const featured = projects.filter((p) => p.featured);
    this.projects.set((featured.length ? featured : projects).slice(0, 5));
    this.ongoing.set(projects.find((p) => p.status === 'ongoing') ?? null);
    this.posts.set(posts);
    this.gallery.set(gallery);
  }
}
