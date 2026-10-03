import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../data/content.service';
import { DEFAULT_SETTINGS } from '../data/site-content';
import { LogoMarkComponent } from '../shared/logo-mark.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LogoMarkComponent],
  template: `
    <footer>
      <app-logo-mark class="mark" [spin]="true" />
      <div class="container">
        <div class="cta">
          <p class="eyebrow">Let's work together</p>
          <h2>Have a research question?<br /><span>Let's take it to the field.</span></h2>
          <a routerLink="/contact" class="btn btn--light">Start a conversation <span class="arrow">→</span></a>
        </div>

        <div class="cols">
          <div class="about">
            <img src="/assets/brand/logo.svg" alt="DevHub Research Limited" width="157" height="48" />
            <p>End-to-end field research management, data collection and analysis, from Lagos to wherever the question leads.</p>
          </div>
          <div>
            <h3>Explore</h3>
            <a routerLink="/about">About</a>
            <a routerLink="/services">Services</a>
            <a routerLink="/projects">Projects</a>
            <a routerLink="/team">Team</a>
            <a routerLink="/insights">Insights</a>
            <a routerLink="/gallery">Gallery</a>
          </div>
          <div>
            <h3>Contact</h3>
            <address>{{ contact().address }}</address>
            <a [href]="'mailto:' + contact().email">{{ contact().email }}</a>
            <a [href]="telHref()">{{ contact().phone }}</a>
          </div>
        </div>

        <div class="legal">
          <span>© {{ year }} DevHub Research Limited. All rights reserved.</span>
          <span>Registered under Nigerian data protection regulation · PENCOM registered</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    footer { position: relative; overflow: hidden; background: var(--purple); color: rgb(255 255 255 / .78); padding: clamp(4rem, 9vw, 7rem) 0 2rem; }
    .mark { position: absolute; width: min(70vw, 760px); aspect-ratio: 1; right: -18%; top: -12%; color: #fff; opacity: .05; }
    .container { position: relative; }
    .cta { padding-bottom: clamp(3rem, 7vw, 5rem); border-bottom: 1px solid rgb(255 255 255 / .12); }
    .cta .eyebrow { color: var(--sky); }
    .cta h2 { color: #fff; max-width: 18ch; font-size: clamp(2.2rem, 5.5vw, 4.4rem); }
    .cta h2 span { color: var(--sky); }
    .cols { display: grid; grid-template-columns: 2fr 1fr 1.4fr; gap: 2.5rem; padding-block: 3.5rem; }
    .about img { height: 44px; width: auto; filter: brightness(0) invert(1); margin-bottom: 1.2rem; }
    .about p { max-width: 36ch; }
    h3 { color: #fff; font-size: .8rem; letter-spacing: .16em; text-transform: uppercase; margin-bottom: 1.1rem; }
    .cols a, address { display: block; color: inherit; text-decoration: none; font-style: normal; margin-bottom: .6rem; transition: color .2s; }
    .cols a:hover { color: #fff; }
    .legal { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid rgb(255 255 255 / .12); font-size: .82rem; color: rgb(255 255 255 / .55); }
    @media (max-width: 760px) { .cols { grid-template-columns: 1fr; gap: 2rem; } }
  `],
})
export class FooterComponent implements OnInit {
  private content = inject(ContentService);
  readonly contact = signal(DEFAULT_SETTINGS.contact);
  readonly telHref = computed(() => 'tel:' + this.contact().phone.replace(/[^\d+]/g, ''));
  readonly year = new Date().getFullYear();

  async ngOnInit(): Promise<void> {
    this.contact.set((await this.content.settings()).contact);
  }
}
