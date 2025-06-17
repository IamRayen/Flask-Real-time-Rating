import { createContext, useContext } from "react";


//AuthContext is undefined at the start 
// Do not use directly in code
export const AuthContext=createContext(undefined);
//consumer function : used by components wrapped by provider
// this function allows access to the current value of the context {undefined, null,{user,setuser}}
// return  value =undefined : context accessed outside provider scope.
// return value = null: not logged in yet (inside provider  scope).
// return value = {User,setUser pair} object : logged in .
// User: the actual user object with user information.
//setUser : function used to update user.
export function useAuthContext(){
const context= useContext(AuthContext);
if(context ===undefined){
    throw new Error("user value is still undefined");
}


return context;
}
// Provider Function used to wrap components .
//components wrapped in this function  {children}
// all children have access to an initialised {User,setUser} 
// User,setUser are in this case similar to a global variable to these children
// these variables are initialised to null = "not logged in yet"
export function AuthProvider({children}){
    const [User,setUser]=useState(null);
    <AuthContext.Provider value={{User,setUser}}>
        {children}
    </AuthContext.Provider>
       
}