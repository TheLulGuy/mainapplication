import React, { createContext, useContext, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";

const AuthContext = createContext({
  user: null,
  loading: false,
  signInWithGoogle: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "your-android-client-id.googleusercontent.com",
        iosClientId: "your-ios-client-id.googleusercontent.com", 
        webClientId: "your-web-client-id.googleusercontent.com",
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            // Set user from response
            setUser({
                accessToken: authentication.accessToken,
                // Add more user info as needed
            });
            setLoading(false);
        }
    }, [response]);

    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            await promptAsync();
        } catch (error) {
            console.error('Authentication failed:', error);
            setLoading(false);
        }
    };

    const signOut = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider 
            value={{
                user,
                loading,
                signInWithGoogle,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default function useAuth() {
    return useContext(AuthContext);
};
