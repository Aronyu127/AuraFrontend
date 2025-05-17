// Add this before imports to declare window.ethereum
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    ethereum?: import('ethers').Eip1193Provider;
  }
}

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { requestNonce, login, fetchUserGems } from './api';
import type { Gem } from './types';

function App() {
  const [address, setAddress] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [gems, setGems] = useState<Gem[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!(window.ethereum)) {
      alert('Please install MetaMask!');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      setAddress(walletAddress);

      // 1. 取得 nonce
      const nonce = await requestNonce();

      // 2. 用錢包簽名
      const signature = await signer.signMessage(nonce);

      // 3. 登入
      const { token, userId } = await login(walletAddress, signature);
      setToken(token);

      // 4. 取得 NFT
      const gems = await fetchUserGems(userId, token);
      setGems(gems);
    } catch (e) {
      alert('Login failed: ' + ((e as Error)?.message || e));
    }
    setLoading(false);
  }

  function handleLogout() {
    setToken('');
    setAddress('');
    setGems([]);
  }

  return (
    <div style={{ margin: '40px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Web3 NFT Login Demo</h1>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
        {address && <span style={{ fontSize: 18, marginRight: 24 }}>Wallet: {address}</span>}
        {token && <button onClick={handleLogout} style={{ padding: '8px 20px', fontSize: 16 }}>Logout</button>}
      </div>
      {!token ? (
        <button onClick={handleLogin} disabled={loading} style={{ fontSize: 20, padding: '12px 32px' }}>
          {loading ? 'Logging in...' : 'Login with MetaMask'}
        </button>
      ) : (
        <div>
          <h2 style={{ fontSize: 32, marginBottom: 24 }}>Your NFTs</h2>
          {gems.length === 0 && <p>No NFT found.</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 32, justifyItems: 'center' }}>
            {gems.map(gem => (
              <div key={gem.id} style={{ border: '1px solid #ccc', borderRadius: 16, padding: 20, margin: 0, width: 180, background: '#fff', boxShadow: '0 2px 8px #0001' }}>
                <img src={gem.metadata.image as string} alt={gem.metadata.name as string} style={{ width: '100%', borderRadius: 8, marginBottom: 12 }} />
                <h4 style={{ fontSize: 18, fontWeight: 700, margin: '8px 0' }}>{gem.metadata.name as string}</h4>
                <p style={{ fontWeight: 600, margin: 0 }}>Quantity: {gem.quantity}</p>
                <p style={{ fontSize: 14, color: '#444', marginTop: 8 }}>{gem.metadata.description as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
