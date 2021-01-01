import { Avatar, IconButton, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChatIcon from "@mui/icons-material/Chat";
import SearchIcon from "@mui/icons-material/Search";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AddIcon from "@mui/icons-material/Add";

import * as EmailValidator from "email-validator";
import { auth, dbAuth, provider } from "../firebase";
import * as firestore from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { useEffect, useState } from "react";
import ChatList from "./ChatList";
import { useRouter } from "next/router";
import {
  getCustomMonthNameShort,
  getCustomDate,
  getCustomFullDateAndTimeWithAmPmIncludingSeconds,
} from "@hirishu10/simple-date-time";
import { useSelector, useDispatch } from "react-redux";
import { setIsDarkMode } from "../redux/actions/index";
import { convertCookieData } from "../utils/convertCookieData.ts";
import sStyle from "../styles/Components/Sidebar.module.scss";

import $ from "jquery";
import "animate.css";

function Sidebar({ friendList }) {
  const dispatch = useDispatch();
  const { email, isDarkMode } = useSelector((state) => state.actionCombined);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  // :::::::>
  // Some state to handle the information
  const [flagForUpdating, setFlagForUpdating] = useState(false);
  const [getClockValue, setClockValue] = useState("Date-Time");
  const [threeDotIconClicked, setthreeDotIconClicked] = useState(false);
  const [getAllChat, setAllChat] = useState([]); // For storing the all sidebar details
  // :::::::>
  /**
   * ______________________________________________________________________________________________________________________________
   * __________________________________________ DATABASE CONFIG ___________________________________________________________________
   * ______________________________________________________________________________________________________________________________
   */
  // Below important please don't delete
  //   :::: Users List
  const mainCollection = firestore.collection(dbAuth, "users");
  const mainDocument = firestore.doc(mainCollection, `${router?.query?.email}`);
  //   :::: Friend List
  const childCollection = firestore.collection(mainDocument, "freindList");
  const queryDocument = firestore.query(childCollection);

  // Using firebase hooks we pull the data from the database!
  const [usersChatSnapshot] = useCollection(mainCollection); // Usefull for to verified condition below to create chats
  const [chatExistingSnapshot] = useCollection(queryDocument); // Usefull for to verified condition below to create chats

  // ______________________________________________________________________________________________________________________________

  //::> Chat created after the some condition passed!
  const createChat = () => {
    try {
      let getChatID = "";
      const input = prompt("Please enter the email address to chat with");

      if (!input) return null; //::> If input box empty return null

      if (
        EmailValidator.validate(input) &&
        !chatExistAlready(input) &&
        userIsRegisteredWithUs(input) &&
        input !== user.email
      ) {
        try {
          //
          const CHAT_ID = `${user?.email}${input}`;
          //chat id for both parties
          const oppDocument = firestore.doc(mainCollection, input);
          const oppCollection = firestore.collection(oppDocument, "freindList");
          const oppChildDocument = firestore.doc(oppCollection, user?.email);
          firestore?.onSnapshot(oppChildDocument, {
            next: (r) => {
              // console.log("r?.data()?.chatId", r?.data()); //:::> Debug
              getChatID = r?.data()?.chatId ? r?.data()?.chatId : CHAT_ID;
              // console.log("getChatID", getChatID); //:::> Debug
            },
            error: (err) => {
              console.log("err :>> ", err);
            },
          });

          setTimeout(() => {
            // console.log("getChatID after 500", getChatID); //:::> Debug
            // push the email in the chat database
            const childCollection = firestore.collection(
              mainDocument,
              "freindList"
            );
            const childDocument = firestore.doc(childCollection, input);
            firestore.setDoc(
              childDocument,
              {
                chatId: getChatID,
                lastSeen: firestore.serverTimestamp(),
                people: [input, user?.email],
              },
              { merge: true }
            );

            //**** Opposition Database
            // friend have the same chat details
            // push the email in the chat database
            //
            firestore
              .setDoc(
                oppChildDocument,
                {
                  chatId: getChatID,
                  lastSeen: firestore.serverTimestamp(),
                  people: [user?.email, input],
                },
                { merge: true }
              )
              .then((r) => {
                // Flag for Sidebar title
                setFlagForUpdating(true);
                setTimeout(() => {
                  setFlagForUpdating(false);
                }, 2500);
              })
              .catch((err) => {
                alert("Something went wrong!");
              });

            //
            const d = new Date();
            const year = d.getFullYear();
            let currDate = `${getCustomDate()}${getCustomMonthNameShort()}${year}`;
            // ::::> we need to create chat container after connecting the friends for the first message
            const chatCollectionForChats = firestore.collection(
              dbAuth,
              "chats"
            );
            const chatIdDocumentForChats = firestore.doc(
              chatCollectionForChats,
              getChatID
            );
            //
            firestore.setDoc(
              chatIdDocumentForChats,
              {
                userOne: {
                  name: user?.email,
                  flag: false,
                },
                userTwo: {
                  name: input,
                  flag: false,
                },
              },
              { merge: true }
            );
            // :::::::::::::::::::::::::::
            // collection of the chat (allChats)
            const chatIdDocumentForChatsCollection = firestore.collection(
              chatIdDocumentForChats,
              "allchats"
            );
            // each day document
            const eachDayDocument = firestore.doc(
              chatIdDocumentForChatsCollection,
              currDate
            );
            // setting the timestamp for the each day document
            firestore.setDoc(
              eachDayDocument,
              {
                timesTamp: firestore.serverTimestamp(),
              },
              { merge: true }
            );
            // :::::::::::::::::::::::::::
          }, 1500);
        } catch (error) {
          alert("Something went wrong" + error);
          console.log("Somethin went wrong ", error);
        }
      } else if (input === user?.email) {
        alert("You can't aad your email id");
      } else if (chatExistAlready(input)) {
        alert("Chat is already added in the dashboard");
      } else {
        alert(
          "User not registered with us yet please invite them to join or please type valid email ID"
        );
      }
    } catch (error) {
      alert("Something went wrong" + error);
      console.log("Somethin went wrong ", error);
    }
  };

  //::> return if the friend is present in the dashboard or not
  const chatExistAlready = (receipentEmail) => {
    return !!chatExistingSnapshot?.docs.find(
      (friend) => friend.id === receipentEmail
    );
  };

  //::> Return if the user registered with us or not
  const userIsRegisteredWithUs = (receipentEmail) => {
    return !!usersChatSnapshot?.docs.find((user) => user.id === receipentEmail);
  };

  //::> Logout the Current User
  const signOutCurrentUser = () => {
    try {
      const message = prompt(
        "Are you sure want to logout \nPlease type YES for Logout",
        "Yes"
      );
      if (message?.toLowerCase() === "yes") {
        auth
          .signOut()
          .then((ok) => {
            router.replace("/");
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        alert("Ok you are not logout yet keep exploring :)");
      }
    } catch (error) {
      alert("Something went wrong!");
      console.log("Something went Wrong", error);
    }
  };

  //:: This is only for homepage bigger size not for mobile devices!
  const runClock = () => {
    const n = getCustomFullDateAndTimeWithAmPmIncludingSeconds(true);
    setClockValue(n);
  };

  const darkModeEnabled = (e) => {
    e.preventDefault();
    dispatch(setIsDarkMode(!isDarkMode));
    //
    // Just Optional for adding expire in the cookies
    //********************************** */
    const d = new Date();
    d.setTime(d.getTime() + 2 * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    // [Optional]:: ==> Debug ::::::::::::::::::::::::::::::::
    //********* Adding Cookies ********** */
    document.cookie = `isDarkMode=${!isDarkMode}; expires=${expires}; path=/;`;
    //********************************** */
  };

  //::> All the Option of Three Dots section
  const settingsOption = [
    // Later we will implement
    {
      title: "Invite",
      onClick: (e) => {
        e.preventDefault();
      },
    },
    {
      title: "FAQ?",
      onClick: (e) => {
        router.push("/faq");
      },
    },
    /**
     * Test Page only for developers!
     */
    // {
    //   title: "Test Page",
    //   onClick: (e) => {
    //     e.preventDefault();
    //     router.push("/test");
    //   },
    // },
    {
      title: "Setting",
      onClick: (e) => {
        e.preventDefault();
        router.push("/setting");
      },
    },
    {
      title: "Logout",
      onClick: (e) => {
        e.preventDefault();
        signOutCurrentUser();
      },
    },
  ];

  const chatDeleted = (id) => {
    //:: Deleting the chat inside the database
    try {
      const rootCollection = firestore.collection(dbAuth, "users");
      const rootOwner = firestore.doc(rootCollection, user?.email);
      const childCollection = firestore.collection(rootOwner, "freindList");
      const childDocument = firestore.doc(childCollection, id);
      //setting the refrehing title
      firestore
        .deleteDoc(childDocument)
        .then((r) => {
          // console.log("r :>> ", r);//::> Debug
          // Flag
          setFlagForUpdating(true);
          router.replace(`/${user?.email}`); //back to homepage
          setTimeout(() => {
            setFlagForUpdating(false);
          }, 2500);
        })
        .catch((err) => {
          alert("Something went wrong!");
          console.log("err :>> ", err);
        });
    } catch (error) {
      alert("Something went wrong!");
      console.log("err :>> ", err);
    }
  };

  const goToNextRoute = (id, chatId) => {
    const encodedURLForUserEmail = encodeURIComponent(router?.query?.email);
    const encodedURLForId = encodeURIComponent(chatId);
    const encodedURLForQ = encodeURIComponent(id);
    // console.log("this tap email:>> ");//::> Debug
    router.push(
      `/${encodedURLForUserEmail}/${encodedURLForId}?q=${encodedURLForQ}`
    );
  };

  const showAllTheFriendList = () => {
    if (getAllChat.length > 0) {
      return getAllChat[1]?.friendList?.map((item, index) => (
        <ChatList
          key={index}
          id={item?.documentId}
          chatId={item?.chatId}
          name={item?.friendDetails?.name}
          photoURL={item?.friendDetails?.photoURL}
          lastSeen={item?.friendDetails?.loginDate}
          visitChatPage={(e) => {
            e.preventDefault();
            goToNextRoute(item?.documentId, item?.chatId);
          }}
          deleteButton={(e) => {
            e.preventDefault();
            chatDeleted(item?.documentId);
          }}
        />
      ));
    } else {
      return friendList[1]?.friendList?.map((item, index) => (
        <ChatList
          key={index}
          id={item?.documentId}
          chatId={item?.chatId}
          name={item?.friendDetails?.name}
          photoURL={item?.friendDetails?.photoURL}
          lastSeen={item?.friendDetails?.loginDate}
          visitChatPage={(e) => {
            e.preventDefault();
            goToNextRoute(item?.documentId, item?.chatId);
          }}
          deleteButton={(e) => {
            e.preventDefault();
            chatDeleted(item?.documentId);
          }}
        />
      ));
    }
  };

  const sidebarListRefreshed = async () => {
    // ::::::::::::::::: SIDEBAR
    const sidebarFetching = await fetch(
      `${process?.env?.API_URL}/userData?id=${router?.query?.email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const sidebarData = await sidebarFetching.json();
    setAllChat(sidebarData);
    // console.log("sidebarData :>> ", sidebarData);//::> Debug
    // console.log("getAllChat :>> ", getAllChat);//::> Debug
    // ::::::::::::::::: SIDEBAR
  };

  const iconColorConfig = {
    color: isDarkMode ? "white" : "#072130",
    bColor: isDarkMode ? "black" : "white",
    bColorForOptions: isDarkMode ? "#0c1118" : "white",

    borderColor: isDarkMode ? "#333943" : "whitesmoke",
  };

  useEffect(() => {
    sidebarListRefreshed();
    showAllTheFriendList();
    //
    $("#server").addClass(
      "animate__animated animate__rotateIn animate__slower animate__infinite"
    );
    try {
      const documentCookies = document.cookie;
      const cookie = convertCookieData(documentCookies);
      cookie?.map((item, index) => {
        if (item?.key === "isDarkMode" || item?.key === " isDarkMode") {
          if (item?.value === "true") {
            dispatch(setIsDarkMode(true));
          } else {
            dispatch(setIsDarkMode(false));
          }
        }
      });
    } catch (error) {
      alert("Something went wrong! Please check the connection and try again.");
    }
    //********************************** */

    setInterval(() => {
      runClock();
    }, 1000);
    //return the function which help to set state the normal when page not rendered!
    return () => {
      setClockValue("Date-Time");
    };
  }, [isDarkMode, flagForUpdating]);

  return (
    <div className={sStyle.container}>
      <div
        className={sStyle.header}
        style={{
          backgroundColor: iconColorConfig?.bColorForOptions,
          borderBottomColor: iconColorConfig.borderColor,
        }}
      >
        <span
          className={sStyle.userAvatar}
          style={{
            color: iconColorConfig?.color,
          }}
          onClick={(e) => {
            e.preventDefault();
            router.push("/from");
          }}
        >
          Desk-Mob ChatApp
        </span>
        <div className={sStyle.iconContainer}>
          <IconButton onClick={darkModeEnabled}>
            {isDarkMode ? (
              <DarkModeIcon htmlColor={iconColorConfig?.color} />
            ) : (
              <LightModeIcon htmlColor={iconColorConfig?.color} />
            )}
          </IconButton>
          <IconButton>
            <ChatIcon htmlColor={iconColorConfig?.color} />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              setthreeDotIconClicked(true);
            }}
          >
            <MoreVertIcon htmlColor={iconColorConfig?.color} />
          </IconButton>
        </div>
        {threeDotIconClicked ? (
          <>
            <div
              className={sStyle.optionContainer}
              onClick={(e) => {
                e.preventDefault();
                setthreeDotIconClicked(false);
              }}
            ></div>
            <div
              style={{
                width: "150px",
                float: "right",
                position: "absolute",
                top: 10,
                right: 0,
                boxShadow: isDarkMode
                  ? "0px 0px 5px 0px #0c1118"
                  : "0px 0px 5px 0px #b9b9b9",
              }}
            >
              {settingsOption?.map((item, index) => (
                <div
                  className={sStyle.optionSelect}
                  style={{
                    width: "100%",
                  }}
                  key={index}
                >
                  <button
                    onClick={item?.onClick}
                    style={{
                      width: "100%",
                      border: "none",
                      padding: "10px 0px 10px 0px",
                      backgroundColor: isDarkMode ? "#18202c" : "whitesmoke",
                      color: iconColorConfig?.color,
                    }}
                    onMouseEnter={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.backgroundColor = isDarkMode
                        ? "#202d41"
                        : "#ebebeb";
                    }}
                    onMouseLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.backgroundColor = isDarkMode
                        ? "#18202c"
                        : "whitesmoke";
                    }}
                  >
                    {item?.title}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
      {/*  */}
      <div
        className={sStyle.search}
        style={{
          backgroundColor: iconColorConfig?.bColorForOptions,
          borderBottomColor: isDarkMode ? "#333943" : "whitesmoke",
        }}
      >
        <SearchIcon htmlColor={iconColorConfig?.color} />
        <input
          className={sStyle.searchInput}
          placeholder="Serch or start new chat"
          style={{
            backgroundColor: isDarkMode ? "#333943" : "#e8ebef",
            color: iconColorConfig?.color,
          }}
        />
      </div>
      <Button
        id={sStyle.sidebarButton}
        className={sStyle.sidebarButton}
        variant="text"
        color="success"
        style={{
          borderBottom: "1px solid",
          borderBottomColor: iconColorConfig.borderColor,
        }}
        onClick={createChat}
      >
        Start a new chat
      </Button>
      {/* List of Chats */}
      {!flagForUpdating ? (
        showAllTheFriendList()
      ) : (
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "system-ui,sans-serif",
            color: iconColorConfig?.color,
          }}
        >
          👨🏻‍💻 Refreshing data from the server ⚡️
          <span
            id={"server"}
            style={{
              marginLeft: 10,
            }}
          >
            💿
          </span>
        </div>
      )}
      <div
        className={sStyle.roundButton}
        style={{
          backgroundColor: isDarkMode ? "#34465D" : "#0c1118",
        }}
      >
        <IconButton className={sStyle.roundButtonInside} onClick={createChat}>
          <AddIcon htmlColor={"white"} />
        </IconButton>
      </div>
    </div>
  );
}
export default Sidebar;
