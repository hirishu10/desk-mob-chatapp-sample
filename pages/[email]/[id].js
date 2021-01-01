import Head from "next/head";
import { auth, dbAuth, provider } from "../../firebase";
import * as firestore from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import ChatList from "../../components/ChatList";
import idStyle from "../../styles/Email/ID.module.scss";
import EachMessages from "../../components/EachMessages";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, IconButton, Button } from "@mui/material";
//
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
//
import React, { useRef, useState, useEffect } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import * as EmailValidator from "email-validator";
import { useRouter } from "next/router";
import SentimentSatisfiedAltSharpIcon from "@mui/icons-material/SentimentSatisfiedAltSharp";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import { v4 as uuidv4 } from "uuid";
import {
  getCustomDayNameFull,
  getCustomMonthNameShort,
  getCustomDate,
  getCustomHour,
  getCustomMinute,
  getCustomAmPm,
} from "@hirishu10/simple-date-time";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import style from "../../styles/Components/ChatScreen.module.scss";
import sStyle from "../../styles/Components/Sidebar.module.scss";
import { setIsDarkMode } from "../../redux/actions/index";
import { convertCookieData } from "../../utils/convertCookieData.ts";

import $ from "jquery";
import "animate.css";
//
import "emoji-mart-next/css/emoji-mart.css";
import { Picker } from "emoji-mart-next";
//
import axios from "axios";

function Chats({ getAllList, getAllChats }) {
  const dispatch = useDispatch();
  const { email, isDarkMode } = useSelector((state) => state?.actionCombined);
  const [user, loading] = useAuthState(auth);
  const uuid = uuidv4(); // uuid for all chats
  const router = useRouter();

  // Some stuff for presentation
  const autoScrollToBottom = useRef(null);

  /**
   * ______________________________________________________________________________________________________________________________
   * __________________________________________ SOME USEFULL STATE ________________________________________________________________
   * ______________________________________________________________________________________________________________________________
   */
  // Some Config for sending in the database
  const [inputData, setInputData] = useState(""); // Store the input by the user
  const timesTamp = `${getCustomDate()} ${getCustomMonthNameShort()} ${getCustomHour()}:${getCustomMinute()}${getCustomAmPm(
    true
  )} (${getCustomDayNameFull()})`;

  const d = new Date();
  const year = d.getFullYear();
  let currDataForFetching = `${getCustomDate()}${getCustomMonthNameShort()}${year}`;
  // Above is the date config
  // ********* FOR SIDEBAR ***************
  const [flagForUpdating, setFlagForUpdating] = useState(false);
  const [threeDotIconClicked, setthreeDotIconClicked] = useState(false);
  // ********* FOR SIDEBAR ***************
  //
  // :::::::>
  // Some state to handle the information
  const [getAllChat, setAllChat] = useState([]); // For storing the all sidebar details
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // for Emoji Picker Library
  const [displayingChat, setDisplayingChat] = useState([]); // backup message not usefull optional
  const [displayingEachMessage, setDisplayingEachMessage] = useState([]); // Store all the message
  const [refreshingDataFlagForAPI, setRefreshingDataFlagForAPI] =
    useState(false);
  // Store flag for refreshing the API's
  const [flag, setFlag] = useState(false); // Flag for usefull time
  const [getSoundReceiveFlag, setSoundReceiveFlag] = useState(true); // For playing sound notification
  const [photoFlag, setPhotoFlag] = useState(false); // Helps to fetched the photoURL
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

  // ********************************************************************************************************

  // :::: Chats Details
  const rootCollectionForChats = firestore.collection(dbAuth, "chats"); // This is very important don't delete this
  let decodedURL = decodeURIComponent(`${router?.query?.id}`);
  const chatIdDocument = firestore.doc(rootCollectionForChats, decodedURL);

  const gt = firestore.getDoc(chatIdDocument); // This will fetched the refresh flag value
  // ______________________________________________________________________________________________________________________________

  // Flag for refreshing the chats!
  if (flag) {
    gt?.then((raw) => {
      // console.log("raw?.data() :>> ", raw?.data());//::> Debug
      // setRefreshingDataFlagForAPI(raw?.data()?.flagForAPI); //:::> Debug
      // need to be check below
      if (raw?.data()?.userOne?.name === user?.email) {
        if (raw?.data()?.userOne?.flag) {
          setRefreshingDataFlagForAPI(true);
        } else {
          setRefreshingDataFlagForAPI(false);
        }
      } else {
        if (raw?.data()?.userTwo?.flag) {
          setRefreshingDataFlagForAPI(true);
        } else {
          setRefreshingDataFlagForAPI(false);
        }
      }
      setTimeout(() => {
        setFlag(false);
      }, 2000);
    });
  }
  // }
  // ********************************************************************************************************
  const autoScrollToEnd = () => {
    autoScrollToBottom?.current?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  };

  let receivedMessageCount = 0;
  const refreshTheData = async () => {
    let alertFlag = true;
    try {
      const res = await fetch(
        `${process?.env?.API_URL}/twoDaysChats?id=${router?.query?.id}&q=${router?.query?.q}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      // console.log("data :>> ", data);//::>Debug
      setDisplayingChat(data?.data);

      // // ::::::::::::::::: SIDEBAR
      if (data?.data?.length > displayingEachMessage?.length) {
        receivedMessageCount < 1
          ? setSoundReceiveFlag(true)
          : setSoundReceiveFlag(false);
        if (getSoundReceiveFlag) {
          // ::::::::::: After receiveing message we play some sound! :::::::::::::::::::::::::::
          const chatReceiveAudio = document.createElement("audio");
          chatReceiveAudio.setAttribute("type", "audio/mp3");
          chatReceiveAudio.src = "/chatreceive.mp3";
          document.body.appendChild(chatReceiveAudio);

          const chatReceiveAudioPlayPromise = chatReceiveAudio.play();
          if (chatReceiveAudioPlayPromise !== undefined) {
            chatReceiveAudioPlayPromise
              .then((p) => {
                console.log("chat received sound test passed :>> ");
                // ::> Then after playing the sound we removing the same child from the body
                // ::> as well as the remove the element
                setTimeout(() => {
                  // chatReceiveAudio.pause();
                  document.body.removeChild(chatReceiveAudio);
                  chatReceiveAudio.remove();
                }, 2000);
                // :::::>
                setDisplayingEachMessage(data?.data); // new added for test
                console.log(
                  "displayingChatInsideTheRefreshFunction :>> ",
                  displayingChat
                );
                // :::::>
                setSoundReceiveFlag(false);
                receivedMessageCount++;
                autoScrollToEnd();
              })
              .catch((err) => {
                console.log(
                  "chat received sound test failed due to err :>> ",
                  err
                );
              });
          }
        }
        // :::::::::::::::::::: Above is sound :::::::::::::::::::::::::::
      }
      firestore.setDoc(
        chatIdDocument,
        {
          userOne: {
            name: user?.email,
            flag: false,
          },
          userTwo: {
            name: getAllChats?.chatUserData?.email,
            flag: false,
          },
        },
        { merge: true }
      );
      // :::::::::::::::::::::::::::
    } catch (error) {
      console.log("Something went wrong", error);
      if (alertFlag) {
        alert("Error! \nPlease check your internet connection and try again");
        alertFlag = false;
      }
    }
  };

  /**
   * ************************************ SIDEBAR FUNCTION'S ************************************************
   */

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
                // Flag for Sidebar Title
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
      (friend) => friend?.id === receipentEmail
    );
  };

  //::> Return if the user registered with us or not
  const userIsRegisteredWithUs = (receipentEmail) => {
    return !!usersChatSnapshot?.docs?.find(
      (user) => user?.id === receipentEmail
    );
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
    // console.log("this tap id:>> ");//::> Debug
    setDisplayingEachMessage([]);
    router.push(
      `/${encodedURLForUserEmail}/${encodedURLForId}?q=${encodedURLForQ}`
    );
  };

  /**
   * ************************************ SIDEBAR FUNCTION'S ************************************************
   */
  /**
   * ********************************************************************************************************
   */
  const sendTheChatInTheChatDatabase = (e) => {
    e.preventDefault();
    if (
      inputData !== "" &&
      inputData !== " " &&
      inputData !== "  " &&
      inputData !== "   " &&
      inputData !== "    "
    ) {
      // Add Data inside the database
      // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::>
      // :::::::::::::::::::::::::::: Very Important below please don't edit whithout comment :::::::::::::::>
      /**
       * chats -> this is collection
       *    id(which is generated already) -> this is chat id which is document of the above collection
       *       allchats -> collection of the above
       *          todayDocument -> each document of the all chats container
       *          timestamp -> doc for filter    eachChats -> collection for to insert each message inside the each document container
       */
      try {
        // chats collection
        const rootCollection = firestore.collection(dbAuth, "chats");
        // chatId document
        const chatIdDocument = firestore.doc(
          rootCollection,
          getAllChats?.chatId
        );
        // :::::::::::::::::::::::::::

        firestore.setDoc(
          chatIdDocument,
          {
            userOne: {
              name: user?.email,
              flag: false,
            },
            userTwo: {
              name: getAllChats?.chatUserData?.email,
              flag: true,
            },
          },
          { merge: true }
        );
        // collection of the chat (allChats)
        const chatIdDocumentCollection = firestore.collection(
          chatIdDocument,
          "allchats"
        );
        // each day document
        const eachDayDocument = firestore.doc(
          chatIdDocumentCollection,
          currDataForFetching
        );
        // setting the timestamp for the each day document

        firestore.setDoc(
          eachDayDocument,
          {
            timesTamp: firestore.serverTimestamp(),
          },
          { merge: true }
        );

        // each chats stored in the each day collection
        const eachDayDocumentCollection = firestore.collection(
          eachDayDocument,
          "eachChats"
        );
        // adding the chat inside the database
        firestore.addDoc(eachDayDocumentCollection, {
          uuid: uuid,
          message: inputData,
          id: user?.email,
          name: user?.displayName,
          photoURL: user?.photoURL,
          date: firestore.serverTimestamp(),
          timesTamp: timesTamp,
        });
        // :::::::::::::::::::::::::::: Very Important above please don't edit whithout comment :::::::::::::::>
        // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::>
        //
        //
        let letMeCheck = displayingEachMessage.map((item, index) => item);
        letMeCheck.push({
          uuid: uuid,
          message: inputData,
          id: user?.email,
          name: user?.displayName,
          photoURL: user?.photoURL,
          date: firestore.serverTimestamp(),
          timesTamp: timesTamp,
        });

        setDisplayingChat(letMeCheck);
        setDisplayingEachMessage(letMeCheck);

        console.log("displayingChatInsideTheSendFunction :>> ", displayingChat);
        // console.log("arryaOfChats inside the send Button :>> ", arryaOfChats);//::> Debug
        // ::::::::::: After sending message we play some sound! :::::::::::::::::::::::::::
        const chatSendAudio = document.createElement("audio");
        chatSendAudio.setAttribute("type", "audio/mp3");
        chatSendAudio.src = "/chatsound.mp3";
        document.body.appendChild(chatSendAudio);

        const chatSendAudioPlayPromise = chatSendAudio.play();
        if (chatSendAudioPlayPromise !== undefined) {
          chatSendAudioPlayPromise
            .then((p) => {
              // console.log("chat sending sound test passed :>> ");//::> Debug
              // ::> Then after playing the sound we removing the same child from the body
              // ::> as well as the remove the element
              setTimeout(() => {
                document.body.removeChild(chatSendAudio);
                chatSendAudio.remove();
              }, 1500);
            })
            .catch((err) => {
              console.log(
                "chat sending sound test failed due to err :>> ",
                err
              );
            });
        }
        // :::::::::::::::::::: Above is sound :::::::::::::::::::::::::::
        //
        setInputData("");
        setShowEmojiPicker(false);
        autoScrollToEnd();
      } catch (error) {
        console.log("error :>> ", error);
      }
    }
  };

  const findTheDetailsOfCurrentChat = {
    id: getAllChats?.chatUserData?.email,
    chatId: getAllChats?.chatId,
    name: getAllChats?.chatUserData?.name,
    photoURL: getAllChats?.chatUserData?.photoURL,
    loginDate: getAllChats?.chatUserData?.loginDate,
  };

  /**
   * ********************************************************************************************************
   */

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

  if (refreshingDataFlagForAPI) {
    refreshTheData();
  }
  setTimeout(() => {
    setFlag(true);
  }, 2000);

  const iconColorConfig = {
    color: isDarkMode ? "white" : "#072130",
    bColor: isDarkMode ? "black" : "white",
    bColorForOptions: isDarkMode ? "#0c1118" : "white",

    //
    chatBack: isDarkMode ? "#0c1118" : "white",
    chatCol: isDarkMode ? "#c8d1da" : "#072130",
    borderColor: isDarkMode ? "#333943" : "whitesmoke",
  };

  useEffect(() => {
    setDisplayingEachMessage(getAllChats?.data);
    sidebarListRefreshed();
    axios
      .get(findTheDetailsOfCurrentChat?.photoURL)
      .then((r) => {
        setTimeout(() => {
          r.status === 200 ? setPhotoFlag(true) : setPhotoFlag(false);
        }, 200);
      })
      .catch((err) => {
        console.log("Something went wrong ", err);
      });

    autoScrollToEnd();
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
  }, [isDarkMode, router, flagForUpdating]);

  //
  return (
    <div className={idStyle.container}>
      <Head>
        <title>{`${router?.query?.id} - Chat`}</title>
        <meta name="Chat Screen" content="Chat Screen" />
        <link rel="icon" href="/rishufavicon.ico" />
      </Head>
      <div
        className={idStyle.sidebarContainer}
        style={{
          backgroundColor: iconColorConfig?.bColorForOptions,
          borderRightColor: iconColorConfig.borderColor,
        }}
      >
        {/* *********************************** SIDEBAR CONTAINER ********************************* */}
        {/* ************************************************************************************ */}
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
                      style={{ width: "100%" }}
                      key={index}
                    >
                      <button
                        onClick={item?.onClick}
                        style={{
                          width: "100%",
                          border: "none",
                          padding: "10px 0px 10px 0px",
                          backgroundColor: isDarkMode
                            ? "#18202c"
                            : "whitesmoke",
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
              borderBottomColor: iconColorConfig.borderColor,
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
            getAllChat[1]?.friendList?.map((item, index) => (
              <ChatList
                key={index}
                id={item?.documentId}
                chatId={item?.chatId}
                name={item?.friendDetails?.name}
                photoURL={item?.friendDetails?.photoURL}
                lastSeen={item?.friendDetails?.loginDate}
                visitChatPage={(e) => {
                  e.preventDefault();
                  setDisplayingEachMessage([]);
                  goToNextRoute(item?.documentId, item?.chatId);
                }}
                deleteButton={(e) => {
                  e.preventDefault();
                  chatDeleted(item?.documentId);
                }}
              />
            ))
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
            <IconButton
              className={sStyle.roundButtonInside}
              onClick={createChat}
            >
              <AddIcon htmlColor={"white"} />
            </IconButton>
          </div>
        </div>
        {/* *********************************** SIDEBAR CONTAINER ********************************* */}
        {/* ************************************************************************************ */}
      </div>
      <div className={idStyle.chatContainer}>
        {/* *********************************** CHAT CONTAINER ********************************* */}
        {/* ************************************************************************************ */}
        <div className={style.container}>
          {/* Head */}
          <div
            className={style.header}
            style={{
              backgroundColor: iconColorConfig.chatBack,
              color: iconColorConfig.chatCol,
              borderBottomColor: iconColorConfig.borderColor,
            }}
          >
            <div>
              <IconButton
                onClick={(e) => {
                  router.back();
                }}
              >
                <ArrowBackIcon htmlColor={iconColorConfig?.color} />
              </IconButton>
            </div>
            <Avatar
              className={style.userAvatar}
              sx={{ width: 40, height: 40, marginLeft: "5px" }}
              src={
                photoFlag
                  ? findTheDetailsOfCurrentChat?.photoURL
                  : "https://raw.githubusercontent.com/hirishu10/my-assets/main/react-login-ui/profile.png"
              }
            />
            <div className={style.headerInformation}>
              <h6>{`${findTheDetailsOfCurrentChat?.name}`}</h6>
              <p>{`Last active: ${
                findTheDetailsOfCurrentChat?.loginDate
                  ? findTheDetailsOfCurrentChat?.loginDate
                  : "Unavailable"
              }`}</p>
            </div>
            <div className={style.headerIcons}>
              <IconButton>
                <AttachFileIcon htmlColor={iconColorConfig?.color} />
              </IconButton>
              <IconButton
                onClick={() => {
                  router.replace(`/${user?.email}`);
                }}
              >
                <MoreVertIcon htmlColor={iconColorConfig?.color} />
              </IconButton>
            </div>
          </div>
          {/* Body */}
          <div
            className={style.chatContainer}
            style={{
              backgroundColor: iconColorConfig.chatBack,
              color: iconColorConfig.chatCol,
            }}
          >
            {/* Test */}
            <div
              className={style.chatDisplay}
              onClick={(e) => {
                e.preventDefault();
                setShowEmojiPicker(false);
              }}
            >
              {displayingEachMessage?.length > 0
                ? displayingEachMessage?.map((item, index) => (
                    <EachMessages
                      key={index}
                      id={item?.id}
                      message={item?.message}
                      photoURL={item?.photoURL}
                      uniqueKey={item?.uuid}
                      timesTamp={item?.timesTamp}
                    />
                  ))
                : getAllChats?.data?.map((item, index) => (
                    <EachMessages
                      key={index}
                      id={item?.id}
                      message={item?.message}
                      photoURL={item?.photoURL}
                      uniqueKey={item?.uuid}
                      timesTamp={item?.timesTamp}
                    />
                  ))}
              <div className={style.endAutoScrolls}></div>
              <div
                ref={autoScrollToBottom}
                className={style.endAutoScroll}
              ></div>
            </div>
            {showEmojiPicker ? (
              <div className={style.emojiPickerParent}>
                <div className={style.emojiPickerChildContainer}>
                  {/* Emoji Picker */}
                  {/* ****************************************** */}
                  <Picker
                    id={"emojiPicker"}
                    set="apple"
                    onSelect={(e) => {
                      // console.log("e", e.native); //:::> Debug
                      setInputData(`${inputData} ${e?.native}`);
                    }}
                    showPreview={false}
                    darkMode={isDarkMode}
                  />
                  {/* )} */}
                  {/* ****************************************** */}
                  {/* Emoji Picker */}
                </div>
              </div>
            ) : null}
            {/* Test */}
          </div>
          {/* Bottom */}
          <div
            className={style.footer}
            style={{
              backgroundColor: iconColorConfig.chatBack,
              color: iconColorConfig.chatCol,
              borderTopColor: iconColorConfig.borderColor,
            }}
          >
            <div className={style.footerIcons}>
              <IconButton
                id="smileButton"
                onClick={(e) => {
                  e.preventDefault();
                  $("#smileButton").addClass(
                    "animate__animated animate__bounceIn"
                  );
                  setShowEmojiPicker(!showEmojiPicker);

                  setTimeout(() => {
                    $("#smileButton").removeClass(
                      "animate__animated animate__bounceIn"
                    );
                  }, 200);
                }}
              >
                <SentimentSatisfiedAltSharpIcon
                  sx={{ width: 25, height: 25 }}
                  htmlColor={iconColorConfig?.color}
                />
              </IconButton>
              <IconButton>
                <AttachFileIcon
                  sx={{ width: 25, height: 25 }}
                  htmlColor={iconColorConfig?.color}
                />
              </IconButton>
            </div>
            <form
              className={style.inputContainer}
              onSubmit={sendTheChatInTheChatDatabase}
            >
              <input
                className={style.input}
                placeholder="Type a message"
                value={inputData}
                onChange={(e) => {
                  e.preventDefault();
                  setInputData(e.target.value);
                }}
              />
            </form>
            {inputData ? (
              <IconButton onClick={sendTheChatInTheChatDatabase}>
                <SendIcon
                  sx={{ width: 25, height: 25 }}
                  htmlColor={iconColorConfig?.color}
                />
              </IconButton>
            ) : (
              <IconButton>
                <MicIcon
                  sx={{ width: 25, height: 25 }}
                  htmlColor={iconColorConfig?.color}
                />
              </IconButton>
            )}
          </div>
        </div>
        {/* *********************************** CHAT CONTAINER ********************************* */}
        {/* ************************************************************************************ */}
        {/*  */}
      </div>
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps(context) {
  let f = true;
  try {
    // const decodedURLForEmail = decodeURIComponent(context?.query?.email);//::> Debug
    const decodedURLForId = decodeURIComponent(context?.query?.id);
    const decodedURLForQ = decodeURIComponent(context?.query?.q);

    const res = await fetch(
      `${process?.env?.API_URL}/twoDaysChats?id=${decodedURLForId}&q=${decodedURLForQ}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();

    return {
      props: {
        getAllChats: data,
      },
    };
  } catch (error) {
    console.log("Something went wrong", error);
    if (f) {
      alert("Error! \nPlease check your internet connection and try again");
      f = false;
    }
  }
}

export default Chats;
