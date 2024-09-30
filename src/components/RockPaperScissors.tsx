import { useState } from "react";
import { ConnectButton, TransactionButton, useActiveAccount, useActiveWallet, useDisconnect, useReadContract, useConnect } from "thirdweb/react";
import { client } from "../client";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { shortenAddress } from "thirdweb/utils";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { claimTo, getBalance } from "thirdweb/extensions/erc20";

type Guess = 'High' | 'Low';
type Result = 'Win' | 'Lose';

const getRandomNumber = (): number => Math.floor(Math.random() * 100) + 1;

interface GameResult {
    playerGuess: Guess;
    computerNumber: number;
    gameResult: Result;
}

export default function HighLowGuessingGame() {
    const account = useActiveAccount();
    const { disconnect } = useDisconnect();
    const wallet = useActiveWallet();
    const { connect } = useConnect();

    const contract = getContract({
        client: client,
        chain: sepolia,
        address: "0xf0Fb0F1c703b1129634e042e459Ec41cF79650B7"
    });

    const [result, setResult] = useState<GameResult | null>(null);
    const [showPrize, setShowPrize] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [prizeClaimed, setPrizeClaimed] = useState<boolean>(false);

    const handleGuess = (playerGuess: Guess) => {
        const computerNumber = getRandomNumber();
        const isHigh = computerNumber > 50;
        const gameResult = (playerGuess === 'High' && isHigh) || (playerGuess === 'Low' && !isHigh) ? 'Win' : 'Lose';
        setResult({ playerGuess, computerNumber, gameResult });
        setShowPrize(gameResult === 'Win');
    };

    const resetGame = () => {
        setResult(null);
        setShowPrize(false);
        setPrizeClaimed(false);
    };

    const claimPrize = () => {
        setShowModal(true);
    };

    const { data: tokenbalance } = useReadContract(
        getBalance,
        {
            contract: contract,
            address: account?.address!
        }
    );

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f0f0f0',
            color: '#333',
        }}>
            <div style={{
                padding: '2rem',
                margin: '0 0.5rem',
                width: '400px',
                maxWidth: '98%',
                height: '400px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                position: 'relative'
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>High or Low Game</h1>
                {!account ? (
                    <>
                        <ConnectButton
                            client={client}
                            accountAbstraction={{
                                chain: sepolia,
                                sponsorGas: true
                            }}
                            wallets={[
                                inAppWallet({
                                    auth: {
                                        options: [
                                            "email"
                                        ]
                                    }
                                })
                            ]}
                        />
                        <button
                            onClick={() =>
                                connect(async () => {
                                    const wallet = createWallet("io.metamask");
                                    await wallet.connect({ client });
                                    return wallet;
                                })
                            }
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginTop: '1rem'
                            }}
                        >
                            Connect with Metamask
                        </button>
                    </>
                ) : (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                height: 'auto',
                                width: '100%',
                                gap: '0.5rem',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                border: '1px solid #f0f0f0',
                                padding: '0.5rem',
                            }}
                        >
                            <div>
                                <p
                                    style={{
                                        fontSize: '0.5rem',
                                        marginBottom: '-10px',
                                        marginTop: '-10px'
                                    }}
                                >{shortenAddress(account.address)}</p>
                                <p style={{
                                    fontSize: '0.75rem',
                                    marginBottom: '-10px'
                                }}
                                >Balance: {tokenbalance?.displayValue}</p>
                            </div>
                            <button
                                onClick={() => disconnect(wallet!)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem'
                                }}
                            >Logout</button>
                        </div>
                        {!result ? (
                            <div>
                                <h3>Guess if the number is High or Low:</h3>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: "2rem" }}>
                                    {['High', 'Low'].map((guess) => (
                                        <button
                                            key={guess}
                                            onClick={() => handleGuess(guess as Guess)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {guess}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <p style={{ fontSize: '1.5rem', marginBottom: '-10px' }}>
                                    You guessed: {result.playerGuess}
                                </p>
                                <p style={{ fontSize: '1.5rem', marginBottom: '-20px' }}>
                                    Computer chose: {result.computerNumber}
                                </p>
                                <p style={{ fontWeight: 'bold', fontSize: '2rem' }}>
                                    Result: {result.gameResult}
                                </p>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    alignItems: 'center'
                                }}>
                                    <button
                                        onClick={resetGame}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Try Again
                                    </button>
                                    {showPrize && !prizeClaimed && (
                                        <button
                                            onClick={claimPrize}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: '#ffc107',
                                                color: 'black',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >Claim Prize</button>
                                    )}
                                    {showModal && (
                                        <div style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{
                                                background: 'white',
                                                padding: '2rem',
                                                borderRadius: '8px',
                                                maxWidth: '300px',
                                                textAlign: 'center'
                                            }}>
                                                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Claim 10 Tokens!</h2>
                                                <p style={{ marginBottom: '1rem' }}>You won and can claim 10 tokens to your wallet.</p>

                                                <TransactionButton
                                                    transaction={() => claimTo({
                                                        contract: contract,
                                                        to: account.address,
                                                        quantity: "10"
                                                    })}
                                                    onTransactionConfirmed={() => {
                                                        alert('Prize claimed!')
                                                        setShowModal(false)
                                                        setPrizeClaimed(true)
                                                    }}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        background: '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >Claim Prize</TransactionButton>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
