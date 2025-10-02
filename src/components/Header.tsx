import React from "react";
import { clearUser, getUser } from "../lib/session";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Header() {
  const router = useRouter();
  const user = getUser();

  if (!user) return null;

  const handleLogout = () => {
    clearUser();
    router.push("/login");
  };

  const handleName = (name: string) => {
    const letters = name.split('');
    letters[0] = letters[0].toUpperCase() 
    return letters.join('')
  }

  return (
    <header style={{
      background: '#F18DBC',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 20px',
    }}>
        
    <div style={{display: 'inline-flex'}}>
      <img src="/logo-ny.png" alt="Logo" width={40} />
      <h1 style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: "Homemade Apple", color: 'black', paddingTop: '5px'}}>{handleName(user.name)}</h1>
    </div>
     <button
        onClick={handleLogout}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '50%',
          padding: '6px',
          cursor: 'pointer',
        }}
        title="Logout"
      >
        <FontAwesomeIcon icon="sign-out-alt" size="lg" />
      </button>

    </header>
  );
}
