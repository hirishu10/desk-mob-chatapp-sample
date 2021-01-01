/**
 * With love from Desk-Mob ChatApp Team
 * Github -
 * App Link -
 * API Link - http://localhost:3000/api/twoDaysChats?id=[chatID]&q=[personEmail]
 * Version -
 * License -
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { dbAuth } from "../../firebase";
import * as firestore from "firebase/firestore";

type Data = any;

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::: API ::: FOR :::: ALL  CHATS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // :::: User details API
  const rootCollectionForChats = firestore.collection(dbAuth, "chats"); // This is very important don't delete this
  let decodedURL = decodeURIComponent(`${req?.query?.id}`);
  const chatIdDocument = firestore.doc(rootCollectionForChats, decodedURL);
  const chatIdDocumentCollection = firestore.collection(
    chatIdDocument,
    "allchats"
  ); // new added
  const queryDocumentForChats = firestore.query(
    chatIdDocumentCollection,
    firestore.orderBy("timesTamp", "desc")
  );
  const dataFetched = firestore.getDocs(queryDocumentForChats);

  //   :::: Below is for the Friend List API
  /**
   * For Chat user details
   */
  const rootCollectionForChat = firestore.collection(dbAuth, "users"); // This is very important don't delete this
  let decodedURLForChat = decodeURIComponent(`${req?.query?.q}`);
  const mainDocumentForChat = firestore.doc(
    rootCollectionForChat,
    decodedURLForChat
  );
  const fetchAllDocForChat = firestore.getDoc(mainDocumentForChat);
  //

  //
  if (req.method === "GET") {
    if (req?.query?.id !== null && req?.query?.q !== null) {
      // all chat id will be stored in this Array::>
      let arrayOfIdForChats = [];
      if (arrayOfIdForChats.length < 1) {
        const arrayLimit = 1;
        dataFetched?.then((raw) => {
          // condition if user created first time then they don't have the previous chat hence need to be checked!
          if (raw?.docs?.length > 1) {
            //
            raw?.docs?.map((item, index) => {
              if (index <= arrayLimit) {
                arrayOfIdForChats.push(item?.id);
                // console.log("item?.id :>> ", item?.id);//::> Debug
                // console.log("item?.data() :>> ", item?.data());//::> Debug
              }
            });
            // console.log("arrayOfIdForChats :>> ", arrayOfIdForChats);//::> Debug
            // Below code added later for taking only current two days for chats
            let One = arrayOfIdForChats[0];
            let Two = arrayOfIdForChats[1];
            arrayOfIdForChats = [];
            arrayOfIdForChats.push(Two, One);
          } else {
            // Only sending the today or created day dataa
            // raw?.docs?.map((item, index) => {
            arrayOfIdForChats.push(raw?.docs[0]?.id);
            // });
            // console.log("arrayOfIdForChats", arrayOfIdForChats); //::> Debug
          }
        });
      }
      // :::>
      // First User Config will fetch the all the freindList data
      let allDataCompressed = {};
      // :: User Config data fetching
      fetchAllDocForChat
        .then((r) => {
          // First check if the user data is exist or not if not it will throw error otherwise send the data to the server
          if (r.exists()) {
            // console.log("r?.data", r?.data()); //::> Debug
            allDataCompressed = {
              email: r?.data()?.email,
              name: r?.data()?.name,
              photoURL: r?.data()?.photoURL,
              loginDate: r?.data()?.loginDate,
              lastSeen: r?.data()?.lastSeen,
            };

            // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
            if (arrayOfIdForChats.length > 0) {
              let arrayOfChats = []; // All chats data collected inside this to send it later
              //
              arrayOfIdForChats?.map((item, arrayOfIdForChatsIndex) => {
                const eachDayDocument = firestore.doc(
                  chatIdDocumentCollection,
                  item
                ); //new added
                // each chats stored in the each day collection
                const eachDayDocumentCollection = firestore.collection(
                  eachDayDocument,
                  "eachChats"
                );
                const queriedDocument = firestore.query(
                  eachDayDocumentCollection,
                  firestore.orderBy("date", "asc")
                );

                const finallyFetchedData = firestore.getDocs(queriedDocument);
                // fetching bothe id's data to send
                finallyFetchedData
                  ?.then((r) => {
                    r?.docs?.map((item, index) => {
                      arrayOfChats.push({
                        uuid: item?.data()?.uuid,
                        id: item?.data()?.id,
                        name: item?.data()?.name,
                        message: item?.data()?.message,
                        photoURL: item?.data()?.photoURL,
                        date: item?.data()?.date,
                        timesTamp: item?.data()?.timesTamp,
                      });
                    });

                    //
                    // console.log(arrayOfChats); //::::> Debug
                    // :::: when the last id data iterating then it will check the length of the current data and the raw data to send the same into the server.
                    const targetIndex =
                      arrayOfIdForChats?.length > 0
                        ? arrayOfIdForChats?.length - 1
                        : arrayOfIdForChats?.length;
                    if (targetIndex === arrayOfIdForChatsIndex) {
                      res.setHeader(
                        "Cache-Control",
                        "public, s-maxage=1, stale-while-revalidate"
                      );
                      res.status(200).json({
                        status: "success",
                        chatId: decodedURL,
                        chatUserData: allDataCompressed,
                        chatIdArray: arrayOfIdForChats,
                        data: arrayOfChats,
                      });
                    }
                    //
                  })
                  .catch((err) => {
                    res.status(404).send({
                      access: "Denied",
                      message: `Something went wrong ${err}`,
                    });
                  });
                //
              });
            } else {
              res.setHeader(
                "Cache-Control",
                "public, s-maxage=1, stale-while-revalidate"
              );
              res.status(200).json({
                status: "success",
                chatId: decodedURL,
                chatUserData: allDataCompressed,
                chatIdArray: arrayOfIdForChats,
                data: [],
              });
            }
            // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
          }
        })
        .catch((err) => {
          res.status(404).send({
            access: "Denied",
            message: `Something went wrong ${err}`,
          });
        });
    } else {
      res.status(401).send({
        access: "Denied",
        message: "Sorry Please check the link and try again",
        contact: "Please drop an email:- hi.10rishu@gmail.com",
      });
    }
  }
}
/**
 * Written by Rishu Chowdhary
 */
