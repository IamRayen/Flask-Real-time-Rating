import { useAuthContext } from "./AuthContext";
import {Navigate} from "react-router-dom";
// This function wraps component / routes
// wrapped functions cannot be accessed if the user is not logged in
// if the user is not logged in the function redirects him to '/login' page
function LoginGuard({children}){
    const {User}=useAuthContext();
    if(User===null || User===undefined){
        return <Navigate to ="/login" replace/>
    }
    return children;

}

export default LoginGuard;
