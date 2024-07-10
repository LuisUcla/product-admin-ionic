import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../models/user.model';
import { UtilsService } from 'src/app/services/utils.service';
import { firebaseError } from 'src/app/shared/firebaseError';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  })

  firebaseService = inject(FirebaseService)
  utlisService = inject(UtilsService);

  ngOnInit() {
  }

 async submit() {
    const user = this.form.value as User
    const loading = await this.utlisService.presentLoading();
    loading.present();

    this.firebaseService.signIn(user)
      .then(() => {
        loading.dismiss();

        // acccion
        this.utlisService.routerLink('main/home')

      })
      .catch(err => {
        loading.dismiss()
        console.log()
        this.utlisService.presentToast({ // mensaje de error
          message: err.message, //firebaseError[err.code],
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })
      })
  }

}
