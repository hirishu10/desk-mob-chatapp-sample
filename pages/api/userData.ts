/**
 * With love from Desk-Mob ChatApp Team
 * Github -
 * App Link -
 * API Link - /api/userData?id={CurrentUser's Id}
 * Version -
 * License -
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { dbAuth } from "../../firebase";
import * as firestore from "firebase/firestore";

type Data = any;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // :::: User details API
  const rootCollection = firestore.collection(dbAuth, "users"); // This is very important don't delete this
  let decodedURL = decodeURIComponent(`${req?.query?.id}`);
  // const mainDocument = firestore.doc(rootCollection, `${req?.query?.id}`);
  const mainDocument = firestore.doc(rootCollection, decodedURL);
  const fetchAllDoc = firestore.getDoc(mainDocument);
  //   :::: Below is for the Friend List API
  const childCollection = firestore.collection(mainDocument, "freindList");
  const queryDocument = firestore.query(
    childCollection,
    firestore.orderBy("lastSeen", "desc")
  );
  const dataCollection = firestore.getDocs(queryDocument);

  if (req.method === "GET") {
    try {
      // :::>
      // First User Config will fetch the all the freindList data
      let allDataCompressed = [];
      // :: User Config data fetching
      fetchAllDoc
        .then((r) => {
          // First check if the user data is exist or not if not it will throw error otherwise send the data to the server
          if (r.exists()) {
            // console.log("r?.data", r?.data()); //::> Debug
            allDataCompressed.push({
              email: r?.data()?.email,
              name: r?.data()?.name,
              photoURL: r?.data()?.photoURL,
              loginDate: r?.data()?.loginDate,
              lastSeen: r?.data()?.lastSeen,
            });

            // --------------- Config Above -------------------------
            //
            // ========== API for Getting User Data =================
            //
            // --------------- Friend List Below --------------------

            // :: Friend List data fetching started
            dataCollection.then((raw) => {
              let rawFriendList = [];
              raw?.docs?.map((item, index) => {
                // console.log("item?.data()", item?.data()); //::> Debug

                const detailDocument = firestore.doc(
                  rootCollection,
                  `${item?.id}`
                );
                // console.log("item?.id :>> ", item?.id);
                const fetchingDetailDocument = firestore.getDoc(detailDocument);

                fetchingDetailDocument.then((detailRaw) => {
                  // console.log("detailRaw :>> ", detailRaw?.data());
                  //
                  //
                  rawFriendList.push({
                    documentId: item?.id,
                    chatId: item?.data()?.chatId,
                    lastSeen: item?.data()?.lastSeen,
                    friendDetails: {
                      email: detailRaw?.data()?.email,
                      name: detailRaw?.data()?.name,
                      photoURL: detailRaw?.data()?.photoURL,
                      loginDate: detailRaw?.data()?.loginDate,
                      lastSeen: detailRaw?.data()?.lastSeen,
                    },
                    people: item?.data()?.people,
                  });

                  // Adding the Friend List inside the main Array after array ended means last length of the array
                  if (index === raw?.docs?.length - 1) {
                    allDataCompressed.push({ friendList: rawFriendList });
                    // console.log('allDataCompressed', allDataCompressed) //::> Debug

                    //  ::: API SENDING ↓
                    // res.setHeader(
                    //   "Cache-Control",
                    //   "public, s-maxage=1, stale-while-revalidate"
                    // );
                    res.status(200).send(allDataCompressed); // ::::> finally sending the data!
                  }
                });
                //
              });
              //
            });
          } else {
            res.status(404).send({
              access: "Denied",
              message: "User not registered with us please invite them to join",
            });
          }
        })
        .catch((err) => {
          res.status(404).send({
            access: "Denied",
            message: `Something went wrong ${err}`,
          });
        });
    } catch (err) {
      res.status(404).send({
        access: "Denied",
        message: `Something went wrong ${err}`,
      });
    }
  }
}
/**
 * Written by Rishu Chowdhary
 */
