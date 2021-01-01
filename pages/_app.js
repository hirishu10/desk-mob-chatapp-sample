import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import { useAuthState } from "react-firebase-hooks/auth";
import Login from "./index";
import Splash from "./splash";
import { useEffect } from "react";
import * as firebaseAuth from "firebase/auth";
import * as firestore from "firebase/firestore";
import { app, auth, dbAuth, provider } from "../firebase";
import { Provider } from "react-redux";
import store from "../store";
import { v4 as uuidv4 } from "uuid";
import {
  getCustomDayNameFull,
  getCustomMonthNameShort,
  getCustomDate,
  getCustomHour,
  getCustomMinute,
  getCustomAmPm,
  getCustomFullDateAndTimeWithAmPmIncludingSeconds,
} from "@hirishu10/simple-date-time";
import { getConsoleDesign } from "../utils/getConsoleDesign";

function MyApp({ Component, pageProps }) {
  const uuid = uuidv4();
  const [user, loading] = useAuthState(auth);
  //::::>
  const d = new Date();
  const year = d.getFullYear();
  const timesTamp = `${getCustomDate()} ${getCustomMonthNameShort()} ${getCustomHour()}:${getCustomMinute()}${getCustomAmPm(
    true
  )} (${getCustomDayNameFull()})`;
  const loginDetails = getCustomFullDateAndTimeWithAmPmIncludingSeconds();
  //::::>

  useEffect(() => {
    if (user) {
      //chat id for both parties
      const CHAT_ID = `${user?.email}deskmobchatapp@gmail.com`;
      try {
        const mainCollection = firestore.collection(dbAuth, "users");
        const mainDocument = firestore.doc(mainCollection, user?.email);
        firestore.setDoc(
          mainDocument,
          {
            name: user?.displayName,
            email: user?.email,
            lastSeen: firestore.serverTimestamp(),
            photoURL: user?.photoURL,
            loginDate: loginDetails,
          },
          { merge: true }
        );
        const freindCollection = firestore.collection(
          mainDocument,
          "freindList"
        );
        const freindDocument = firestore.doc(
          freindCollection,
          "deskmobchatapp@gmail.com"
        );
        firestore.setDoc(
          freindDocument,
          {
            chatId: CHAT_ID,
            lastSeen: firestore.serverTimestamp(),
            people: ["deskmobchatapp@gmail.com", user?.email],
          },
          { merge: true }
        );

        if (user?.email !== "deskmobchatapp@gmail.com") {
          //**** Opposition Database
          // friend have the same chat details
          // push the email in the chat database
          const oppDocument = firestore.doc(
            mainCollection,
            "deskmobchatapp@gmail.com"
          );
          const oppCollection = firestore.collection(oppDocument, "freindList");
          const oppChildDocument = firestore.doc(oppCollection, user?.email);
          firestore.setDoc(
            oppChildDocument,
            {
              chatId: CHAT_ID,
              lastSeen: firestore.serverTimestamp(),
              people: [user?.email, "deskmobchatapp@gmail.com"],
            },
            { merge: true }
          );
        }

        // Dest-Mob have send some message to the person when login
        let currData = `${getCustomDate()}${getCustomMonthNameShort()}${year}`; // new added
        const chatCollection = firestore.collection(dbAuth, "chats");
        const chatIdDocument = firestore.doc(chatCollection, CHAT_ID);
        // :::::::::::::::::::::::::::
        //  new added today
        firestore.setDoc(
          chatIdDocument,
          {
            userOne: {
              name: user?.email,
              flag: true,
            },
            userTwo: {
              name: "deskmobchatapp@gmail.com",
              flag: false,
            },
          },
          { merge: true }
        ); //new added today
        // :::::::::::::::::::::::::::
        // collection of the chat (allChats)
        const chatIdDocumentCollection = firestore.collection(
          chatIdDocument,
          "allchats"
        ); // new added
        // each day document
        const eachDayDocument = firestore.doc(
          chatIdDocumentCollection,
          currData
        ); //new added
        // setting the timestamp for the each day document
        firestore.setDoc(
          eachDayDocument,
          {
            timesTamp: firestore.serverTimestamp(),
          },
          { merge: true }
        ); //new added

        // each chats stored in the each day collection
        const eachDayDocumentCollection = firestore.collection(
          eachDayDocument,
          "eachChats"
        );
        //
        firestore.addDoc(eachDayDocumentCollection, {
          uuid: uuid,
          message:
            "Welcome to Desk-Mob ChatApp Please feel free to contact with us for any help 🙂 deskmobchatapp@gmail.com",
          id: "deskmobchatapp@gmail.com",
          name: "Desk-Mob-ChatApp Team",
          photoURL:
            "https://lh3.googleusercontent.com/a-/AOh14GhFZUUKONGNE6hnYGEV_uvIky4OOToEhDmuq-Ln=s96-c",
          date: firestore.serverTimestamp(),
          timesTamp: timesTamp,
        });
      } catch (error) {
        console.log("error :>> ", error);
      }
    }

    // :::::::::::::: Console Design for Browser ::::::::::::::
    getConsoleDesign();
    // :::::::::::::: Console Design for Browser ::::::::::::::
  }, [user]);

  if (loading) return <Splash />;
  if (!user) return <Login />;

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
