import React, { useState, useEffect } from "react";
import { useWallet } from "use-wallet";

import { useBlockchainContext } from "../context";
import { Toast } from "../utils/message";
import logo from "../assets/images/logo.png";
import sub1 from "../assets/images/first.png";
import sub2 from "../assets/images/second.png";
import sub3 from "../assets/images/third.png";

export default function Main() {
    const wallet = useWallet();
    const [state, { BuyToken, getTotal }] = useBlockchainContext();
    const [flag, setFlag] = useState(1);
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tokenAmount, setTokenAmount] = useState(0);
    const [percent, setPercent] = useState(0);
    const [restTime, setRestTime] = useState(null);

    useEffect(() => {
        if (!state.terms)
            setRestTime({
                day: 0,
                hour: 0,
                min: 0,
                sec: 0,
            });
        else {
            setRestTime({
                day: Math.floor(state.terms.duration / (24 * 3600)),
                hour: Math.floor(
                    (state.terms.duration -
                        Math.floor(state.terms.duration / (24 * 3600)) *
                            3600 *
                            24) /
                        3600
                ),
                min: Math.floor(
                    (state.terms.duration -
                        Math.floor(state.terms.duration / 3600) * 3600) /
                        60
                ),
                sec: Math.floor(
                    state.terms.duration -
                        (Math.floor(state.terms.duration / 3600) * 3600 +
                            Math.floor(
                                Math.floor(
                                    (state.terms.duration -
                                        Math.floor(
                                            state.terms.duration / 3600
                                        ) *
                                            3600) /
                                        60
                                ) * 60
                            ))
                ),
            });
        }
    }, [state.terms]);

    useEffect(() => {
        if (amount > 0) {
            Number(flag) === 1
                ? setTokenAmount((amount * state.BNBPrice) / state.price)
                : setTokenAmount(amount / state.price);
        } else {
            setTokenAmount(0);
        }
    }, [flag, amount]);

    useEffect(() => {
        if (state.totalSold !== null) {
            setPercent(
                Number((state.totalSold / state.totalAmount) * 100).toFixed(2)
            );
        } else {
            setPercent(0);
        }
    }, [state.totalSold]);

    const handleConnect = () => {
        wallet.connect();
    };

    const handleBuy = () => {
        if (amount.toString().trim() === "" || amount <= 0) {
            Toast("Please input amount", "warning");
            return;
        }
        if (Number(wallet.chainId) !== state.supportChainId) {
            Toast("Please use Smart Chain", "warning");
            return;
        }
        setLoading(true);
        BuyToken({
            flag: flag,
            amount: amount,
        })
            .then((res) => {
                if (res) {
                    Toast("Successfully Buy", "success");
                    getTotal();
                } else {
                    Toast("Buy Failed", "error");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
                Toast("Buy Failed", "error");
            });
    };

    const onChangeAmount = (e) => {
        setAmount(e.target.value);
    };

    const addToken = async () => {
        if (wallet.status !== "connected") {
            Toast("Please connect wallet", "warning");
            return;
        }

        let tokenAddress = "0xe329102DA0E7E135656CD72CDc983c81f27CB5B6";
        let tokenSymbol = "XBT";
        let tokenDecimals = 18;
        let tokenImage = "https://babylonswap.finance/favicon.ico";

        try {
            // wasAdded is a boolean. Like any RPC method, an error may be thrown.
            await window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20", // Initially only supports ERC20, but eventually more!
                    options: {
                        address: tokenAddress, // The address that the token is at.
                        symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                        decimals: tokenDecimals, // The number of decimals in the token
                        image: tokenImage, // A string url of the token logo
                    },
                },
            });
        } catch (error) {
            console.log(error);
            Toast("Failed token add", "error");
        }
    };

    return (
        <div className="dashboard">
            <div className="spacer-half"></div>

            {/* Begin Header */}
            <div className="container">
                <a href="https://nevermoredefi.com">
                    <div className="header">
                        <img src={logo} alt="" />
                        <h3>Nevermore</h3>
                    </div>
                </a>
            </div>
            {/* End Header */}

            <div className="spacer-half"></div>

            {/* Begin Mainboard */}
            <section className="mainboard">
                <div className="container">
                    <div className="flex center middle text-center">
                        <h2>Nevermore Academy Private-Sale</h2>
                    </div>

                    {/* Begin Presale Card */}
                    <div className="card">
                        <div className="presale__panel">
                            <h4>
                                {state.terms
                                    ? state.terms.status
                                    : "Presale start in"}
                            </h4>

                            <div className="row time">
                                <div className="col-3">
                                    <span>
                                        {restTime === null
                                            ? null
                                            : restTime.day > 9
                                            ? restTime.day
                                            : "0" + restTime.day}
                                    </span>
                                </div>
                                <div className="col-3">
                                    <span>
                                        {restTime === null
                                            ? null
                                            : restTime.hour > 9
                                            ? restTime.hour
                                            : "0" + restTime.hour}
                                    </span>
                                </div>
                                <div className="col-3">
                                    <span>
                                        {restTime === null
                                            ? null
                                            : restTime.min > 9
                                            ? restTime.min
                                            : "0" + restTime.min}
                                    </span>
                                </div>
                                <div className="col-3">
                                    <span>
                                        {restTime === null
                                            ? null
                                            : restTime.sec > 9
                                            ? restTime.sec
                                            : "0" + restTime.sec}
                                    </span>
                                </div>
                            </div>
                            <div className="spacer-half"></div>

                            <div className="presale__content">
                                <div className="row">
                                    <div className="col-sm-4 col-xs-12">
                                        <span>Symbol: WD</span>
                                    </div>
                                    <div className="col-sm-4 col-xs-12">
                                        <span>Price: {state.price}</span>
                                    </div>
                                    <div className="col-sm-4 col-xs-12">
                                        <span onClick={addToken}>
                                            <b>Add to Metamask</b>
                                        </span>
                                    </div>
                                </div>
                                <div className="spacer-10"></div>

                                <div className="slider">
                                    <span>
                                        Sold Amount (
                                        {Number(state.totalSold).toFixed(2)} $)
                                    </span>
                                    <div className="bar">
                                        <div
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                    <div className="spacer-10"></div>
                                    <div className="status_bar">
                                        <div>
                                            <span>softcap (5 ETH)</span>
                                        </div>
                                        <div>
                                            <span>hardcap (20 ETH)</span>
                                        </div>
                                    </div>
                                    <div className="spacer-double"></div>

                                    <div className="presale__control">
                                        <label>Select: </label>
                                        <select
                                            onChange={(e) =>
                                                setFlag(e.target.value)
                                            }
                                        >
                                            <option value={1}>BNB</option>
                                            <option value={2}>BUSD</option>
                                        </select>
                                    </div>
                                    <br />
                                    <div className="presale__control">
                                        <label>Amount: </label>
                                        <input
                                            type="number"
                                            onChange={(e) => onChangeAmount(e)}
                                        />
                                    </div>
                                    <br />
                                    {wallet.status === "connected" ? (
                                        <div className="presale__control">
                                            <label>Token Amount: </label>
                                            <span className="color">
                                                {state.price === null ||
                                                state.BNBPrice === null
                                                    ? "updating..."
                                                    : tokenAmount}
                                            </span>
                                        </div>
                                    ) : null}
                                    <div className="spacer-single"></div>

                                    <div className="flex middle center">
                                        {wallet.status === "connecting" ? (
                                            <button className="button-white">
                                                Connecting...
                                            </button>
                                        ) : wallet.status === "connected" ? (
                                            loading ? (
                                                <button className="button-white">
                                                    Buying...
                                                </button>
                                            ) : (
                                                <button
                                                    className="button-white"
                                                    onClick={handleBuy}
                                                >
                                                    Buy XBT Now
                                                </button>
                                            )
                                        ) : (
                                            <button
                                                className="button-white"
                                                onClick={handleConnect}
                                            >
                                                Wallet Connect
                                            </button>
                                        )}
                                    </div>
                                    <div className="spacer-half"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* End Presale Card */}
                </div>
                <div className="spacer-double"></div>

                {/* Begin Ecosystem Info */}
                <div className="ecosystem">
                    <h2>Ecosystem</h2>
                    <div className="row text-center">
                        <div className="col-md-4 col-sm-12">
                            <span>
                                <img src={sub1} alt="" />
                                <h4>Limited and deflationary supply</h4>
                                <p>
                                    Wednesday Token (WD) is a very scarce asset
                                    with deflationary supply. Our contracts do
                                    not have minting funciton which means that
                                    no tokens are issued beyond the initial
                                    amount, instead a portion of the generated
                                    protocol fees are used for token burning.
                                </p>
                            </span>
                        </div>
                        <div className="col-md-4 col-sm-12">
                            <span>
                                <img src={sub2} alt="" />
                                <h4>Earn ETH with $WD token staking!</h4>
                                <p>
                                    Our system designed to avoid the inflation
                                    of our Wednesday tokens. We have developed
                                    an unique staking contract which provide the
                                    ETH rewards for the token stakers. The
                                    contract collecting the fees from the
                                    protocol and swap them to Ethereum tokens.
                                    In addition we have different revenue
                                    streams to ensure the high APR.
                                </p>
                            </span>
                        </div>
                        <div className="col-md-4 col-sm-12">
                            <span>
                                <img src={sub3} alt="" />
                                <h4>Different revenue streams</h4>
                                <p>
                                    The system is collecting the fees on every
                                    buy and sell transaction to generate the
                                    reward for the staking pool. In addition,we
                                    use lot of various ways to ensure the reward
                                    for our stakers like early unlocking fees or
                                    different protocol fees like nft royalties.
                                </p>
                            </span>
                        </div>
                    </div>
                </div>
                {/* End Ecosystem Info */}
            </section>
            {/* End Mainboard */}

            <div className="spacer-double"></div>

            {/* Begin Footer */}
            <section className="footer">
                <a href="https://babylonswap.finance">
                    <div>
                        <img src={logo} alt="" />
                        <h3>Nevermore</h3>
                    </div>
                </a>
                <p>Copyright &copy; 2022</p>
            </section>
            {/* End Footer */}
        </div>
    );
}
