import { useState, useEffect } from "react";
import './App.css'



function App(){
  const [activeTab,setActiveTab]=useState("login");
  const [currentUser,setCurrentUser]=useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);


  const [registerData, setRegisterData]=useState({
    email:"",
    password: "",
    role: "ADMIN",
    username: ""
  });

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  async function registerUser(){
    setMessage("");
    setSubmitting(true);
    const url = 'https://api.freeapi.app/api/v1/users/register';
    const options = {
      method: 'POST',
      headers: {accept: 'application/json', 'content-type': 'application/json'},
      body: JSON.stringify(registerData)
    };
    if (!registerData.email.includes("@")) {
      setMessage("Enter valid email");
      setSubmitting(false);
      return;
    }
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (response.ok) {
        setRegisterData({
          email: "",
          password: "",
          role: "ADMIN",
          username: ""
        });
        setMessage("User Registered Successfully");
        
      }else if (response.status === 409) {
        setMessage("Username or Email already registered");
        
      } else {
        setMessage(data.message || "Registration Failed");
        
    }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }


  const [loginData, setLoginData]=useState({
    username:"",
    password:""
  })
  const handleLoginChange=(e)=>{
    setLoginData({
      ...loginData,
      [e.target.name]:e.target.value,
    })
  }

  async function loginUser() {
    setSubmitting(true);
    setMessage("");
    const url = 'https://api.freeapi.app/api/v1/users/login';
    const options = {
      method: 'POST',
      headers: {accept: 'application/json', 'content-type': 'application/json'},
      body: JSON.stringify(loginData)
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (response.ok && data.data) {
        setMessage("Login Successful");
        setLoginData({
          username: "",
          password: ""
        });
        setCurrentUser(data.data.user);
        localStorage.setItem("token", data.data.accessToken);
      }else {
        setMessage("Invalid Credentials");
        
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
    
  }

  
  async function loggedIn() {
    const token = localStorage.getItem("token");
    if(!token){
      setLoading(false)
      return;
    }
    const url = 'https://api.freeapi.app/api/v1/users/current-user';
    const options = {method: 'GET', headers: {accept: 'application/json', Authorization: `Bearer ${token}`}};

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if(response.ok && data.data){
        setCurrentUser(data.data);
      }else{
        localStorage.removeItem("token")
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false)
    }
  }
  
  async function logoutUser() {
    const token = localStorage.getItem("token");
    const url = 'https://api.freeapi.app/api/v1/users/logout';
    const options = {method: 'POST', headers: {accept: 'application/json', Authorization: `Bearer ${token}`}};

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      setCurrentUser(null)
      localStorage.removeItem("token");
      setActiveTab("login")
      setMessage("Logged Out Successfully");
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loggedIn();
    
  }, []);


  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);


  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="container">
      <h2 className="hero">
        Authentication
      </h2>
      {message && (
        <div className="alert">
        {message}
        </div>
      )}
      {currentUser?
        (
          
          <div className="profile">
            <h2>Current User</h2>
            <p className="profileUsername"><strong>Username:</strong>{" "}{currentUser.username}</p>
            <p className="profileEmail"><strong>Email:</strong>{" "}{currentUser.email}</p>
            <p className="profileRole"><strong>Role:</strong>{" "}{currentUser.role}</p>
            <button onClick={logoutUser}>Logout</button>
          </div>
        ):(
          <div>
            <div className="tabs">
              <button
                className={
                activeTab==="login"?"active":""
                }
                onClick={()=>setActiveTab("login")}
              >
              Login
              </button>

              <button
                className={
                  activeTab==="register"?"active":""
                }
                onClick={()=>setActiveTab("register")}
              >
              Register
              </button>
            </div>
          
            {activeTab==="register"&&( 
              <div className="registrationContainer">
                <h3 className="registrationHero">Register User</h3>
                <div className="registrationInputs">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Enter Email" 
                    value={registerData.email} 
                    onChange={handleRegisterChange}
                    required
                  />
                  <input 
                    type="text" 
                    name="username" 
                    placeholder="Enter Username" 
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    required
                  />
                  <input 
                    type="password" 
                    placeholder="Enter password" 
                    value={registerData.password}
                    name="password"
                    onChange={handleRegisterChange} 
                    required 
                  />
                  <select 
                    name="role"
                    value={registerData.role}
                    onChange={handleRegisterChange}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                  </select>
                  <button
                    onClick={registerUser}
                    disabled={submitting}
                  >
                    {submitting ? "Loading..." : "Register"}
                  </button>
                </div>
              </div>
            )}

            {activeTab==="login"&&(
            <div className="loginContainer">
              <h2 className="loginHero">Login User</h2>
              <div className="loginInputs">
                <input 
                  type="text" 
                  name="username" 
                  placeholder="Enter your username"
                  value={loginData.username}
                  onChange={handleLoginChange}  
                  required
                />
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={handleLoginChange}  
                  required
                />
              </div>
              
              <button
                onClick={loginUser}
                disabled={submitting}
              >
                {submitting ? "Loading..." : "Login"}
              </button>
            </div>
            )}
          </div>

          
        )
      }
      

      
      
      
    </div>
    
  )
}
export default App