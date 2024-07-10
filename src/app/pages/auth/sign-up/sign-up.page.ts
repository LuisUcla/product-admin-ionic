import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { User } from '../../../models/user.model';
import { UtilsService } from 'src/app/services/utils.service';
import { firebaseError } from 'src/app/shared/firebaseError';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  validPattern = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,20}$"; // minimo 6 y maximo 14
  
  form = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [ Validators.pattern(this.validPattern), Validators.minLength(8)]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)])
  })

  firebaseService = inject(FirebaseService)
  utlisService = inject(UtilsService);
  
  ngOnInit() {
  }

  async submit() {
   console.log('submit')
    const loading = await this.utlisService.presentLoading();
    loading.present();

    this.firebaseService.signUp(this.form.value as User)
      .then(async(res) => {
        await loading.dismiss();

        // acccion
        await this.firebaseService.updateUser(this.form.value.name);

        let uid = res.user.uid;
        this.form.get('uid').setValue(uid);

        await this.setUserInfo(uid); // aqui se hace el registro
      })
      .catch(err => {
        console.log(err.message)  
        loading.dismiss()
        this.utlisService.presentToast({ // mensaje de error
          message: err.message, //firebaseError[err.code],
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })
      })
    }

    async setUserInfo(uid: string) {
      const loading = await this.utlisService.presentLoading();
      await loading.present();
      
      let path = `users/${uid}`
      delete this.form.value.password // para que no se guarde 
      
      this.firebaseService.setDocument(path, this.form.value).then(async() => {
        await loading.dismiss();
        this.utlisService.saveInLocalStorage('user', this.form.value)
        this.utlisService.routerLink('/main/home');
        this.form.reset();
      })
      .catch(err => {
        loading.dismiss()
        this.utlisService.presentToast({ // mensaje de error
          message: err.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })
      })
  }

}
