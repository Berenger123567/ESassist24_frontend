import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useMemo } from 'react'
import { useSession } from '../features/session/session-context'
import { useTheme } from '../theme/ThemeProvider'
import { HomeScreen } from '../screens/HomeScreen'
import { LoadingScreen } from '../screens/LoadingScreen'
import { PhoneScreen } from '../screens/PhoneScreen'
import { CodeScreen } from '../screens/CodeScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { WorkspaceScreen } from '../screens/WorkspaceScreen'
import { DossierScreen } from '../screens/DossierScreen'
import { ProfilProScreen } from '../screens/ProfilProScreen'
import { DocumentsScreen } from '../screens/DocumentsScreen'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

/**
 * Navigation et garde par session — étapes 0, 1 et 2.
 *
 * Les écrans publics (accueil, téléphone, code) ne sont enregistrés que si la
 * session est anonyme. L'espace authentifié démarre sur le profil quand le
 * compte vient d'être créé, sinon sur l'espace personnel.
 * Les écrans du dossier professionnel (É2) sont accessibles depuis l'espace.
 */
export function RootNavigator() {
  const { status, session } = useSession()
  const { mode, colors } = useTheme()

  const navigationTheme = useMemo<Theme>(() => {
    const base = mode === 'dark' ? DarkTheme : DefaultTheme

    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary500,
        background: colors.canvas,
        card: colors.surface,
        text: colors.text,
        border: colors.rule,
        notification: colors.primary500,
      },
    }
  }, [mode, colors])

  if (status === 'loading') return <LoadingScreen />

  const authenticated = status === 'authenticated' && session !== null
  const initialRouteName = authenticated
    ? session.isNewUser
      ? 'Profil'
      : 'Espace'
    : 'Accueil'

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        key={authenticated ? 'session' : 'public'}
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
          animation: 'slide_from_right',
        }}
      >
        {authenticated ? (
          <>
            <Stack.Screen name="Profil" component={ProfileScreen} />
            <Stack.Screen name="Espace" component={WorkspaceScreen} />
            <Stack.Screen name="Dossier" component={DossierScreen} />
            <Stack.Screen name="ProfilPro" component={ProfilProScreen} />
            <Stack.Screen name="Documents" component={DocumentsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Accueil" component={HomeScreen} />
            <Stack.Screen name="Connexion" component={PhoneScreen} />
            <Stack.Screen name="Verification" component={CodeScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
