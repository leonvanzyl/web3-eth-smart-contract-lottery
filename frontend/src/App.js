import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import web3 from "./web3";
import lottery from "./lottery";

function App(props) {
  // State Management
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState("");
  const [value, setValue] = useState("");
  const [isEntering, setIsEntering] = useState(false);
  const [isPickingWinner, setIsPickingWinner] = useState(false);
  const [winner, setWinner] = useState("");

  const getInitialData = useCallback(async () => {
    const manager = await lottery.methods.manager().call();
    setManager(manager);

    const players = await lottery.methods.getPlayers().call();
    setPlayers(players);

    const balance = await web3.eth.getBalance(lottery.options.address);
    setBalance(balance);
  }, [setManager, setPlayers, setBalance]);

  // Initial data load
  useEffect(() => {
    getInitialData();
  }, [getInitialData]);

  // Handler functions
  const handleEnterButton = async (e) => {
    e.preventDefault();
    const accounts = await web3.eth.getAccounts();

    const convertedValue = web3.utils.toWei(value, "ether");

    setIsEntering(true);

    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: convertedValue,
      });
    } catch (err) {
      console.log(err);
    }

    setIsEntering(false);
  };

  const handlePickWinner = async (e) => {
    e.preventDefault();
    setIsPickingWinner(true);
    const accounts = await web3.eth.getAccounts();

    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });

    setIsPickingWinner(false);
  };

  return (
    <div>
      <h2>Lottery Contract</h2>
      <p>This contract is managed by {manager}</p>
      <p>
        {`There are currently ${
          players.length
        } people entered, competing to win ${web3.utils.fromWei(
          balance,
          "ether"
        )} ether!`}
      </p>
      <hr />
      <form>
        <h4>Want to try your luck?</h4>
        <div>
          {isEntering && <p>Entering, please wait...</p>}
          {!isEntering && (
            <>
              <label htmlFor="value">Amount of ether to enter</label>
              <input
                type="text"
                id="value"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
              <button onClick={handleEnterButton}>Enter</button>
            </>
          )}
        </div>
      </form>

      <hr />
      <form>
        <h4>Ready to pick a winner?</h4>
        {isPickingWinner && <p>Busy Picking Winner...</p>}
        {!isPickingWinner && (
          <button onClick={handlePickWinner}>Pick a winner</button>
        )}
      </form>
    </div>
  );
}

export default App;
