function NewPasswordForm({
  securityCode,
  setSecurityCode,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword
})
{
    
    const handleResetPassword = () => {
      if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
        //TODO: submit new password
        console.log("password Reset Handled")
    };

    return(
        <>
        <form onSubmit={(e)=>{
        e.preventDefault();
        handleResetPassword()}}>
      <label htmlFor="code">Enter the security code</label>
      <input
        id="code"
        className="security-code-input"
        type="text"
        value={securityCode}
        onChange={(e) => setSecurityCode(e.target.value)}
      />

      <label htmlFor="newpass">New password</label>
      <input
        id="newpass"
        className="new-password-input"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <label htmlFor="newpass2">Confirm new password</label>
      <input
        id="newpass2"
        className="confirm-password-input"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button className="reset-password" type="submit">
        Reset password
      </button>
      </form> 
      </>
    )
}
export default NewPasswordForm;