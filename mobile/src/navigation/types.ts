import type { OtpChannel } from '../features/session/session-api'

export type RootStackParamList = {
  Accueil: undefined
  Connexion: undefined
  Verification: {
    phone: string
    channel: OtpChannel
    resendAfterSeconds: number
    expiresInSeconds: number
  }
  Profil: undefined
  Espace: undefined
  Dossier: undefined
  ProfilPro: undefined
  Documents: undefined
}
