import React, {
    createContext,
    useContext,
    useReducer,
    useMemo,
    useEffect,
} from "react";
import { ethers } from "ethers";
import { useWallet } from "use-wallet";

import { PresaleContract, USDCContract, supportChainId } from "../contract";
import { toBigNum, fromBigNum } from "../utils";

const BlockchainContext = createContext();

export function useBlockchainContext() {
    return useContext(BlockchainContext);
}

function reducer(state, { type, payload }) {
    if (type === "increaseCTime") {
        return {
            ...state,
            cTime: state.cTime + 1,
        };
    }
    return {
        ...state,
        [type]: payload,
    };
}

const INIT_STATE = {
    signer: null,
    price: null,
    ETHPrice: 0,
    totalSold: 0,
    totalAmount: 1000000,
    terms: null,
    cTime: 0,
    interval: null,
};

export default function Provider({ children }) {
    const wallet = useWallet();
    const [state, dispatch] = useReducer(reducer, INIT_STATE);

    /* ------------ Wallet Section ------------- */
    useEffect(() => {
        getPrice();

        const autoAccess = setInterval(() => {
            getTotal();
        }, 5000);
        return () => clearInterval(autoAccess);
    }, []);

    useEffect(() => {
        const getSigner = async () => {
            if (wallet.status === "connected") {
                const provider = new ethers.providers.Web3Provider(
                    wallet.ethereum
                );
                const signer = provider.getSigner();
                dispatch({
                    type: "signer",
                    payload: signer,
                });
            }
        };

        getSigner();
        getPrice();
    }, [wallet.status]);

    const getPrice = async () => {
        try {
            let price = await PresaleContract.getPrice();
            let ethPrice = await PresaleContract.ethPrice();

            dispatch({
                type: "price",
                payload: fromBigNum(price, 6),
            });
            dispatch({
                type: "ETHPrice",
                payload: fromBigNum(ethPrice, 6),
            });
        } catch (err) {
            console.log(err);
        }
    };

    const getTotal = async () => {
        let ethBalance = await state.signer.getBalance(PresaleContract.address);
        let usdcBalance = await USDCContract.balanceOf(PresaleContract.address);
        let total =
            fromBigNum(ethBalance, 18) * state.ETHPrice +
            fromBigNum(usdcBalance, 18);

        dispatch({
            type: "totalSold",
            payload: total,
        });
    };

    /* ------------ Token Buy Section ------------- */
    const BuyToken = async (props) => {
        try {
            const { amount, flag } = props;

            const signedPresaleContract = PresaleContract.connect(state.signer);
            if (flag === 1) {
                let tx = await signedPresaleContract.buyETH({
                    value: toBigNum(amount),
                });
                await tx.wait();
            } else {
                let signedUSDCContract = USDCContract.connect(state.signer);
                let tx = await signedUSDCContract.approve(
                    PresaleContract.address,
                    toBigNum(amount)
                );
                await tx.wait();

                let tx1 = await signedPresaleContract.buyWithUsdc(
                    toBigNum(amount)
                );
                await tx1.wait();
            }
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    return (
        <BlockchainContext.Provider
            value={useMemo(() => [state, { dispatch, BuyToken }], [state])}
        >
            {children}
        </BlockchainContext.Provider>
    );
}
