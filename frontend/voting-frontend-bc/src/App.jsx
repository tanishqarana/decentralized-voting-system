import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getVotingContract } from "./contract";

function App() {
  const [account, setAccount] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
  };

  const readContract = async () => {
    try {
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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getVotingContract(signer);

      const tx = await contract.vote(candidateId);
      await tx.wait();

      alert("Vote successful!");
      readContract();
    } catch (err) {
      alert(err.reason || "Vote failed");
    }
  };

  const addCandidate = async () => {
    if (!newCandidate) return alert("Enter candidate name");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getVotingContract(signer);

      const tx = await contract.addCandidate(newCandidate);
      await tx.wait();

      alert("Candidate added!");
      setNewCandidate("");
      readContract();
    } catch (err) {
      alert(err.reason || "Only owner can add candidate");
    }
  };

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
          <p>Connected: {account}</p>

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
