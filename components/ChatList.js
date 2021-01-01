import React, { useState } from "react";
import { Avatar, IconButton, Button } from "@mui/material";
import { auth, dbAuth, provider } from "../firebase";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import style from "../styles/Components/ChatList.module.scss";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

function ChatList({
  id,
  mainCollection,
  name,
  photoURL,
  chatId,
  lastSeen,
  visitChatPage,
  deleteButton,
}) {
  const dispatch = useDispatch();
  const { email, isDarkMode } = useSelector((state) => state?.actionCombined);

  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [photoFlag, setPhotoFlag] = useState(false);

  const [deleteFlag, setDeleteFlag] = useState(false);

  // only for testing
  const testingFunction = () => {
    const encodedURLForUserEmail = encodeURIComponent(router?.query?.email);
    const encodedURLForId = encodeURIComponent(chatId);
    const encodedURLForQ = encodeURIComponent(id);
    // console.log("arryaOfChats inside chat list next page :>> ", arryaOfChats);//::> Debug
    router.push(
      `/${encodedURLForUserEmail}/${encodedURLForId}?q=${encodedURLForQ}`
    );
  };

  const iconColorConfig = {
    color: isDarkMode ? "white" : "#072130",
    bColor: isDarkMode ? "black" : "white",
    bColorForOptions: isDarkMode ? "#0c1118" : "white",
  };

  useEffect(() => {
    axios
      .get(photoURL)
      .then((r) => {
        setTimeout(() => {
          r.status === 200 ? setPhotoFlag(true) : setPhotoFlag(false);
        }, 200);
      })
      .catch((err) => {
        console.log("Something went wrong ", err);
      });
  }, [photoFlag]);

  return (
    <div
      className={style.container}
      style={{
        backgroundColor: iconColorConfig?.bColorForOptions,
        borderBottomColor: isDarkMode ? "#333943" : "whitesmoke",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDarkMode
          ? "#121923"
          : "#f2f2f2";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor =
          iconColorConfig?.bColorForOptions;
      }}
    >
      {photoURL ? (
        <Avatar
          className={style.userAvatar}
          src={
            photoFlag
              ? photoURL
              : "https://raw.githubusercontent.com/hirishu10/my-assets/main/react-login-ui/profile.png"
          }
          sx={{ width: 50, height: 50 }}
          onDoubleClick={(e) => {
            e.preventDefault();
            if (id !== "deskmobchatapp@gmail.com") {
              setDeleteFlag(!deleteFlag);
            }
          }}
        />
      ) : (
        <Avatar
          className={style.userAvatar}
          src={
            "https://raw.githubusercontent.com/hirishu10/my-assets/main/react-login-ui/profile.png"
          }
          sx={{ width: 50, height: 50 }}
          onDoubleClick={(e) => {
            e.preventDefault();
            if (id !== "deskmobchatapp@gmail.com") {
              setDeleteFlag(!deleteFlag);
            }
          }}
        >
          {name?.[0]}
        </Avatar>
      )}
      <div className={style.titleContainer} onClick={visitChatPage}>
        <p
          className={style.title}
          style={{
            color: iconColorConfig?.color,
          }}
        >
          {name}
        </p>
        <p
          className={style.title}
          style={{
            fontSize: 12,
            color: iconColorConfig?.color,
          }}
        >
          {id}
        </p>
      </div>
      {deleteFlag ? (
        <IconButton onClick={deleteButton}>
          <DeleteForeverIcon color={"error"} />
        </IconButton>
      ) : null}
    </div>
  );
}
export default ChatList;
