```
git clone https://github.com/Hellyson206/ChatSync.git
```
```
cd ChatApp && yarn
```

Adicione o backEnd do firebase que você criou no `firebase.js`

```
const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.apiKey,
  authDomain: Constants.expoConfig.extra.authDomain,
  projectId: Constants.expoConfig.extra.projectId,
  storageBucket: Constants.expoConfig.extra.storageBucket,
  messagingSenderId: Constants.expoConfig.extra.messagingSenderId,
  appId: Constants.expoConfig.extra.appId,
  databaseURL: Constants.expoConfig.extra.databaseURL,
  //   @deprecated is deprecated Constants.manifest
};
```

```
npx expo start
```

Não é possivel rodar o app na versão atual do expoGo, é preciso baixar uma versão que suporte o sdk 48
