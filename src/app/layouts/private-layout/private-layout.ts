import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService, UserProfile } from '../../service/userlayout-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './private-layout.html',
  styleUrl: './private-layout.css',
})
export class PrivateLayout implements OnInit, OnDestroy {
  userAvatar: string = '/Images/default-avatar.png';
  userName: string = 'Nombre de Usuario';
  isPremium: boolean = false;
  private userSubscription?: Subscription;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadUserData() {
    this.userSubscription = this.userService.getCurrentUser().subscribe({
      next: (user: UserProfile) => {
        this.userName = user.name;
        this.userAvatar = user.avatar || '/Images/default-avatar.png';
        this.isPremium = user.plan === 'premium';
      },
      error: (error: any) => {
        console.error('Error al cargar usuario:', error);
        this.loadFromLocalStorage();
      }
    });
  }

  private loadFromLocalStorage() {
    const userPlan = localStorage.getItem('userPlan');
    const userName = localStorage.getItem('userName');
    const userAvatar = localStorage.getItem('userAvatar');

    this.isPremium = userPlan === 'premium';
    this.userName = userName || 'Nombre de Usuario';
    this.userAvatar = userAvatar || '/Images/default-avatar.png';
  }

  logout() {
    this.userService.clearUser();
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  updateUserAvatar(newAvatarUrl: string) {
    this.userService.updateAvatar(newAvatarUrl).subscribe({
      next: (user: UserProfile) => {
        this.userAvatar = user.avatar || '/Images/default-avatar.png';
      },
      error: (error: any) => {
        console.error('Error al actualizar avatar:', error);
      }
    });
  }
}
