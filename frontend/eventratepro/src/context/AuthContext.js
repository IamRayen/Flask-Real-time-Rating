import { createContext, useContext } from "react";



export const AuthContext=createContext(undefined);

export function useAuthContext(){
const context= useContext(AuthContext);
if(context ===undefined){
    throw new Error("user value is still undefined");
}


return context;
}

export function AuthProvider({children}){
    const [User,setUser]=useState(null);
    <AuthContext.Provider value={{User,setUser}}>
        {children}
    </AuthContext.Provider>
       
}