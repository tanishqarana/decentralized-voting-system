import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getVotingContract } from "./contract";

function App() {
  const [account, setAccount] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState("");

  const [networkName, setNetworkName] = useState("");
  const [chainId, setChainId] = useState(null);

  const SEPOLIA_CHAIN_ID = 11155111;

  const checkNetwork = async () => {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();

    setNetworkName(network.name);
    setChainId(Number(network.chainId));
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // Sepolia in hex
      });
    } catch (error) {
      alert("Failed to switch network");
      console.error(error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
    await checkNetwork();
  };

  const readContract = async () => {
    try {
      await checkNetwork();

      // Block reading if not on Sepolia
      if (chainId !== null && chainId !== SEPOLIA_CHAIN_ID) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = getVotingContract(provider);

      const count = await contract.candidatesCount();
      const total = Number(count);

      let temp = [];
      for (let i = 1; i <= total; i++) {
        const c = await contract.getCandidate(i);
        temp.push({
          id: i,
          name: c[0],
          votes: Number(c[1]),
        });
      }

      setCandidates(temp);
    } catch (err) {
      console.error("Read failed:", err);
    }
  };

  const vote = async (candidateId) => {
    try {
      await checkNetwork();

      if (chainId !== null && chainId !== SEPOLIA_CHAIN_ID) {
        alert("⚠️ Please switch to Sepolia to vote.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getVotingContract(signer);

      const tx = await contract.vote(candidateId);
      await tx.wait();

      alert("✅ Vote successful!");
      readContract();
    } catch (err) {
      alert(err.reason || "Vote failed");
      console.error(err);
    }
  };

  const addCandidate = async () => {
    if (!newCandidate) return alert("Enter candidate name");

    try {
      await checkNetwork();

      if (chainId !== null && chainId !== SEPOLIA_CHAIN_ID) {
        alert("⚠️ Please switch to Sepolia to add candidates.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getVotingContract(signer);

      const tx = await contract.addCandidate(newCandidate);
      await tx.wait();

      alert("✅ Candidate added!");
      setNewCandidate("");
      readContract();
    } catch (err) {
      alert(err.reason || "Only owner can add candidate");
      console.error(err);
    }
  };

  // Auto reload when chain/account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => window.location.reload());
      window.ethereum.on("accountsChanged", () => window.location.reload());
    }
  }, []);

  // Read candidates after wallet connects
  useEffect(() => {
    if (account) readContract();
  }, [account]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🗳️ Decentralized Voting System</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>
            <b>Connected:</b> {account}
          </p>

          <p><b>Network:</b> {networkName} (Chain ID: {chainId})</p>

          {chainId !== 11155111 && (
            <p style={{ color: "red" }}>
              ⚠️ Wrong Network! Switch to <b>Sepolia</b>
            </p>
          )}


          <p>
            <b>Network:</b> {networkName} (Chain ID: {chainId})
          </p>

          {chainId !== SEPOLIA_CHAIN_ID && (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ color: "red" }}>
                ⚠️ Wrong Network! Please switch to <b>Sepolia</b>.
              </p>
              <button onClick={switchToSepolia}>Switch to Sepolia</button>
            </div>
          )}

          <h3>Add Candidate (Owner only)</h3>
          <input
            value={newCandidate}
            onChange={(e) => setNewCandidate(e.target.value)}
            placeholder="Candidate name"
          />
          <button onClick={addCandidate}>Add</button>

          <h3>Candidates</h3>
          <ul>
            {candidates.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong> — Votes: {c.votes}
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => vote(c.id)}
                >
                  Vote
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
