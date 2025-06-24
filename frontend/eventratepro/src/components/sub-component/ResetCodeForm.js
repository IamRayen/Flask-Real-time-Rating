

function ResetCodeForm({ signal, email, setEmail }){

  const handleGetSecurityCode = () => {
    //TODO:request reset code
    console.log("Sending reset code to:", email);

  };
return(
    <>
    <form onSubmit={(e) => {e.preventDefault(); 
        handleGetSecurityCode();
        signal(true)}}>
        <label htmlFor="email">Registered Email</label>
        <input
          id="email"
          className="email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="get-security-code" type="submit">
          Get security code
        </button> 

      </form>
      </>

);
    }
export default ResetCodeForm;